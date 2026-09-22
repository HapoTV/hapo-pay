# apps/wallets/models.py
"""
Wallets App Models
==================
Defines the financial data models for HapoPay:
- Wallet: stores user balance
- Transaction: records every financial movement
- SpendingLimit: per-category limits for students
- MoneyRequest: child → parent fund requests
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal, InvalidOperation
import uuid
import logging

logger = logging.getLogger(__name__)


class Wallet(models.Model):
    """
    Wallet Model
    ------------
    Represents a single user's monetary balance. One Wallet per User.
    All balance mutations MUST go through WalletService (services.py)
    to guarantee atomicity via select_for_update().
    """

    CURRENCY_CHOICES = [
        ('ZAR', 'South African Rand'),
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
        ('GBP', 'British Pound'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wallet'
    )
    balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)]
    )
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='ZAR')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallets'
        ordering = ['-created_at']

    def __str__(self):
        """String representation for admin/logging."""
        return f"{self.user.email} - {self.currency} {self.balance}"

    def add_balance(self, amount):
        """
        Credit the wallet by `amount`.

        NOTE: This method does NOT lock the row. Always call this inside a
        transaction that has already done `Wallet.objects.select_for_update()`.

        Args:
            amount (Decimal | int | float | str): amount to add.

        Raises:
            ValueError: If wallet is inactive or amount is invalid.
        """
        try:
            if not self.is_active:
                raise ValueError('Cannot credit an inactive Wallet.')

            # Coerce amount to Decimal safely
            try:
                amount_dec = Decimal(str(amount))
            except (InvalidOperation, TypeError):
                raise ValueError(f'Invalid amount for add_balance: {amount!r}')

            if amount_dec < 0:
                raise ValueError('Amount to add must be non-negative.')

            self.balance = (self.balance or Decimal('0')) + amount_dec
            self.save(update_fields=['balance', 'updated_at'])
            logger.info(f"Wallet credited: {self.user.email} +{amount_dec}")

        except ValueError:
            # Domain validation — re-raise so callers can handle
            raise
        except Exception as e:
            logger.exception(f"Unexpected error in Wallet.add_balance: {e}")
            raise

    def deduct_balance(self, amount):
        """
        Debit the wallet by `amount`.

        Returns:
            bool: True on success, False if insufficient funds.

        Raises:
            ValueError: If wallet is inactive or amount is invalid.

        NOTE: This method does NOT lock the row. Always call this inside a
        transaction that has already done `Wallet.objects.select_for_update()`.
        """
        try:
            if not self.is_active:
                raise ValueError('Cannot debit an inactive Wallet.')

            try:
                amount_dec = Decimal(str(amount))
            except (InvalidOperation, TypeError):
                raise ValueError(f'Invalid amount for deduct_balance: {amount!r}')

            if amount_dec <= 0:
                raise ValueError('Amount to deduct must be positive.')

            if (self.balance or Decimal('0')) < amount_dec:
                logger.warning(
                    f"Deduct denied (insufficient funds): {self.user.email} "
                    f"balance={self.balance} requested={amount_dec}"
                )
                return False

            self.balance -= amount_dec
            self.save(update_fields=['balance', 'updated_at'])
            logger.info(f"Wallet debited: {self.user.email} -{amount_dec}")
            return True

        except ValueError:
            raise
        except Exception as e:
            logger.exception(f"Unexpected error in Wallet.deduct_balance: {e}")
            raise


class Transaction(models.Model):
    """
    Transaction Model
    -----------------
    Immutable record of a single financial movement (payment, transfer,
    deposit, etc.). Includes fraud flags set by the payments.fraud_detection
    module.
    """

    TRANSACTION_TYPES = [
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('payment', 'Payment'),
        ('transfer', 'Transfer'),
        ('refund', 'Refund'),
        ('allowance', 'Allowance'),
        ('reward', 'Reward'),
    ]

    CATEGORY_CHOICES = [
        ('food', 'Food & Dining'),
        ('transport', 'Transport'),
        ('shopping', 'Shopping'),
        ('entertainment', 'Entertainment'),
        ('education', 'Education'),
        ('health', 'Health'),
        ('savings', 'Savings'),
        ('airtime', 'Airtime'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
        ('frozen', 'Frozen'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    description = models.TextField(blank=True, null=True)
    merchant_name = models.CharField(max_length=200, blank=True, null=True)
    merchant_id = models.UUIDField(null=True, blank=True)
    reference_id = models.CharField(max_length=100, blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_flagged = models.BooleanField(default=False, db_index=True)
    fraud_reasons = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['type']),
        ]

    def __str__(self):
        """String representation for admin/logging."""
        return f"{self.type} - {self.amount} - {self.user.email}"


class SpendingLimit(models.Model):
    """
    SpendingLimit Model
    -------------------
    Per-category, per-child limit with daily / weekly / monthly thresholds.
    Enforced by SpendingLimitEnforcer in services.py.
    """

    CATEGORY_CHOICES = Transaction.CATEGORY_CHOICES

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    child = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='spending_limits',
        limit_choices_to={'role': 'student'}
    )
    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='set_limits',
        limit_choices_to={'role': 'parent'}
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    daily_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                                      validators=[MinValueValidator(0)])
    weekly_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                                       validators=[MinValueValidator(0)])
    monthly_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                                        validators=[MinValueValidator(0)])
    daily_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    weekly_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monthly_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'spending_limits'
        unique_together = ['child', 'category']

    def __str__(self):
        """String representation for admin/logging."""
        return f"Limit for {self.child.email} - {self.category}"

    def check_limit(self, amount):
        """
        Check if `amount` fits within all enabled limits for this category.

        Returns:
            bool: True if within limits, False otherwise.
        """
        try:
            if not self.is_enabled:
                return True

            amount_dec = Decimal(str(amount))

            if self.daily_limit > 0 and (self.daily_spent + amount_dec) > self.daily_limit:
                logger.info(
                    f"Daily limit exceeded for {self.child.email} "
                    f"[{self.category}]: {self.daily_spent}+{amount_dec} > {self.daily_limit}"
                )
                return False

            if self.weekly_limit > 0 and (self.weekly_spent + amount_dec) > self.weekly_limit:
                logger.info(
                    f"Weekly limit exceeded for {self.child.email} "
                    f"[{self.category}]: {self.weekly_spent}+{amount_dec} > {self.weekly_limit}"
                )
                return False

            if self.monthly_limit > 0 and (self.monthly_spent + amount_dec) > self.monthly_limit:
                logger.info(
                    f"Monthly limit exceeded for {self.child.email} "
                    f"[{self.category}]: {self.monthly_spent}+{amount_dec} > {self.monthly_limit}"
                )
                return False

            return True

        except (InvalidOperation, TypeError) as e:
            logger.error(f"check_limit received invalid amount {amount!r}: {e}")
            # Fail-safe: block the transaction if we can't evaluate it
            return False
        except Exception as e:
            logger.exception(f"Unexpected error in SpendingLimit.check_limit: {e}")
            return False


class MoneyRequest(models.Model):
    """
    MoneyRequest Model
    ------------------
    A child's request to their parent for funds. Parents approve or decline,
    which triggers (or does not trigger) a transfer via WalletService.
    """

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('declined', 'Declined'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    child = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='money_requests_sent',
        limit_choices_to={'role': 'student'}
    )
    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='money_requests_received',
        limit_choices_to={'role': 'parent'}
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    parent_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'money_requests'
        ordering = ['-created_at']

    def __str__(self):
        """String representation for admin/logging."""
        return f"{self.child.email} requests {self.amount} from {self.parent.email}"