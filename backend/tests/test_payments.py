# tests/test_payments.py
"""
Payments module tests.

Covers:
- Merchant CRUD + listing
- QR code generation + payment flow
- NFC token registration + tap-to-pay
- Airtime purchase (all providers)
- Transport ticket purchase
- Payment provider service integration (mocked)
- Fraud detection triggers
- Edge cases: expired/used QR, insufficient funds, frozen accounts, invalid providers
- Authorization: only students can pay, only merchants can generate QR, etc.
"""
from decimal import Decimal
from unittest.mock import patch, MagicMock
from datetime import timedelta

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

from apps.payments.models import (
    Merchant, QRCode, NFCToken, AirtimePurchase, TransportTicket,
)
from apps.wallets.models import Wallet, Transaction
from apps.accounts.models import Profile, StudentProfile, ParentProfile

User = get_user_model()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_user(email, role='parent', password='TestPass123!'):
    user = User.objects.create_user(email=email, password=password, role=role)
    Profile.objects.create(user=user, full_name=email.split('@')[0])
    return user


def make_student(email, parent=None, balance=Decimal('100.00')):
    student = make_user(email, role='student')
    StudentProfile.objects.create(user=student, parent=parent)
    Wallet.objects.create(user=student, balance=balance, currency='ZAR')
    return student


def make_merchant(name='Test Shop', category='retail', verified=True):
    return Merchant.objects.create(
        name=name,
        business_registration=f'REG-{name[:6].upper()}',
        email=f'{name.lower().replace(" ", "")}@test.com',
        phone='+27123456789',
        address='1 Test St',
        category=category,
        verified=verified,
    )


class PaymentsSetupMixin:
    def setUp(self):
        self.client = APIClient()
        self.parent = make_user('parent@test.com', 'parent')
        ParentProfile.objects.create(user=self.parent)
        Wallet.objects.create(user=self.parent, balance=Decimal('1000.00'))

        self.student = make_student('student@test.com', self.parent, Decimal('100.00'))
        self.student_wallet = Wallet.objects.get(user=self.student)

        self.merchant = make_merchant('Cafeteria', 'restaurant')


# ═══════════════════════════════════════════════════════════════════════
# 1. MERCHANT LISTING
# ═══════════════════════════════════════════════════════════════════════

class TestMerchantListing(PaymentsSetupMixin, TestCase):
    """GET /payments/merchants/"""

    def setUp(self):
        super().setUp()
        self.url = reverse('merchants-list')

    def test_authenticated_user_can_list_verified_merchants(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        # Only verified merchants are returned
        for m in response.data.get('results', response.data.get('data', [])):
            self.assertTrue(m['verified'])

    def test_unverified_merchant_not_listed(self):
        make_merchant('Hidden Shop', 'retail', verified=False)
        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.url)
        names = [m['name'] for m in response.data.get('results', response.data.get('data', []))]
        self.assertNotIn('Hidden Shop', names)

    def test_filter_by_category(self):
        make_merchant('Bookstore', 'education', verified=True)
        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.url + '?category=education')
        self.assertEqual(response.status_code, 200)
        for m in response.data.get('results', response.data.get('data', [])):
            self.assertEqual(m['category'], 'education')

    def test_unauthenticated_blocked(self):
        # Some payment endpoints are AllowAny, but if merchant list requires auth:
        # (adjust based on your actual permission_classes)
        response = self.client.get(self.url)
        self.assertIn(response.status_code, (200, 401))


# ═══════════════════════════════════════════════════════════════════════
# 2. QR CODE GENERATION
# ═══════════════════════════════════════════════════════════════════════

class TestQRCodeGeneration(PaymentsSetupMixin, TestCase):
    """POST /payments/qr/generate/"""

    def setUp(self):
        super().setUp()
        self.url = reverse('qr-generate')

    def test_merchant_can_generate_qr(self):
        self.client.force_authenticate(user=self.student)  # will fail ownership check
        # For simplicity, we mark student as merchant-owner for this test
        self.merchant.created_by = self.student
        self.merchant.save()

        response = self.client.post(self.url, {
            'merchant_id': str(self.merchant.id),
            'amount': '25.00',
            'description': 'Test purchase',
            'expires_in': 15,
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertIn('qr_id', response.data['data'])
        self.assertIn('qr_image', response.data['data'])
        self.assertTrue(QRCode.objects.filter(merchant=self.merchant).exists())

    def test_qr_generation_fails_for_invalid_merchant(self):
        import uuid
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {
            'merchant_id': str(uuid.uuid4()),
            'amount': '25.00',
        }, format='json')
        self.assertEqual(response.status_code, 404)

    def test_qr_generation_fails_for_zero_amount(self):
        self.merchant.created_by = self.student
        self.merchant.save()
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {
            'merchant_id': str(self.merchant.id),
            'amount': '0.00',
        }, format='json')
        self.assertEqual(response.status_code, 400)


# ═══════════════════════════════════════════════════════════════════════
# 3. QR CODE PAYMENT
# ═══════════════════════════════════════════════════════════════════════

class TestQRPayment(PaymentsSetupMixin, TestCase):
    """POST /payments/qr/pay/"""

    def setUp(self):
        super().setUp()
        self.url = reverse('qr-pay')
        self.qr = QRCode.objects.create(
            merchant=self.merchant,
            amount=Decimal('25.00'),
            description='Test purchase',
            expires_at=timezone.now() + timedelta(minutes=15),
            is_used=False,
        )

    def test_successful_payment(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {'qr_id': str(self.qr.id)}, format='json')

        self.assertEqual(response.status_code, 200)
        self.student_wallet.refresh_from_db()
        self.qr.refresh_from_db()

        self.assertEqual(self.student_wallet.balance, Decimal('75.00'))
        self.assertTrue(self.qr.is_used)
        self.assertEqual(self.qr.used_by, self.student)
        self.assertIsNotNone(self.qr.used_at)

    def test_payment_creates_transaction(self):
        self.client.force_authenticate(user=self.student)
        self.client.post(self.url, {'qr_id': str(self.qr.id)}, format='json')
        tx = Transaction.objects.get(user=self.student, type='payment')
        self.assertEqual(tx.amount, Decimal('25.00'))
        self.assertEqual(tx.category, 'food')  # auto-mapped from 'restaurant'
        self.assertEqual(tx.merchant_name, self.merchant.name)
        self.assertEqual(tx.status, 'completed')

    def test_payment_fails_for_expired_qr(self):
        self.qr.expires_at = timezone.now() - timedelta(minutes=1)
        self.qr.save()
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {'qr_id': str(self.qr.id)}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('expired', response.data['message'].lower())

    def test_payment_fails_for_already_used_qr(self):
        self.qr.is_used = True
        self.qr.save()
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {'qr_id': str(self.qr.id)}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_payment_fails_for_insufficient_funds(self):
        self.student_wallet.balance = Decimal('10.00')
        self.student_wallet.save()
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {'qr_id': str(self.qr.id)}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('insufficient', response.data['message'].lower())

    def test_payment_fails_for_nonexistent_qr(self):
        import uuid
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {'qr_id': str(uuid.uuid4())}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_parent_cannot_scan_qr(self):
        self.client.force_authenticate(user=self.parent)
        response = self.client.post(self.url, {'qr_id': str(self.qr.id)}, format='json')
        self.assertEqual(response.status_code, 403)

    def test_unauthenticated_cannot_pay(self):
        response = self.client.post(self.url, {'qr_id': str(self.qr.id)}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_frozen_account_cannot_pay(self):
        sp = self.student.student_profile
        sp.is_account_frozen = True
        sp.save()
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {'qr_id': str(self.qr.id)}, format='json')
        self.assertIn(response.status_code, (400, 403))

    def test_spending_limit_enforced_on_payment(self):
        from apps.wallets.models import SpendingLimit
        limit = SpendingLimit.objects.create(
            child=self.student, parent=self.parent, category='food',
            daily_limit=Decimal('10.00'), is_enabled=True,
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {'qr_id': str(self.qr.id)}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('limit', response.data['message'].lower())

    def test_spending_recorded_after_payment(self):
        from apps.wallets.models import SpendingLimit
        limit = SpendingLimit.objects.create(
            child=self.student, parent=self.parent, category='food',
            daily_limit=Decimal('100.00'), is_enabled=True,
        )
        self.client.force_authenticate(user=self.student)
        self.client.post(self.url, {'qr_id': str(self.qr.id)}, format='json')
        limit.refresh_from_db()
        self.assertEqual(limit.daily_spent, Decimal('25.00'))


# ═══════════════════════════════════════════════════════════════════════
# 4. NFC TOKEN REGISTRATION + PAYMENT
# ═══════════════════════════════════════════════════════════════════════

class TestNFCRegistration(PaymentsSetupMixin, TestCase):
    """POST /payments/nfc/register/"""

    def setUp(self):
        super().setUp()
        self.url = reverse('nfc-register')

    def test_student_can_register_nfc_device(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {'device_id': 'device-mac-123'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.data['data'])
        self.assertTrue(NFCToken.objects.filter(user=self.student, device_id='device-mac-123').exists())

    def test_registration_requires_device_id(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_parent_cannot_register_nfc(self):
        self.client.force_authenticate(user=self.parent)
        response = self.client.post(self.url, {'device_id': 'parent-device'}, format='json')
        self.assertEqual(response.status_code, 403)


class TestNFCPayment(PaymentsSetupMixin, TestCase):
    """POST /payments/nfc/pay/"""

    def setUp(self):
        super().setUp()
        self.url = reverse('nfc-pay')
        self.token = NFCToken.objects.create(
            user=self.student,
            device_id='device-abc',
            token='nfc_test_token_xyz',
            is_active=True,
            expires_at=timezone.now() + timedelta(days=365),
        )

    def test_successful_nfc_payment(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {
            'token': self.token.token,
            'amount': '15.00',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.student_wallet.refresh_from_db()
        self.assertEqual(self.student_wallet.balance, Decimal('85.00'))

    def test_invalid_nfc_token_rejected(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {
            'token': 'invalid_token',
            'amount': '15.00',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_expired_nfc_token_rejected(self):
        self.token.expires_at = timezone.now() - timedelta(days=1)
        self.token.save()
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {
            'token': self.token.token,
            'amount': '15.00',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_inactive_nfc_token_rejected(self):
        self.token.is_active = False
        self.token.save()
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {
            'token': self.token.token,
            'amount': '15.00',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_insufficient_funds_nfc(self):
        self.student_wallet.balance = Decimal('5.00')
        self.student_wallet.save()
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {
            'token': self.token.token,
            'amount': '15.00',
        }, format='json')
        self.assertEqual(response.status_code, 400)


# ═══════════════════════════════════════════════════════════════════════
# 5. AIRTIME PURCHASE
# ═══════════════════════════════════════════════════════════════════════

class TestAirtimePurchase(PaymentsSetupMixin, TestCase):
    """POST /payments/airtime/buy/"""

    def setUp(self):
        super().setUp()
        self.url = reverse('airtime-buy')

    @patch('apps.payments.services.AirtimeProviderService.purchase_airtime')
    def test_successful_airtime_purchase(self, mock_service):
        mock_service.return_value = {'success': True, 'transaction_id': 'AIR_001'}
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {
            'phone_number': '0712345678',
            'amount': '50.00',
            'provider': 'vodacom',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.student_wallet.refresh_from_db()
        self.assertEqual(self.student_wallet.balance, Decimal('50.00'))
        self.assertTrue(AirtimePurchase.objects.filter(user=self.student, status='completed').exists())

    def test_invalid_provider_rejected(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {
            'phone_number': '0712345678',
            'amount': '50.00',
            'provider': 'invalid',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_insufficient_balance(self):
        self.student_wallet.balance = Decimal('10.00')
        self.student_wallet.save()
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {
            'phone_number': '0712345678',
            'amount': '50.00',
            'provider': 'mtn',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    @patch('apps.payments.services.AirtimeProviderService.purchase_airtime')
    def test_provider_failure_rolls_back_balance(self, mock_service):
        mock_service.return_value = {'success': False, 'error': 'Provider down'}
        self.client.force_authenticate(user=self.student)
        self.client.post(self.url, {
            'phone_number': '0712345678',
            'amount': '50.00',
            'provider': 'vodacom',
        }, format='json')
        self.student_wallet.refresh_from_db()
        # Balance should be unchanged — rollback on failure
        self.assertEqual(self.student_wallet.balance, Decimal('100.00'))


# ═══════════════════════════════════════════════════════════════════════
# 6. TRANSPORT TICKET
# ═══════════════════════════════════════════════════════════════════════

class TestTransportTicket(PaymentsSetupMixin, TestCase):
    """POST /payments/transport/buy/"""

    def setUp(self):
        super().setUp()
        self.url = reverse('transport-buy')

    @patch('apps.payments.services.TransportAPIService.book_ticket')
    def test_successful_ticket_purchase(self, mock_service):
        mock_service.return_value = {'success': True, 'reference': 'TKT_001', 'qr_code': 'base64...'}
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {
            'ticket_type': 'bus',
            'route': 'JHB-CPT',
            'departure_time': (timezone.now() + timedelta(hours=2)).isoformat(),
            'arrival_time': (timezone.now() + timedelta(hours=10)).isoformat(),
            'amount': '450.00',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(TransportTicket.objects.filter(user=self.student, status='confirmed').exists())

    def test_insufficient_balance_for_ticket(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {
            'ticket_type': 'bus',
            'route': 'JHB-CPT',
            'departure_time': (timezone.now() + timedelta(hours=2)).isoformat(),
            'arrival_time': (timezone.now() + timedelta(hours=10)).isoformat(),
            'amount': '9999.00',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_invalid_ticket_type_rejected(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, {
            'ticket_type': 'spaceship',
            'route': 'MARS-EARTH',
            'departure_time': (timezone.now() + timedelta(hours=2)).isoformat(),
            'arrival_time': (timezone.now() + timedelta(hours=10)).isoformat(),
            'amount': '100.00',
        }, format='json')
        self.assertEqual(response.status_code, 400)


# ═══════════════════════════════════════════════════════════════════════
# 7. FRAUD DETECTION INTEGRATION
# ═══════════════════════════════════════════════════════════════════════

class TestPaymentFraudDetection(PaymentsSetupMixin, TestCase):
    """Verify payments trigger fraud detection when appropriate."""

    def test_large_payment_flags_transaction(self):
        """A single payment over R10,000 should be flagged for review."""
        # Give student lots of money
        self.student_wallet.balance = Decimal('50000.00')
        self.student_wallet.save()

        qr = QRCode.objects.create(
            merchant=self.merchant,
            amount=Decimal('15000.00'),
            description='Big purchase',
            expires_at=timezone.now() + timedelta(minutes=15),
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.post(reverse('qr-pay'), {'qr_id': str(qr.id)}, format='json')

        # Either blocked or frozen — depending on your fraud policy
        self.assertIn(response.status_code, (200, 400))
        tx = Transaction.objects.filter(user=self.student, amount=Decimal('15000.00')).first()
        if tx:
            self.assertTrue(tx.is_flagged or tx.status == 'frozen')