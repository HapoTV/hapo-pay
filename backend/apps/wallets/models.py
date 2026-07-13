# apps/wallets/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class Wallet(models.Model):
    CURRENCY_CHOICES = [
        ('ZAR', 'South African Rand'),
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
        ('GBP', 'British Pound'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, validators=[MinValueValidator(0)])
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='ZAR')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallets'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.currency} {self.balance}"

    def add_balance(self, amount):
        """Credit Wallet. Use select_for_update() at the call site."""
        if not self.is_active:
            raise ValueError('Cannot credit an inactive Wallet.')
        self.balance += amount
        self.save(update_fields=['balance', 'updated_at'])

    def deduct_balance(self, amount):
        """Debit wallet.Return True on Sucess, False if insufficient funds"""
        if not self.is_active:
            raise ValueError('Cannot debit an inactive Wallet.')
        if self.balance < amount:
            return False
        self.balance -= amount
        self.save(update_fields=['balance', 'updated_at'])
        return True
        


class Transaction(models.Model):
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
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
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
        return f"{self.type} - {self.amount} - {self.user.email}"


class SpendingLimit(models.Model):
    CATEGORY_CHOICES = Transaction.CATEGORY_CHOICES

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    child = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='spending_limits',
                              limit_choices_to={'role': 'student'})
    parent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='set_limits',
                               limit_choices_to={'role': 'parent'})
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    daily_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    weekly_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    monthly_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
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
        return f"Limit for {self.child.email} - {self.category}"

    def check_limit(self, amount):
        """Check if transaction amount is within limits"""
        from django.utils import timezone
        from datetime import timedelta

        if not self.is_enabled:
            return True

        # Check daily limit
        if self.daily_limit > 0:
            if self.daily_spent + amount > self.daily_limit:
                return False

        # Check weekly limit
        if self.weekly_limit > 0:
            if self.weekly_spent + amount > self.weekly_limit:
                return False

        # Check monthly limit
        if self.monthly_limit > 0:
            if self.monthly_spent + amount > self.monthly_limit:
                return False

        return True


class MoneyRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('declined', 'Declined'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    child = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='money_requests_sent',
                              limit_choices_to={'role': 'student'})
    parent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                               related_name='money_requests_received', limit_choices_to={'role': 'parent'})
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
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
        return f"{self.child.email} requests {self.amount} from {self.parent.email}"