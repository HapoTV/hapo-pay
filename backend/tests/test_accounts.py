# tests/test_accounts.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.accounts.models import Profile

User = get_user_model()


class AccountsTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')

        self.test_user_data = {
            'email': 'test@example.com',
            'password': 'TestPass123!',
            'confirm_password': 'TestPass123!',
            'full_name': 'Test User',
            'role': 'parent',
            'phone_number': '+27123456789'
        }

    def test_user_registration(self):
        """Test user registration"""
        response = self.client.post(self.register_url, self.test_user_data, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(response.data['data']['user']['email'], 'test@example.com')

    def test_user_login(self):
        """Test user login"""
        # First register
        self.client.post(self.register_url, self.test_user_data, format='json')

        # Then login
        response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data['data']['tokens'])

    def test_duplicate_registration(self):
        """Test duplicate registration prevention"""
        # First registration
        self.client.post(self.register_url, self.test_user_data, format='json')

        # Second registration with same email
        response = self.client.post(self.register_url, self.test_user_data, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data['errors'])

    def test_password_mismatch(self):
        """Test password mismatch validation"""
        data = self.test_user_data.copy()
        data['confirm_password'] = 'DifferentPass123!'

        response = self.client.post(self.register_url, data, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('confirm_password', response.data['errors'])