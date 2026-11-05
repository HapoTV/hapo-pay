import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import Mock, patch

from django.test import SimpleTestCase
from django.urls import resolve
from rest_framework.test import APIRequestFactory, force_authenticate

from apps.wallets.views import ParentChildrenView, ParentWalletView


class ParentDashboardEndpointTests(SimpleTestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.parent = SimpleNamespace(
            id=uuid.uuid4(),
            pk=None,
            role='parent',
            is_authenticated=True,
        )
        self.parent.pk = self.parent.id

    def test_parent_wallet_returns_current_parent_wallet(self):
        wallet = SimpleNamespace(
            id=uuid.uuid4(),
            user=SimpleNamespace(pk=uuid.uuid4(), email='parent@example.com'),
            balance='1500.00',
            currency='ZAR',
            is_active=True,
            created_at=datetime(2026, 6, 1, tzinfo=timezone.utc),
        )
        request = self.factory.get('/api/v1/parent/wallet/')
        force_authenticate(request, user=self.parent)

        with patch('apps.wallets.views.Wallet.objects.get', return_value=wallet):
            response = ParentWalletView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(response.data['data']['user_email'], 'parent@example.com')

    def test_parent_children_returns_linked_student_profiles(self):
        child = SimpleNamespace(
            id=uuid.uuid4(),
            email='student@example.com',
            profile=SimpleNamespace(full_name='Student Example'),
            wallet=SimpleNamespace(balance='75.00'),
            created_at=datetime(2026, 6, 1, tzinfo=timezone.utc),
        )
        student_profile = SimpleNamespace(
            user=child,
            grade=8,
            school_name='Example School',
            is_account_frozen=False,
        )
        profiles = Mock()
        profiles.select_related.return_value = [student_profile]
        request = self.factory.get('/api/v1/parent/children/')
        force_authenticate(request, user=self.parent)

        with patch('apps.wallets.views.StudentProfile.objects.filter', return_value=profiles) as query:
            response = ParentChildrenView.as_view()(request)

        query.assert_called_once_with(parent=self.parent)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data'][0]['id'], str(child.id))
        self.assertEqual(response.data['data'][0]['full_name'], 'Student Example')
        self.assertEqual(response.data['data'][0]['wallet_balance'], '75.00')

    def test_parent_wallet_and_children_routes_resolve(self):
        self.assertEqual(
            resolve('/api/v1/parent/wallet/').url_name,
            'parent-wallet',
        )
        self.assertEqual(
            resolve('/api/v1/parent/children/').url_name,
            'parent-children',
        )
        self.assertEqual(
            resolve('/api/v1/parent/analytics/').url_name,
            'spending-analytics',
        )
