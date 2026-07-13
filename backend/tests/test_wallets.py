# tests/test_wallets.py
<<<<<<< HEAD
from decimal import Decimal
=======
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
<<<<<<< HEAD
from apps.wallets.models import Wallet, Transaction, SpendingLimit, MoneyRequest
from apps.wallets.services import WalletService, CategoryService, SpendingLimitEnforcer
from apps.accounts.models import Profile, StudentProfile, ParentProfile
=======
from apps.wallets.models import Wallet, Transaction
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a

User = get_user_model()


<<<<<<< HEAD
def make_user(email, role='parent', password='TestPass123!'):
    """Helper to create a user with profile."""
    user = User.objects.create_user(email=email, password=password, role=role)
    Profile.objects.create(user=user, full_name=email.split('@')[0])
    return user


def make_student(email, parent, balance=Decimal('100.00')):
    """Helper to create a student linked to a parent with a wallet."""
    student = make_user(email, role='student')
    StudentProfile.objects.create(user=student, parent=parent)
    Wallet.objects.create(user=student, balance=balance, currency='ZAR')
    return student


class TestSetupMixin:
    """Shared setUp for all test cases."""
=======
class WalletsTestCase(TestCase):
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a

    def setUp(self):
        self.client = APIClient()

<<<<<<< HEAD
        self.parent = make_user('parent@test.com', role='parent')
        ParentProfile.objects.create(user=self.parent)
        self.parent_wallet = Wallet.objects.create(
            user=self.parent, balance=Decimal('1000.00'), currency='ZAR'
        )

        self.student = make_student('student@test.com', self.parent, Decimal('100.00'))
        self.student_wallet = Wallet.objects.get(user=self.student)


# ---------------------------------------------------------------------------
# Category Service Tests
# ---------------------------------------------------------------------------

class TestCategoryService(TestCase):

    def test_valid_category_passes(self):
        self.assertEqual(CategoryService.validate('food'), 'food')
        self.assertEqual(CategoryService.validate('transport'), 'transport')
        self.assertEqual(CategoryService.validate('other'), 'other')

    def test_invalid_category_raises(self):
        with self.assertRaises(ValueError) as ctx:
            CategoryService.validate('groceries')
        self.assertIn('groceries', str(ctx.exception))
        self.assertIn('Invalid category', str(ctx.exception))

    def test_merchant_to_transaction_mapping(self):
        self.assertEqual(CategoryService.from_merchant('restaurant'), 'food')
        self.assertEqual(CategoryService.from_merchant('retail'), 'shopping')
        self.assertEqual(CategoryService.from_merchant('transport'), 'transport')
        self.assertEqual(CategoryService.from_merchant('entertainment'), 'entertainment')
        self.assertEqual(CategoryService.from_merchant('education'), 'education')
        self.assertEqual(CategoryService.from_merchant('healthcare'), 'health')
        self.assertEqual(CategoryService.from_merchant('airtime'), 'airtime')

    def test_unknown_merchant_defaults_to_other(self):
        self.assertEqual(CategoryService.from_merchant('unknown'), 'other')

    def test_resolve_uses_explicit_category(self):
        result = CategoryService.resolve(category='food', merchant_category='retail')
        self.assertEqual(result, 'food')

    def test_resolve_falls_back_to_merchant_when_other(self):
        result = CategoryService.resolve(category='other', merchant_category='restaurant')
        self.assertEqual(result, 'food')

    def test_resolve_defaults_to_other_when_nothing_provided(self):
        result = CategoryService.resolve()
        self.assertEqual(result, 'other')


# ---------------------------------------------------------------------------
# Wallet Service Tests
# ---------------------------------------------------------------------------

class TestWalletService(TestSetupMixin, TestCase):

    def test_transfer_updates_both_balances(self):
        WalletService.transfer(self.parent, self.student, Decimal('50.00'))
        self.parent_wallet.refresh_from_db()
        self.student_wallet.refresh_from_db()
        self.assertEqual(self.parent_wallet.balance, Decimal('950.00'))
        self.assertEqual(self.student_wallet.balance, Decimal('150.00'))

    def test_transfer_creates_two_transaction_records(self):
        WalletService.transfer(self.parent, self.student, Decimal('50.00'))
        self.assertEqual(Transaction.objects.filter(user=self.parent).count(), 1)
        self.assertEqual(Transaction.objects.filter(user=self.student).count(), 1)

    def test_transfer_raises_on_insufficient_balance(self):
        with self.assertRaises(ValueError) as ctx:
            WalletService.transfer(self.parent, self.student, Decimal('9999.00'))
        self.assertIn('Insufficient', str(ctx.exception))

    def test_transfer_does_not_modify_balances_on_failure(self):
        try:
            WalletService.transfer(self.parent, self.student, Decimal('9999.00'))
        except ValueError:
            pass
        self.parent_wallet.refresh_from_db()
        self.student_wallet.refresh_from_db()
        self.assertEqual(self.parent_wallet.balance, Decimal('1000.00'))
        self.assertEqual(self.student_wallet.balance, Decimal('100.00'))

    def test_deposit_credits_wallet(self):
        WalletService.deposit(self.parent, Decimal('500.00'), reference_id='PAY_001')
        self.parent_wallet.refresh_from_db()
        self.assertEqual(self.parent_wallet.balance, Decimal('1500.00'))

    def test_deposit_creates_transaction_record(self):
        WalletService.deposit(self.parent, Decimal('500.00'), reference_id='PAY_001')
        tx = Transaction.objects.get(user=self.parent, type='deposit')
        self.assertEqual(tx.amount, Decimal('500.00'))
        self.assertEqual(tx.status, 'completed')

    def test_deduct_reduces_balance(self):
        WalletService.deduct(self.student, Decimal('30.00'), category='food')
        self.student_wallet.refresh_from_db()
        self.assertEqual(self.student_wallet.balance, Decimal('70.00'))

    def test_deduct_raises_on_insufficient_balance(self):
        with self.assertRaises(ValueError):
            WalletService.deduct(self.student, Decimal('500.00'), category='food')

    def test_deduct_assigns_correct_category(self):
        WalletService.deduct(self.student, Decimal('20.00'), category='transport')
        tx = Transaction.objects.get(user=self.student)
        self.assertEqual(tx.category, 'transport')

    def test_deduct_auto_maps_merchant_category(self):
        WalletService.deduct(
            self.student, Decimal('20.00'),
            merchant_category='restaurant'
        )
        tx = Transaction.objects.get(user=self.student)
        self.assertEqual(tx.category, 'food')

    def test_get_balance_returns_current_balance(self):
        balance = WalletService.get_balance(self.parent)
        self.assertEqual(balance, Decimal('1000.00'))


# ---------------------------------------------------------------------------
# Spending Limit Enforcement Tests
# ---------------------------------------------------------------------------

class TestSpendingLimitEnforcer(TestSetupMixin, TestCase):

    def _make_limit(self, category='food', daily=100, weekly=300, monthly=500):
        return SpendingLimit.objects.create(
            child=self.student,
            parent=self.parent,
            category=category,
            daily_limit=Decimal(str(daily)),
            weekly_limit=Decimal(str(weekly)),
            monthly_limit=Decimal(str(monthly)),
            is_enabled=True
        )

    def test_enforce_passes_when_within_daily_limit(self):
        self._make_limit(daily=100)
        # Should not raise
        SpendingLimitEnforcer.enforce(self.student, Decimal('50.00'), 'food')

    def test_enforce_blocks_when_daily_limit_exceeded(self):
        limit = self._make_limit(daily=100)
        limit.daily_spent = Decimal('80.00')
        limit.save()
        with self.assertRaises(SpendingLimitEnforcer.SpendingLimitExceeded) as ctx:
            SpendingLimitEnforcer.enforce(self.student, Decimal('30.00'), 'food')
        self.assertEqual(ctx.exception.limit_type, 'daily')

    def test_enforce_blocks_when_weekly_limit_exceeded(self):
        limit = self._make_limit(weekly=300)
        limit.weekly_spent = Decimal('280.00')
        limit.save()
        with self.assertRaises(SpendingLimitEnforcer.SpendingLimitExceeded) as ctx:
            SpendingLimitEnforcer.enforce(self.student, Decimal('30.00'), 'food')
        self.assertEqual(ctx.exception.limit_type, 'weekly')

    def test_enforce_blocks_when_monthly_limit_exceeded(self):
        limit = self._make_limit(monthly=500)
        limit.monthly_spent = Decimal('480.00')
        limit.save()
        with self.assertRaises(SpendingLimitEnforcer.SpendingLimitExceeded) as ctx:
            SpendingLimitEnforcer.enforce(self.student, Decimal('30.00'), 'food')
        self.assertEqual(ctx.exception.limit_type, 'monthly')

    def test_enforce_passes_when_no_limit_set(self):
        # No SpendingLimit record — should allow
        SpendingLimitEnforcer.enforce(self.student, Decimal('500.00'), 'food')

    def test_enforce_passes_when_limit_disabled(self):
        limit = self._make_limit(daily=50)
        limit.is_enabled = False
        limit.save()
        SpendingLimitEnforcer.enforce(self.student, Decimal('100.00'), 'food')

    def test_enforce_does_not_apply_to_parents(self):
        self._make_limit(daily=10)
        # Parent should never be blocked by spending limits
        SpendingLimitEnforcer.enforce(self.parent, Decimal('9999.00'), 'food')

    def test_record_updates_all_spent_amounts(self):
        self._make_limit()
        SpendingLimitEnforcer.record(self.student, Decimal('40.00'), 'food')
        limit = SpendingLimit.objects.get(child=self.student, category='food')
        self.assertEqual(limit.daily_spent, Decimal('40.00'))
        self.assertEqual(limit.weekly_spent, Decimal('40.00'))
        self.assertEqual(limit.monthly_spent, Decimal('40.00'))

    def test_record_accumulates_multiple_payments(self):
        self._make_limit()
        SpendingLimitEnforcer.record(self.student, Decimal('20.00'), 'food')
        SpendingLimitEnforcer.record(self.student, Decimal('15.00'), 'food')
        limit = SpendingLimit.objects.get(child=self.student, category='food')
        self.assertEqual(limit.daily_spent, Decimal('35.00'))

    def test_deduct_enforces_limit_end_to_end(self):
        """Full integration: deduct() should enforce limits and record spending."""
        limit = self._make_limit(daily=50)
        limit.daily_spent = Decimal('40.00')
        limit.save()

        with self.assertRaises(SpendingLimitEnforcer.SpendingLimitExceeded):
            WalletService.deduct(self.student, Decimal('20.00'), category='food')

        # Balance should be unchanged
        self.student_wallet.refresh_from_db()
        self.assertEqual(self.student_wallet.balance, Decimal('100.00'))


# ---------------------------------------------------------------------------
# Transfer Funds API Tests
# ---------------------------------------------------------------------------

class TestTransferFundsView(TestSetupMixin, TestCase):

    def setUp(self):
        super().setUp()
        self.url = reverse('transfer-funds')

    def test_transfer_success(self):
        self.client.force_authenticate(user=self.parent)
        response = self.client.post(self.url, {
            'recipient_id': str(self.student.id),
            'amount': '50.00',
            'description': 'Allowance'
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.parent_wallet.refresh_from_db()
        self.student_wallet.refresh_from_db()
        self.assertEqual(self.parent_wallet.balance, Decimal('950.00'))
        self.assertEqual(self.student_wallet.balance, Decimal('150.00'))

    def test_transfer_insufficient_balance(self):
        self.client.force_authenticate(user=self.parent)
        response = self.client.post(self.url, {
            'recipient_id': str(self.student.id),
            'amount': '9999.00'
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('Insufficient', response.data['message'])

    def test_transfer_blocked_for_students(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {
            'recipient_id': str(self.parent.id),
            'amount': '10.00'
        }, format='json')
        self.assertEqual(response.status_code, 403)

    def test_transfer_blocked_unauthenticated(self):
        response = self.client.post(self.url, {
            'recipient_id': str(self.student.id),
            'amount': '10.00'
        }, format='json')
        self.assertEqual(response.status_code, 401)

    def test_transfer_to_unlinked_child_blocked(self):
        other_student = make_student('other@test.com', self.parent)
        other_parent = make_user('other_parent@test.com', role='parent')
        ParentProfile.objects.create(user=other_parent)
        Wallet.objects.create(user=other_parent, balance=Decimal('500.00'))

        self.client.force_authenticate(user=other_parent)
        response = self.client.post(self.url, {
            'recipient_id': str(self.student.id),
            'amount': '10.00'
        }, format='json')
        self.assertEqual(response.status_code, 403)

    def test_transfer_blocked_to_frozen_account(self):
        sp = self.student.student_profile
        sp.is_account_frozen = True
        sp.save()

        self.client.force_authenticate(user=self.parent)
        response = self.client.post(self.url, {
            'recipient_id': str(self.student.id),
            'amount': '50.00'
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('frozen', response.data['message'])


# ---------------------------------------------------------------------------
# Children Management API Tests
# ---------------------------------------------------------------------------

class TestChildrenView(TestSetupMixin, TestCase):

    def setUp(self):
        super().setUp()
        self.list_url = reverse('children-list')

    def test_list_children_returns_linked_children(self):
        self.client.force_authenticate(user=self.parent)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['email'], 'student@test.com')

    def test_add_child_creates_user_profile_wallet(self):
        self.client.force_authenticate(user=self.parent)
        response = self.client.post(self.list_url, {
            'email': 'newkid@test.com',
            'full_name': 'New Kid',
            'grade': 8,
            'school_name': 'Test High'
        }, format='json')
        self.assertEqual(response.status_code, 201)

        child = User.objects.get(email='newkid@test.com')
        self.assertEqual(child.role, 'student')
        self.assertTrue(hasattr(child, 'profile'))
        self.assertTrue(hasattr(child, 'student_profile'))
        self.assertTrue(hasattr(child, 'wallet'))
        self.assertEqual(child.student_profile.parent, self.parent)

    def test_add_child_duplicate_email_fails(self):
        self.client.force_authenticate(user=self.parent)
        response = self.client.post(self.list_url, {
            'email': 'student@test.com',
            'full_name': 'Duplicate'
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_students_cannot_list_children(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 403)


# ---------------------------------------------------------------------------
# Freeze / Unfreeze Account Tests
# ---------------------------------------------------------------------------

class TestFreezeAccount(TestSetupMixin, TestCase):

    def test_freeze_account(self):
        self.client.force_authenticate(user=self.parent)
        url = reverse('freeze-account', kwargs={'child_id': self.student.id})
        response = self.client.post(url, {'freeze_reason': 'Lost phone'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.student.student_profile.refresh_from_db()
        self.assertTrue(self.student.student_profile.is_account_frozen)
        self.assertEqual(self.student.student_profile.freeze_reason, 'Lost phone')

    def test_unfreeze_account(self):
        sp = self.student.student_profile
        sp.is_account_frozen = True
        sp.freeze_reason = 'Test'
        sp.save()

        self.client.force_authenticate(user=self.parent)
        url = reverse('unfreeze-account', kwargs={'child_id': self.student.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        sp.refresh_from_db()
        self.assertFalse(sp.is_account_frozen)

    def test_freeze_wrong_child_blocked(self):
        other_parent = make_user('other@test.com', role='parent')
        ParentProfile.objects.create(user=other_parent)
        self.client.force_authenticate(user=other_parent)
        url = reverse('freeze-account', kwargs={'child_id': self.student.id})
        response = self.client.post(url, {'freeze_reason': 'Test'}, format='json')
        self.assertEqual(response.status_code, 403)


# ---------------------------------------------------------------------------
# Money Request Tests
# ---------------------------------------------------------------------------

class TestMoneyRequests(TestSetupMixin, TestCase):

    def test_student_can_create_money_request(self):
        self.client.force_authenticate(user=self.student)
        url = reverse('student-money-requests-list')
        response = self.client.post(url, {
            'amount': '50.00',
            'reason': 'School supplies'
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(MoneyRequest.objects.filter(child=self.student).exists())

    def test_parent_can_approve_money_request(self):
        request = MoneyRequest.objects.create(
            child=self.student,
            parent=self.parent,
            amount=Decimal('50.00'),
            reason='Books',
            status='pending'
        )
        self.client.force_authenticate(user=self.parent)
        url = reverse('approve-request')
        response = self.client.post(url, {
            'request_id': str(request.id),
            'action': 'approve'
        }, format='json')
        self.assertEqual(response.status_code, 200)
        request.refresh_from_db()
        self.assertEqual(request.status, 'approved')
        self.parent_wallet.refresh_from_db()
        self.student_wallet.refresh_from_db()
        self.assertEqual(self.parent_wallet.balance, Decimal('950.00'))
        self.assertEqual(self.student_wallet.balance, Decimal('150.00'))

    def test_parent_can_decline_money_request(self):
        request = MoneyRequest.objects.create(
            child=self.student,
            parent=self.parent,
            amount=Decimal('50.00'),
            reason='Games',
            status='pending'
        )
        self.client.force_authenticate(user=self.parent)
        url = reverse('approve-request')
        response = self.client.post(url, {
            'request_id': str(request.id),
            'action': 'decline',
            'parent_notes': 'Not now'
        }, format='json')
        self.assertEqual(response.status_code, 200)
        request.refresh_from_db()
        self.assertEqual(request.status, 'declined')
        # Balances unchanged
        self.parent_wallet.refresh_from_db()
        self.assertEqual(self.parent_wallet.balance, Decimal('1000.00'))

    def test_approve_fails_with_insufficient_parent_balance(self):
        request = MoneyRequest.objects.create(
            child=self.student,
            parent=self.parent,
            amount=Decimal('9999.00'),
            reason='Too much',
            status='pending'
        )
        self.client.force_authenticate(user=self.parent)
        url = reverse('approve-request')
        response = self.client.post(url, {
            'request_id': str(request.id),
            'action': 'approve'
        }, format='json')
        self.assertEqual(response.status_code, 400)
        request.refresh_from_db()
        self.assertEqual(request.status, 'pending')

    def test_parent_cannot_create_money_request(self):
        self.client.force_authenticate(user=self.parent)
        url = reverse('student-money-requests-list')
        response = self.client.post(url, {
            'amount': '50.00',
            'reason': 'Test'
        }, format='json')
        self.assertEqual(response.status_code, 403)


# ---------------------------------------------------------------------------
# Wallet & Transaction List/Detail Tests
# ---------------------------------------------------------------------------

class TestWalletAndTransactionViews(TestSetupMixin, TestCase):

    def test_parent_can_view_own_wallet(self):
        self.client.force_authenticate(user=self.parent)
        url = reverse('wallet-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_parent_can_view_child_wallet(self):
        self.client.force_authenticate(user=self.parent)
        url = reverse('wallet-detail', kwargs={'pk': self.student_wallet.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_student_cannot_view_parent_wallet(self):
        self.client.force_authenticate(user=self.student)
        url = reverse('wallet-detail', kwargs={'pk': self.parent_wallet.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)

    def test_transaction_list_returns_own_transactions(self):
        WalletService.transfer(self.parent, self.student, Decimal('50.00'))
        self.client.force_authenticate(user=self.student)
        url = reverse('transactions-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 1)

    def test_transaction_filter_by_category(self):
        WalletService.deduct(self.student, Decimal('20.00'), category='food')
        WalletService.deduct(self.student, Decimal('10.00'), category='transport')
        self.client.force_authenticate(user=self.student)
        url = reverse('transactions-list') + '?category=food'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        for tx in response.data['results']:
            self.assertEqual(tx['category'], 'food')

    def test_categories_endpoint_returns_all_categories(self):
        self.client.force_authenticate(user=self.parent)
        url = reverse('transaction-categories')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        values = [c['value'] for c in response.data['data']]
        self.assertIn('food', values)
        self.assertIn('transport', values)
        self.assertIn('education', values)
        self.assertEqual(len(values), 9)
=======
        # Create parent user
        self.parent = User.objects.create_user(
            email='parent@test.com',
            password='TestPass123!',
            role='parent'
        )
        self.parent_wallet = Wallet.objects.create(user=self.parent, balance=1000)

        # Create student user
        self.student = User.objects.create_user(
            email='student@test.com',
            password='TestPass123!',
            role='student'
        )
        self.student_wallet = Wallet.objects.create(user=self.student, balance=100)

        # Link student to parent
        from apps.accounts.models import StudentProfile
        StudentProfile.objects.create(user=self.student, parent=self.parent)

        self.transfer_url = reverse('transfer-funds')

    def test_transfer_funds(self):
        """Test fund transfer from parent to child"""
        self.client.force_authenticate(user=self.parent)

        response = self.client.post(self.transfer_url, {
            'recipient_id': str(self.student.id),
            'amount': 50.00,
            'description': 'Weekly allowance'
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.parent_wallet.refresh_from_db()
        self.student_wallet.refresh_from_db()

        self.assertEqual(self.parent_wallet.balance, 950.00)
        self.assertEqual(self.student_wallet.balance, 150.00)

    def test_insufficient_balance(self):
        """Test transfer with insufficient balance"""
        self.client.force_authenticate(user=self.parent)

        response = self.client.post(self.transfer_url, {
            'recipient_id': str(self.student.id),
            'amount': 2000.00,
            'description': 'Too much'
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('Insufficient', response.data['message'])

    def test_unauthorized_transfer(self):
        """Test unauthorized transfer attempt"""
        self.client.force_authenticate(user=self.student)

        response = self.client.post(self.transfer_url, {
            'recipient_id': str(self.parent.id),
            'amount': 50.00
        }, format='json')

        self.assertEqual(response.status_code, 403)
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
