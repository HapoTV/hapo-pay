# tests/test_wallets.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.wallets.models import Wallet, Transaction

User = get_user_model()


class WalletsTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

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