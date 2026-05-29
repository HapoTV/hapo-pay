# tests/test_payments.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from apps.payments.models import Merchant, QRCode
from apps.wallets.models import Wallet

User = get_user_model()


class PaymentsTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

        # Create student
        self.student = User.objects.create_user(
            email='student@test.com',
            password='TestPass123!',
            role='student'
        )
        self.student_wallet = Wallet.objects.create(user=self.student, balance=100)

        # Create merchant
        self.merchant = Merchant.objects.create(
            name='Test Store',
            category='retail',
            email='store@test.com',
            phone='+27123456789',
            address='123 Test St',
            verified=True
        )

        # Create QR code
        self.qr = QRCode.objects.create(
            merchant=self.merchant,
            amount=25.00,
            description='Test purchase',
            expires_at=timezone.now() + timedelta(minutes=15)
        )

        self.qr_pay_url = reverse('qr-pay')

    def test_qr_payment(self):
        """Test QR code payment"""
        self.client.force_authenticate(user=self.student)

        response = self.client.post(self.qr_pay_url, {
            'qr_id': str(self.qr.id)
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.student_wallet.refresh_from_db()
        self.qr.refresh_from_db()

        self.assertEqual(self.student_wallet.balance, 75.00)
        self.assertTrue(self.qr.is_used)

    def test_expired_qr(self):
        """Test expired QR code"""
        self.qr.expires_at = timezone.now() - timedelta(minutes=1)
        self.qr.save()

        self.client.force_authenticate(user=self.student)

        response = self.client.post(self.qr_pay_url, {
            'qr_id': str(self.qr.id)
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('expired', response.data['message'].lower())

    def test_insufficient_funds(self):
        """Test payment with insufficient funds"""
        self.student_wallet.balance = 10.00
        self.student_wallet.save()

        self.client.force_authenticate(user=self.student)

        response = self.client.post(self.qr_pay_url, {
            'qr_id': str(self.qr.id)
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('insufficient', response.data['message'].lower())