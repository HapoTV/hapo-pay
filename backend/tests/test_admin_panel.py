# tests/test_admin_panel.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from unittest.mock import patch
from apps.accounts.models import User
from apps.payments.models import FraudAlert, Merchant
from apps.wallets.models import Transaction, Wallet


class BaseAdminTest(TestCase):
    """Shared setup for all admin tests"""

    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin = User.objects.create_superuser(
            email='admin@hapopay.com',
            password='adminpass123',
        )
        self.admin.role = 'admin'
        self.admin.save()

        # Regular user
        self.user = User.objects.create_user(
            email='user@hapopay.com',
            password='userpass123',
        )

        # Authenticate as admin
        self.client.force_authenticate(user=self.admin)


# ─── User Management ──────────────────────────────────────────────────────────

class UserManagementTest(BaseAdminTest):

    def test_list_users_returns_all(self):
        response = self.client.get('/api/v1/admin/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertGreaterEqual(len(response.data['data']), 2)

    def test_filter_users_by_role(self):
        response = self.client.get('/api/v1/admin/users/?role=admin')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for user in response.data['data']:
            self.assertEqual(user['role'], 'admin')

    def test_filter_users_by_active_status(self):
        self.user.is_active = False
        self.user.save()
        response = self.client.get('/api/v1/admin/users/?is_active=false')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for u in response.data['data']:
            self.assertFalse(u['is_active'])

    def test_search_users_by_email(self):
        response = self.client.get('/api/v1/admin/users/?search=user@hapopay')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['email'], 'user@hapopay.com')

    def test_update_user_role(self):
        response = self.client.put(
            f'/api/v1/admin/users/{self.user.id}/',
            {'role': 'parent'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, 'parent')

    def test_suspend_user(self):
        response = self.client.post(
            f'/api/v1/admin/users/{self.user.id}/suspend/',
            {'reason': 'Suspicious activity'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

    def test_activate_user(self):
        self.user.is_active = False
        self.user.save()
        response = self.client.post(
            f'/api/v1/admin/users/{self.user.id}/activate/',
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)

    def test_delete_user(self):
        response = self.client.delete(f'/api/v1/admin/users/{self.user.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=self.user.id).exists())

    def test_non_admin_cannot_list_users(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/admin/users/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_suspend_nonexistent_user_returns_404(self):
        import uuid
        response = self.client.post(
            f'/api/v1/admin/users/{uuid.uuid4()}/suspend/',
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ─── Merchant Verification ────────────────────────────────────────────────────

class MerchantVerificationTest(BaseAdminTest):

    def setUp(self):
        super().setUp()
        self.merchant = Merchant.objects.create(
            name='Test Coffee Shop',
            business_registration='2020/123456/07',
            email='coffee@test.com',
            phone='+27123456789',
            address='123 Main St',
            category='restaurant',
            verified=False,
        )

    def test_list_pending_merchants(self):
        response = self.client.get('/api/v1/admin/merchants/pending/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['name'], 'Test Coffee Shop')

    def test_verify_merchant(self):
        response = self.client.post(
            f'/api/v1/admin/merchants/{self.merchant.id}/verify/',
            {'action': 'verify'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.merchant.refresh_from_db()
        self.assertTrue(self.merchant.verified)
        self.assertEqual(self.merchant.verified_by, self.admin)

    def test_reject_merchant(self):
        response = self.client.post(
            f'/api/v1/admin/merchants/{self.merchant.id}/verify/',
            {'action': 'reject'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.merchant.refresh_from_db()
        self.assertFalse(self.merchant.verified)

    def test_verify_nonexistent_merchant_returns_404(self):
        import uuid
        response = self.client.post(
            f'/api/v1/admin/merchants/{uuid.uuid4()}/verify/',
            {'action': 'verify'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_verified_merchant_not_in_pending_list(self):
        self.merchant.verified = True
        self.merchant.save()
        response = self.client.get('/api/v1/admin/merchants/pending/')
        self.assertEqual(len(response.data['data']), 0)


# ─── Fraud Alert Endpoints ────────────────────────────────────────────────────

class FraudAlertEndpointTest(BaseAdminTest):

    def setUp(self):
        super().setUp()
        self.wallet = Wallet.objects.create(
            user=self.user,
            balance=Decimal('10000.00')
        )
        self.txn = Transaction.objects.create(
            user=self.user,
            amount=Decimal('60000.00'),
            type='transfer',
            status='frozen',
            is_flagged=True,
            fraud_reasons=['large_single_transaction'],
        )
        self.alert = FraudAlert.objects.create(
            transaction=self.txn,
            user=self.user,
            alert_type='large_single_transaction',
            reasons=['large_single_transaction'],
            severity='critical',
            status='pending',
        )

    def test_list_fraud_alerts(self):
        response = self.client.get('/api/v1/admin/fraud-alerts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_filter_by_status(self):
        response = self.client.get('/api/v1/admin/fraud-alerts/?status=pending')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for alert in response.data['results']:
            self.assertEqual(alert['status'], 'pending')

    def test_filter_by_severity(self):
        response = self.client.get('/api/v1/admin/fraud-alerts/?severity=critical')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for alert in response.data['results']:
            self.assertEqual(alert['severity'], 'critical')

    def test_action_alert_as_investigating(self):
        response = self.client.patch(
            f'/api/v1/admin/fraud-alerts/{self.alert.id}/',
            {'status': 'investigating', 'review_notes': 'Looking into it'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.alert.refresh_from_db()
        self.assertEqual(self.alert.status, 'investigating')
        self.assertEqual(self.alert.reviewed_by, self.admin)
        self.assertIsNotNone(self.alert.reviewed_at)

    def test_false_positive_unfreezes_transaction(self):
        response = self.client.patch(
            f'/api/v1/admin/fraud-alerts/{self.alert.id}/',
            {'status': 'false_positive', 'review_notes': 'Verified with customer'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.txn.refresh_from_db()
        self.assertEqual(self.txn.status, 'completed')
        self.assertFalse(self.txn.is_flagged)

    def test_non_admin_cannot_access_fraud_alerts(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/admin/fraud-alerts/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# ─── Fraud Monitoring Manual Check ───────────────────────────────────────────

class FraudMonitoringTest(BaseAdminTest):

    def setUp(self):
        super().setUp()
        self.wallet = Wallet.objects.create(
            user=self.user,
            balance=Decimal('200000.00')
        )
        self.txn = Transaction.objects.create(
            user=self.user,
            amount=Decimal('1000.00'),
            type='payment',
            status='completed',
            is_flagged=False,
        )

    def test_get_high_risk_alerts(self):
        response = self.client.get('/api/v1/admin/fraud-monitoring/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('high_risk_alerts', response.data['data'])
        self.assertIn('total_pending', response.data['data'])

    @patch('apps.notifications.tasks.send_notification_task.delay')
    def test_manual_fraud_check_flags_suspicious_transaction(self, mock_notify):
        # Create a large transaction that should trigger the engine
        large_txn = Transaction.objects.create(
            user=self.user,
            amount=Decimal('60000.00'),
            type='transfer',
            status='completed',
            is_flagged=False,
        )
        response = self.client.post(
            '/api/v1/admin/fraud-monitoring/',
            {'transaction_id': str(large_txn.id)},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        large_txn.refresh_from_db()
        self.assertEqual(large_txn.status, 'frozen')
        self.assertTrue(large_txn.is_flagged)

    def test_manual_check_already_frozen_returns_400(self):
        self.txn.status = 'frozen'
        self.txn.save()
        response = self.client.post(
            '/api/v1/admin/fraud-monitoring/',
            {'transaction_id': str(self.txn.id)},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)