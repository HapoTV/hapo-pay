# apps/wallets/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
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
        constraints = [
            # The last line of defence for the invariant this whole app exists
            # to protect. MinValueValidator(0) above does NOT run on .save() --
            # it only fires inside full_clean(), which no service path calls --
            # so until now `balance >= 0` was enforced only by Python guards
            # that any new code path could bypass. This holds regardless of
            # which code, migration or psql session does the writing.
            models.CheckConstraint(
                check=models.Q(balance__gte=0),
                name='wallet_balance_non_negative',
            ),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.currency} {self.balance}"

    def add_balance(self, amount):
        """Add amount to wallet balance.

        Rejects non-positive amounts: a negative value here would silently
        drain the wallet while the caller believes it credited it. Callers must
        hold a row lock (select_for_update) on this wallet.
        """
        amount = Decimal(amount)
        if amount <= Decimal('0'):
            raise ValueError("Credit amount must be greater than zero")
        self.balance += amount
        self.save(update_fields=['balance', 'updated_at'])

    def deduct_balance(self, amount):
        """Deduct amount from wallet balance if sufficient.

        Rejects non-positive amounts: a negative value would pass the
        `balance >= amount` check and *increase* the balance, minting money.
        Callers must hold a row lock (select_for_update) on this wallet and
        must check the return value.
        """
        amount = Decimal(amount)
        if amount <= Decimal('0'):
            raise ValueError("Debit amount must be greater than zero")
        if self.balance >= amount:
            self.balance -= amount
            self.save(update_fields=['balance', 'updated_at'])
            return True
        return False


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
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
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

    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['type']),
            # Serves LimitCheckerService.spent_in_window(), which aggregates
            # one student's completed spend in one category over a time window
            # on every payment. Without this the check is a scan of the user's
            # whole transaction history, growing with account age.
            models.Index(
                fields=['user', 'category', 'created_at'],
                name='txn_user_category_created_idx',
            ),
        ]
        constraints = [
            # MinValueValidator(0.01) on `amount` never executed on .save().
            models.CheckConstraint(
                check=models.Q(amount__gt=0),
                name='transaction_amount_positive',
            ),
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
    is_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'spending_limits'
        unique_together = ['child', 'category']
        constraints = [
            models.CheckConstraint(
                check=models.Q(daily_limit__gte=0)
                      & models.Q(weekly_limit__gte=0)
                      & models.Q(monthly_limit__gte=0),
                name='spending_limit_amounts_non_negative',
            ),
        ]

    def __str__(self):
        return f"Limit for {self.child.email} - {self.category}"

    def check_limit(self, amount, spent):
        """Return True if `amount` fits within every enabled limit.

        `spent` is a mapping {'daily': Decimal, 'weekly': Decimal,
        'monthly': Decimal} of what this child has ALREADY spent in this
        category in each window, derived from Transaction rows by
        LimitCheckerService.

        This used to read self.daily_spent / weekly_spent / monthly_spent --
        stored counters that were incremented on every payment and reset by
        nothing. There was no reset task, so `daily_spent` was really
        "spent since the account was created". Once a child's lifetime spend
        in a category passed their daily limit they were blocked permanently,
        and the parent had no way to see why. Deriving the number from the
        transactions that caused it removes both the drift and the reset job
        that could silently stop running.
        """
        if not self.is_enabled:
            return True

        windows = (
            (self.daily_limit, spent.get('daily', Decimal('0'))),
            (self.weekly_limit, spent.get('weekly', Decimal('0'))),
            (self.monthly_limit, spent.get('monthly', Decimal('0'))),
        )

        for limit, already_spent in windows:
            # A limit of 0 means "no limit set", matching the field default.
            if limit > 0 and already_spent + amount > limit:
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

class IdempotencyRecord(models.Model):
    """One completed response to a money-moving request, keyed by client token.

    Why this exists: every payment endpoint here was replay-safe only by
    accident. QR payments are protected because a QRCode is single-use and
    locked -- a second submission finds `is_used=True` and is rejected. NFC,
    airtime, transport, transfers and money-request approvals had no such
    natural key, so a double-tapped card, a mobile client retrying after a
    timeout, or a user hitting "pay" twice charged the wallet twice. The
    request succeeded both times, which is exactly why nobody noticed: there
    is no error to report, just two identical debits.

    The contract is the standard one (and mirrors the `Idempotency-Key` header
    core/http_client.py already sends to our own providers): the client
    generates a key per user-intent, not per attempt. First request with that
    key runs and its response is stored here; every later request with the same
    key returns the stored response without re-executing anything.

    `user` is part of the key so one caller's chosen token can never collide
    with -- or worse, replay -- another caller's response.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                             related_name='idempotency_records')
    key = models.CharField(max_length=255)
    endpoint = models.CharField(max_length=200)
    # Fingerprint of the request body. A client that reuses a key with a
    # DIFFERENT payload has a bug, and silently returning the first response
    # would hide it; we return 422 instead so the bug is visible.
    request_fingerprint = models.CharField(max_length=64)
    response_status = models.PositiveSmallIntegerField()
    response_body = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'idempotency_records'
        constraints = [
            # The whole mechanism rests on this. Two concurrent replays both
            # miss on SELECT and both proceed; the unique index is what makes
            # the second INSERT fail so only one of them can have executed.
            models.UniqueConstraint(fields=['user', 'key'],
                                    name='idempotency_user_key_unique'),
        ]
        indexes = [
            # Supports pruning old records by age.
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user_id}:{self.key} -> {self.response_status}"
