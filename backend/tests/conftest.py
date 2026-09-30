# tests/conftest.py
"""
Shared pytest fixtures for the HapoPay test suite.

Provides:
- API clients (anonymous + authenticated per role)
- Users (parent, student, admin) with wallets
- Merchants, QR codes, NFC tokens
- Rewards, achievements, challenges
- Fraud alerts, audit logs
- Freeze-account helpers
"""
import pytest
from decimal import Decimal
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import Profile, ParentProfile, StudentProfile, AdminProfile
from apps.wallets.models import Wallet, Transaction, SpendingLimit, MoneyRequest
from apps.payments.models import Merchant, QRCode, NFCToken, FraudAlert
from apps.gamification.models import (
    Reward, Achievement, Challenge, UserAchievement, UserChallenge,
)
from apps.admin_panel.models import AuditLog, SystemConfig

User = get_user_model()


# ─────────────────────────────────────────────────────────────────
# API Clients
# ─────────────────────────────────────────────────────────────────

@pytest.fixture
def api_client():
    """Anonymous DRF API client."""
    return APIClient()


@pytest.fixture
def authenticated_parent(api_client, parent_user):
    """API client authenticated as a parent."""
    api_client.force_authenticate(user=parent_user)
    return api_client


@pytest.fixture
def authenticated_student(api_client, student_user):
    """API client authenticated as a student."""
    api_client.force_authenticate(user=student_user)
    return api_client


@pytest.fixture
def authenticated_admin(api_client, admin_user):
    """API client authenticated as an admin."""
    api_client.force_authenticate(user=admin_user)
    return api_client


# ─────────────────────────────────────────────────────────────────
# Users
# ─────────────────────────────────────────────────────────────────

@pytest.fixture
def parent_user(db):
    """A verified parent with a wallet."""
    user = User.objects.create_user(
        email='parent@test.com',
        password='TestPass123!',
        role='parent',
        phone_number='+27123456789',
    )
    Profile.objects.create(user=user, full_name='Test Parent')
    ParentProfile.objects.create(user=user, is_verified=True, default_currency='ZAR')
    Wallet.objects.create(user=user, balance=Decimal('1000.00'))
    return user


@pytest.fixture
def second_parent_user(db):
    """A second parent — used to test cross-tenant isolation."""
    user = User.objects.create_user(
        email='parent2@test.com',
        password='TestPass123!',
        role='parent',
    )
    Profile.objects.create(user=user, full_name='Second Parent')
    ParentProfile.objects.create(user=user, is_verified=True)
    Wallet.objects.create(user=user, balance=Decimal('500.00'))
    return user


@pytest.fixture
def student_user(db, parent_user):
    """A student linked to `parent_user` with a wallet."""
    user = User.objects.create_user(
        email='student@test.com',
        password='TestPass123!',
        role='student',
    )
    Profile.objects.create(user=user, full_name='Test Student')
    StudentProfile.objects.create(
        user=user,
        parent=parent_user,
        school_name='Test High',
        grade=10,
    )
    Wallet.objects.create(user=user, balance=Decimal('100.00'))
    return user


@pytest.fixture
def unlinked_student_user(db):
    """A student with no parent — used to test edge cases."""
    user = User.objects.create_user(
        email='orphan@test.com',
        password='TestPass123!',
        role='student',
    )
    Profile.objects.create(user=user, full_name='Orphan Student')
    StudentProfile.objects.create(user=user, parent=None)
    Wallet.objects.create(user=user, balance=Decimal('0.00'))
    return user


@pytest.fixture
def admin_user(db):
    """An admin user."""
    user = User.objects.create_user(
        email='admin@test.com',
        password='TestPass123!',
        role='admin',
        is_staff=True,
    )
    Profile.objects.create(user=user, full_name='Test Admin')
    AdminProfile.objects.create(user=user, department='Operations', is_super_admin=True)
    return user


# ─────────────────────────────────────────────────────────────────
# Wallets & Transactions
# ─────────────────────────────────────────────────────────────────

@pytest.fixture
def parent_wallet(parent_user):
    return Wallet.objects.get(user=parent_user)


@pytest.fixture
def student_wallet(student_user):
    return Wallet.objects.get(user=student_user)


@pytest.fixture
def sample_transaction(student_user):
    return Transaction.objects.create(
        user=student_user,
        amount=Decimal('25.00'),
        type='payment',
        category='food',
        status='completed',
        description='Test payment',
        merchant_name='Test Cafeteria',
    )


@pytest.fixture
def sample_spending_limit(parent_user, student_user):
    return SpendingLimit.objects.create(
        child=student_user,
        parent=parent_user,
        category='food',
        daily_limit=Decimal('50.00'),
        weekly_limit=Decimal('200.00'),
        monthly_limit=Decimal('500.00'),
        is_enabled=True,
    )


@pytest.fixture
def sample_money_request(parent_user, student_user):
    return MoneyRequest.objects.create(
        child=student_user,
        parent=parent_user,
        amount=Decimal('75.00'),
        reason='School supplies',
        status='pending',
    )


# ─────────────────────────────────────────────────────────────────
# Payments
# ─────────────────────────────────────────────────────────────────

@pytest.fixture
def merchant(db):
    """A verified merchant."""
    return Merchant.objects.create(
        name='Test Cafeteria',
        business_registration='REG-12345',
        email='merchant@test.com',
        phone='+27123456789',
        address='123 Test St',
        category='restaurant',
        verified=True,
    )


@pytest.fixture
def unverified_merchant(db):
    """An unverified merchant — used to test admin verification flow."""
    return Merchant.objects.create(
        name='Pending Shop',
        business_registration='REG-99999',
        email='pending@test.com',
        phone='+27987654321',
        address='456 Pending Rd',
        category='retail',
        verified=False,
    )


@pytest.fixture
def valid_qr_code(merchant):
    """A QR code that is unused and not expired."""
    return QRCode.objects.create(
        merchant=merchant,
        amount=Decimal('25.00'),
        description='Test purchase',
        expires_at=timezone.now() + timedelta(minutes=15),
        is_used=False,
    )


@pytest.fixture
def expired_qr_code(merchant):
    """An expired QR code."""
    return QRCode.objects.create(
        merchant=merchant,
        amount=Decimal('25.00'),
        description='Expired',
        expires_at=timezone.now() - timedelta(minutes=1),
        is_used=False,
    )


@pytest.fixture
def used_qr_code(merchant, student_user):
    """A QR code already used."""
    return QRCode.objects.create(
        merchant=merchant,
        amount=Decimal('25.00'),
        description='Already used',
        expires_at=timezone.now() + timedelta(minutes=15),
        is_used=True,
        used_by=student_user,
        used_at=timezone.now(),
    )


@pytest.fixture
def nfc_token(student_user):
    """A valid NFC token for a student."""
    return NFCToken.objects.create(
        user=student_user,
        device_id='device-abc-123',
        token='nfc_test_token_xyz',
        is_active=True,
        expires_at=timezone.now() + timedelta(days=365),
    )


# ─────────────────────────────────────────────────────────────────
# Gamification
# ─────────────────────────────────────────────────────────────────

@pytest.fixture
def reward(db, student_user):
    return Reward.objects.create(
        user=student_user, points=500, level=1, streak_days=3,
    )


@pytest.fixture
def achievement(db):
    return Achievement.objects.create(
        name='First Purchase',
        description='Made your first purchase',
        points_required=100,
        category='spending',
    )


@pytest.fixture
def active_challenge(db):
    return Challenge.objects.create(
        title='No Takeout Week',
        description='Skip takeout for 7 days',
        challenge_type='streak',
        target_value=Decimal('7.00'),
        reward_points=200,
        start_date=timezone.now() - timedelta(days=1),
        end_date=timezone.now() + timedelta(days=6),
        is_active=True,
    )


# ─────────────────────────────────────────────────────────────────
# Admin
# ─────────────────────────────────────────────────────────────────

@pytest.fixture
def fraud_alert(db, sample_transaction):
    return FraudAlert.objects.create(
        transaction=sample_transaction,
        alert_type='large_transaction',
        severity='high',
        description='Unusually large transaction',
        status='pending',
    )


@pytest.fixture
def system_config(db):
    return SystemConfig.objects.create(
        key='min_transfer_amount',
        value='1.00',
        description='Minimum transfer amount in ZAR',
    )