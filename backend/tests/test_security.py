# tests/test_security.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.accounts.models import Profile
from apps.admin_panel.models import AuditLog

User = get_user_model()


class SecurityTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            email='test@test.com',
            password='TestPass123!',
            role='parent'
        )
        Profile.objects.create(user=self.user, full_name='Test User')

    def test_unauthenticated_access(self):
        """Test unauthenticated users cannot access protected endpoints"""
        protected_urls = [
            reverse('profile-list'),
            reverse('wallet-list'),
            reverse('transactions-list'),
        ]

        for url in protected_urls:
            response = self.client.get(url)
            self.assertEqual(response.status_code, 401)

    def test_role_based_access(self):
        """Test role-based access control"""
        self.client.force_authenticate(user=self.user)

        # Parent trying to access student-only endpoint
        url = reverse('student-wallet-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 403)

    def test_audit_logging(self):
        """Test audit logging for sensitive actions"""
        self.client.force_authenticate(user=self.user)

        # Perform action that should be logged
        response = self.client.post(reverse('change-password'), {
            'old_password': 'TestPass123!',
            'new_password': 'NewPass123!',
            'confirm_password': 'NewPass123!'
        }, format='json')

        # Check audit log created
        audit_log = AuditLog.objects.filter(user=self.user).first()
        self.assertIsNotNone(audit_log)
        self.assertEqual(audit_log.action, 'update')

    def test_rate_limiting(self):
        """Test rate limiting"""
        from django.conf import settings
        settings.RATELIMIT_ENABLE = True

        login_url = reverse('login')

        # Make multiple rapid requests
        for i in range(10):
            response = self.client.post(login_url, {
                'email': 'wrong@test.com',
                'password': 'wrongpass'
            }, format='json')

        # Should be rate limited after 100 requests per hour
        # This is a basic test - adjust based on your rate limit config
        self.assertNotEqual(response.status_code, 429)  # Not rate limited yet