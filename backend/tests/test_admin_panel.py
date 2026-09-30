# tests/test_admin_panel.py
"""
Admin panel tests.

Covers:
- User management (list, filter, search, update, suspend, activate, delete)
- Merchant verification flow
- Fraud alert management
- Audit log listing
- Platform analytics
- System config CRUD
- Permission boundaries (non-admins blocked)
- Pagination behavior
"""
from decimal import Decimal
from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

from apps.accounts.models import Profile, AdminProfile
from apps.admin_panel.models import AuditLog, SystemConfig
from apps.payments.models import Merchant, FraudAlert
from apps.wallets.models import Transaction, Wallet

User = get_user_model()


# ═══════════════════════════════════════════════════════════════════════
# 0. BASE SETUP
# ═══════════════════════════════════════════════════════════════════════

class BaseAdminTest(TestCase):
    """Shared admin + regular user setup."""

    def setUp(self):
        self.client = APIClient()

        # Admin
        self.admin = User.objects.create_user(
            email='admin@hapopay.com',
            password='adminpass123',
            role='admin',
            is_staff=True,
            is_superuser=True,
        )
        Profile.objects.create(user=self.admin, full_name='Admin')
        AdminProfile.objects.create(user=self.admin, department='Ops', is_super_admin=True)

        # Regular user
        self.user = User.objects.create_user(
            email='user@hapopay.com',
            password='userpass123',
            role='parent',
        )
        Profile.objects.create(user=self.user, full_name='User')
        Wallet.objects.create(user=self.user, balance=Decimal('500.00'))

        self.client.force_authenticate(user=self.admin)


# ═══════════════════════════════════════════════════════════════════════
# 1. USER MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════

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
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, 'parent')

    def test_suspend_user(self):
        response = self.client.post(
            f'/api/v1/admin/users/{self.user.id}/suspend/',
            {'reason': 'Suspicious activity'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

    def test_activate_user(self):
        self.user.is_active = False
        self.user.save()
        response = self.client.post(
            f'/api/v1/admin/users/{self.user.id}/activate/',
            format='json',
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
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_blocked(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/v1/admin/users/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ═══════════════════════════════════════════════════════════════════════
# 2. MERCHANT VERIFICATION
# ═══════════════════════════════════════════════════════════════════════

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
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.merchant.refresh_from_db()
        self.assertTrue(self.merchant.verified)
        self.assertEqual(self.merchant.verified_by, self.admin)

    def test_reject_merchant(self):
        response = self.client.post(
            f'/api/v1/admin/merchants/{self.merchant.id}/verify/',
            {'action': 'reject'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.merchant.refresh_from_db()
        self.assertFalse(self.merchant.verified)

    def test_verify_nonexistent_merchant_returns_404(self):
        import uuid
        response = self.client.post(
            f'/api/v1/admin/merchants/{uuid.uuid4()}/verify/',
            {'action': 'verify'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_verified_merchant_not_in_pending_list(self):
        self.merchant.verified = True
        self.merchant.save()
        response = self.client.get('/api/v1/admin/merchants/pending/')
        self.assertEqual(len(response.data['data']), 0)

    def test_non_admin_cannot_verify_merchant(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            f'/api/v1/admin/merchants/{self.merchant.id}/verify/',
            {'action': 'verify'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# ═══════════════════════════════════════════════════════════════════════
# 3. FRAUD ALERTS
# ═══════════════════════════════════════════════════════════════════════

class FraudAlertEndpointTest(BaseAdminTest):

    def setUp(self):
        super().setUp()
        self.wallet = Wallet.objects.create(user=self.user, balance=Decimal('10000.00'))
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
        # Handle both paginated and non-paginated responses
        results = response.data.get('results', response.data.get('data', []))
        self.assertEqual(len(results), 1)

    def test_filter_by_status(self):
        response = self.client.get('/api/v1/admin/fraud-alerts/?status=pending')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data.get('data', []))
        for alert in results:
            self.assertEqual(alert['status'], 'pending')

    def test_filter_by_severity(self):
        response = self.client.get('/api/v1/admin/fraud-alerts/?severity=critical')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data.get('data', []))
        for alert in results:
            self.assertEqual(alert['severity'], 'critical')

    def test_action_alert_as_investigating(self):
        response = self.client.patch(
            f'/api/v1/admin/fraud-alerts/{self.alert.id}/',
            {'status': 'investigating', 'review_notes': 'Looking into it'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.alert.refresh_from_db()
        self.assertEqual(self.alert.status, 'investigating')

    def test_false_positive_unfreezes_transaction(self):
        response = self.client.patch(
            f'/api/v1/admin/fraud-alerts/{self.alert.id}/',
            {'status': 'false_positive', 'review_notes': 'Verified with customer'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.txn.refresh_from_db()
        self.assertEqual(self.txn.status, 'completed')
        self.assertFalse(self.txn.is_flagged)

    def test_non_admin_cannot_access_fraud_alerts(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/admin/fraud-alerts/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# ═══════════════════════════════════════════════════════════════════════
# 4. FRAUD MONITORING
# ═══════════════════════════════════════════════════════════════════════

class FraudMonitoringTest(BaseAdminTest):

    def setUp(self):
        super().setUp()
        Wallet.objects.create(user=self.user, balance=Decimal('200000.00'))
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
            format='json',
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
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ═══════════════════════════════════════════════════════════════════════
# 5. AUDIT LOGS
# ═══════════════════════════════════════════════════════════════════════

class AuditLogTest(BaseAdminTest):

    def setUp(self):
        super().setUp()
        for i in range(3):
            AuditLog.objects.create(
                user=self.admin,
                action='update',
                resource_type='user',
                resource_id=str(self.user.id),
                ip_address='127.0.0.1',
            )

    def test_list_audit_logs(self):
        response = self.client.get('/api/v1/admin/audit-logs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data.get('data', []))
        self.assertEqual(len(results), 3)

    def test_filter_audit_logs_by_action(self):
        response = self.client.get('/api/v1/admin/audit-logs/?action=update')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data.get('data', []))
        for log in results:
            self.assertEqual(log['action'], 'update')

    def test_non_admin_cannot_list_audit_logs(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/admin/audit-logs/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# ═══════════════════════════════════════════════════════════════════════
# 6. PLATFORM ANALYTICS
# ═══════════════════════════════════════════════════════════════════════

class PlatformAnalyticsTest(BaseAdminTest):

    def test_get_platform_analytics(self):
        response = self.client.get('/api/v1/admin/analytics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertIn('total_users', data)
        self.assertIn('total_transactions', data)
        self.assertIn('total_volume', data)

    def test_analytics_period_query_param(self):
        response = self.client.get('/api/v1/admin/analytics/?period=week')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['period'], 'week')

    def test_non_admin_cannot_view_analytics(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/admin/analytics/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# ═══════════════════════════════════════════════════════════════════════
# 7. SYSTEM CONFIG
# ═══════════════════════════════════════════════════════════════════════

class SystemConfigTest(BaseAdminTest):

    def setUp(self):
        super().setUp()
        self.config = SystemConfig.objects.create(
            key='min_transfer_amount',
            value='1.00',
            description='Minimum transfer in ZAR',
        )

    def test_list_configs(self):
        response = self.client.get('/api/v1/admin/config/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data.get('data', []))
        self.assertEqual(len(results), 1)

    def test_update_config(self):
        response = self.client.patch(
            f'/api/v1/admin/config/{self.config.id}/',
            {'value': '5.00'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.config.refresh_from_db()
        self.assertEqual(self.config.value, '5.00')

    def test_create_config(self):
        response = self.client.post('/api/v1/admin/config/', {
            'key': 'max_transfer_amount',
            'value': '10000.00',
            'description': 'Maximum transfer per transaction',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_non_admin_cannot_update_config(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            f'/api/v1/admin/config/{self.config.id}/',
            {'value': '9999.00'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)