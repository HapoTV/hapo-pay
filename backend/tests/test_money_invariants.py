# tests/test_money_invariants.py
"""Tests for the guarantees that protect money.

Every test here asserts that something BAD is prevented. That framing is
deliberate: the defects these cover all passed the existing happy-path suite
without complaint, because a missing control is silent by construction. A test
that only proves a payment succeeds cannot tell you that a frozen account, a
spent-out limit, or a double tap was also allowed through.
"""
import json
import threading
from collections import Counter
from datetime import timedelta
from decimal import Decimal

from django.db import IntegrityError, connections, transaction
from django.test import TestCase, TransactionTestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import Profile, StudentProfile, User
from apps.payments.models import NFCToken
from apps.wallets.models import IdempotencyRecord, SpendingLimit, Transaction, Wallet
from apps.wallets.services import LimitCheckerService

NFC_URL = '/api/v1/payments/nfc/pay/'


def make_family(suffix='', balance='1000'):
    parent = User.objects.create_user(email=f'parent{suffix}@test.com',
                                      password='x', role='parent')
    child = User.objects.create_user(email=f'child{suffix}@test.com',
                                     password='x', role='student')
    Profile.objects.create(user=parent, full_name='Parent')
    Profile.objects.create(user=child, full_name='Child')
    StudentProfile.objects.create(user=child, parent=parent)
    wallet = Wallet.objects.create(user=child, balance=Decimal(balance))
    return parent, child, wallet


class DatabaseInvariantTests(TestCase):
    """The constraints must hold against raw writes, not just through services.

    These use .update() and direct create() precisely because that is what
    bypasses every Python-level guard -- which is the scenario the constraints
    exist for.
    """

    def setUp(self):
        self.parent, self.child, self.wallet = make_family()

    def test_wallet_balance_cannot_go_negative(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Wallet.objects.filter(id=self.wallet.id).update(balance=Decimal('-0.01'))

    def test_transaction_amount_must_be_positive(self):
        for bad in (Decimal('0'), Decimal('-5')):
            with self.subTest(amount=bad):
                with self.assertRaises(IntegrityError):
                    with transaction.atomic():
                        Transaction.objects.create(
                            user=self.child, amount=bad, type='payment',
                            category='food', status='completed',
                        )

    def test_spending_limit_cannot_be_negative(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                SpendingLimit.objects.create(
                    child=self.child, parent=self.parent, category='food',
                    daily_limit=Decimal('-1'), weekly_limit=0, monthly_limit=0,
                )


class DerivedSpendingWindowTests(TestCase):
    """Spend is derived per window, so old history cannot block a child forever.

    The regression this locks down: daily_spent/weekly_spent/monthly_spent were
    stored counters that nothing reset, so `daily_spent` really meant "spent
    since account creation" and a child was permanently barred once their
    lifetime spend passed the daily limit.
    """

    def setUp(self):
        self.parent, self.child, self.wallet = make_family()
        SpendingLimit.objects.create(
            child=self.child, parent=self.parent, category='food',
            daily_limit=Decimal('100'), weekly_limit=Decimal('300'),
            monthly_limit=Decimal('1000'),
        )
        self.starts = LimitCheckerService.window_starts()

    def _spend(self, amount, at=None, status='completed',
               category='food', ttype='payment'):
        txn = Transaction.objects.create(
            user=self.child, amount=Decimal(amount), type=ttype,
            category=category, status=status,
        )
        if at is not None:
            Transaction.objects.filter(id=txn.id).update(created_at=at)
        return txn

    def test_spend_outside_the_window_is_excluded(self):
        self._spend('40', at=self.starts['daily'] + timedelta(hours=1))
        self._spend('500', at=self.starts['monthly'] - timedelta(days=1))

        spent = LimitCheckerService.spent_in_windows(self.child, 'food')
        self.assertEqual(spent['daily'], Decimal('40'))
        self.assertEqual(spent['monthly'], Decimal('40'))

    def test_lifetime_history_no_longer_blocks_a_child(self):
        # Far more than any limit, but all of it outside every window.
        for day in range(40, 80):
            self._spend('30', at=self.starts['monthly'] - timedelta(days=day))

        self.assertTrue(
            LimitCheckerService.check_spending_limit(self.child, Decimal('50'), 'food')
        )

    def test_incoming_transfers_do_not_consume_the_limit(self):
        # Both sides of a transfer are type='transfer'; counting them would make
        # a parent topping up the wallet eat into the child's own limit.
        self._spend('900', ttype='transfer')
        spent = LimitCheckerService.spent_in_windows(self.child, 'food')
        self.assertEqual(spent['daily'], Decimal('0'))

    def test_pending_spend_does_not_count(self):
        self._spend('900', status='pending')
        spent = LimitCheckerService.spent_in_windows(self.child, 'food')
        self.assertEqual(spent['daily'], Decimal('0'))

    def test_limit_boundary_is_inclusive(self):
        self._spend('40', at=self.starts['daily'] + timedelta(hours=1))
        self.assertTrue(
            LimitCheckerService.check_spending_limit(self.child, Decimal('60'), 'food'),
            'spending exactly up to the limit must be allowed',
        )
        self.assertFalse(
            LimitCheckerService.check_spending_limit(
                self.child, Decimal('60.01'), 'food'),
            'one cent over the limit must be refused',
        )

    def test_spend_lookup_is_a_single_query(self):
        with self.assertNumQueries(1):
            LimitCheckerService.spent_in_windows(self.child, 'food')


class NFCLimitEnforcementTests(TestCase):
    """NFC must honour the same spending limit the QR path enforces.

    The regression: NFCPaymentView never called check_spending_limit at all, so
    a parent's category limit was bypassable simply by tapping instead of
    scanning. A control that covers only some routes to the same outcome is not
    a control.
    """

    def setUp(self):
        self.parent, self.child, self.wallet = make_family(balance='1000')
        NFCToken.objects.create(user=self.child, device_id='d1', token='tok-1',
                                expires_at=timezone.now() + timedelta(days=30))
        SpendingLimit.objects.create(
            child=self.child, parent=self.parent, category='other',
            daily_limit=Decimal('100'), weekly_limit=0, monthly_limit=0,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.child)

    def _pay(self, amount, key=None):
        extra = {'HTTP_IDEMPOTENCY_KEY': key} if key else {}
        return self.client.post(
            NFC_URL, {'token': 'tok-1', 'amount': str(amount)},
            format='json', **extra,
        )

    def test_tap_within_the_limit_succeeds(self):
        self.assertEqual(self._pay('60').status_code, 200)

    def test_tap_over_the_limit_is_refused_and_does_not_debit(self):
        self.assertEqual(self._pay('60').status_code, 200)

        before = Wallet.objects.get(id=self.wallet.id).balance
        response = self._pay('60')

        self.assertEqual(response.status_code, 403)
        self.assertEqual(Wallet.objects.get(id=self.wallet.id).balance, before,
                         'a refused payment must not move money')

    def test_frozen_account_cannot_tap(self):
        StudentProfile.objects.filter(user=self.child).update(
            is_account_frozen=True, freeze_reason='Card reported lost')
        before = Wallet.objects.get(id=self.wallet.id).balance

        response = self._pay('10')

        self.assertEqual(response.status_code, 403)
        self.assertEqual(Wallet.objects.get(id=self.wallet.id).balance, before)


class IdempotencyTests(TestCase):
    """A replayed request must not move money twice."""

    def setUp(self):
        self.parent, self.child, self.wallet = make_family(balance='1000')
        NFCToken.objects.create(user=self.child, device_id='d1', token='tok-1',
                                expires_at=timezone.now() + timedelta(days=30))
        self.client = APIClient()
        self.client.force_authenticate(user=self.child)

    def _pay(self, amount='50.00', key=None, token='tok-1'):
        extra = {'HTTP_IDEMPOTENCY_KEY': key} if key else {}
        return self.client.post(
            NFC_URL, {'token': token, 'amount': amount}, format='json', **extra,
        )

    def _balance(self):
        return Wallet.objects.get(id=self.wallet.id).balance

    def test_replay_with_same_key_charges_once(self):
        first = self._pay(key='intent-1')
        after_first = self._balance()
        second = self._pay(key='intent-1')

        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(self._balance(), after_first, 'replay must not debit again')
        self.assertEqual(Transaction.objects.filter(user=self.child).count(), 1)

    def test_replay_returns_the_original_response(self):
        first = self._pay(key='intent-2')
        second = self._pay(key='intent-2')
        first.render()
        second.render()
        # Parsed, not byte-compared: the stored body round-trips through
        # PostgreSQL jsonb, which normalises key order. JSON objects are
        # unordered, so this is semantic equality -- the value any client
        # actually reads.
        self.assertEqual(json.loads(second.content), json.loads(first.content))

    def test_distinct_keys_are_independent(self):
        self._pay(key='a')
        self._pay(key='b')
        self.assertEqual(Transaction.objects.filter(user=self.child).count(), 2)

    def test_reusing_a_key_with_a_different_body_is_rejected(self):
        self._pay(amount='50.00', key='intent-3')
        before = self._balance()

        response = self._pay(amount='75.00', key='intent-3')

        self.assertEqual(response.status_code, 422)
        self.assertEqual(self._balance(), before)

    def test_a_failed_attempt_does_not_consume_the_key(self):
        # Insufficient balance -> 400. The client must be able to correct the
        # problem and retry the same intent.
        failed = self._pay(amount='99999.00', key='intent-4')
        self.assertEqual(failed.status_code, 400)
        self.assertFalse(
            IdempotencyRecord.objects.filter(user=self.child, key='intent-4').exists())

        retried = self._pay(amount='10.00', key='intent-4')
        self.assertEqual(retried.status_code, 200)

    def test_keys_are_scoped_per_user(self):
        self._pay(key='shared-key')

        other_parent, other_child, _ = make_family(suffix='2', balance='500')
        NFCToken.objects.create(user=other_child, device_id='d2', token='tok-2',
                                expires_at=timezone.now() + timedelta(days=30))
        other = APIClient()
        other.force_authenticate(user=other_child)

        response = other.post(NFC_URL, {'token': 'tok-2', 'amount': '10.00'},
                              format='json', HTTP_IDEMPOTENCY_KEY='shared-key')

        self.assertEqual(response.status_code, 200,
                         "one user's key must not replay another user's response")


class ConcurrentDoubleTapTests(TransactionTestCase):
    """The case the reserve-before-execute ordering exists for.

    TransactionTestCase, not TestCase: this needs real committed transactions
    across threads, which TestCase's wrapping transaction would hide. This is
    the test that the naive check-then-run-then-store implementation fails.
    """

    reset_sequences = True

    def test_simultaneous_taps_with_one_key_charge_once(self):
        parent, child, wallet = make_family(suffix='-race', balance='1000')
        NFCToken.objects.create(user=child, device_id='d', token='race-tok',
                                expires_at=timezone.now() + timedelta(days=30))

        concurrency = 8
        barrier = threading.Barrier(concurrency)
        statuses = []

        def tap():
            try:
                barrier.wait(timeout=10)
                client = APIClient()
                client.force_authenticate(user=child)
                response = client.post(
                    NFC_URL, {'token': 'race-tok', 'amount': '100.00'},
                    format='json', HTTP_IDEMPOTENCY_KEY='one-intent',
                )
                statuses.append(response.status_code)
            finally:
                connections.close_all()

        threads = [threading.Thread(target=tap) for _ in range(concurrency)]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join(timeout=30)

        counts = Counter(statuses)
        self.assertEqual(Transaction.objects.filter(user=child).count(), 1,
                         f'expected exactly one charge, statuses were {dict(counts)}')
        self.assertEqual(Wallet.objects.get(id=wallet.id).balance, Decimal('900'))
        self.assertEqual(counts[200], 1, 'exactly one caller should win')
        self.assertEqual(counts[409], concurrency - 1,
                         'the rest must be told the intent is already in flight')
