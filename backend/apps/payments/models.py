# apps/payments/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

FRAUD_SEVERITY_CHOICES = [
    ('low', 'Low'),
    ('medium', 'Medium'),
    ('high','High'),
    ('critical', 'Critical'),
]

FRAUD_STATUS_CHOICES = [
    ('large_single_transaction', 'Large Single Transaction'),
    ('velocity_hourly', 'Hourly Velocity'),
    ('velocity_daily', 'Daily Velocity'),
    ('hourly_volume_exceeded', 'Hourly Volume Exceeded'),
    ('unusual_hours', 'Unusual Hours'),
    ('new_recipient_large', ' Large To New Recipient'),
    ('multiple_rules', 'Multiple Rules Triggered'),
    ('rapid_succession', 'Rapid Succession'),
]

FRAUD_ALERT_TYPE_CHOICES = [
    ('large_single_transaction', 'Large Single Transaction'),
    ('velocity_hourly', 'Hourly Velocity'),
    ('velocity_daily', 'Daily Velocity'),
    ('hourly_volume_exceeded', 'Hourly Volume Exceeded'),
    ('unusual_hours', 'Unusual Hours'),
    ('new_recipient_large', 'Large To New Recipient'),
    ('multiple_rules', 'Multiple Rules Triggered'),
    ('rapid_succession', 'Rapid Succession'),
]
class Merchant(models.Model):
    CATEGORY_CHOICES = [
        ('retail', 'Retail'),
        ('restaurant', 'Restaurant'),
        ('transport', 'Transport'),
        ('entertainment', 'Entertainment'),
        ('education', 'Education'),
        ('healthcare', 'Healthcare'),
        ('airtime', 'Airtime'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                 related_name='merchant_business', null=True, blank=True,
                                 limit_choices_to={'role': 'merchant'})
    name = models.CharField(max_length=200)
    business_registration = models.CharField(max_length=100, unique=True)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
                                    related_name='verified_merchants')
    verified_at = models.DateTimeField(null=True, blank=True)
    logo_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'merchants'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.category}"


class QRCode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE, related_name='qr_codes')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    description = models.CharField(max_length=200, blank=True, null=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    used_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    used_at = models.DateTimeField(null=True, blank=True)
    qr_image = models.TextField(blank=True, null=True)  # Base64 encoded QR image
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'qr_codes'
        indexes = [
            models.Index(fields=['merchant', 'expires_at']),
            models.Index(fields=['is_used']),
        ]

    def __str__(self):
        return f"QR for {self.merchant.name} - {self.amount}"


class NFCToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='nfc_tokens')
    device_id = models.CharField(max_length=200)
    token = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField()
    last_used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'nfc_tokens'
        unique_together = ['user', 'device_id']

    def __str__(self):
        return f"NFC Token for {self.user.email} - {self.device_id}"


class AirtimePurchase(models.Model):
    PROVIDER_CHOICES = [
        ('vodacom', 'Vodacom'),
        ('mtn', 'MTN'),
        ('cellc', 'Cell C'),
        ('telkom', 'Telkom'),
        ('rain', 'Rain'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='airtime_purchases')
    phone_number = models.CharField(max_length=15)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(1)])
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'airtime_purchases'
        ordering = ['-created_at']

    def __str__(self):
        return f"Airtime {self.amount} for {self.phone_number} ({self.provider})"


class TransportTicket(models.Model):
    TICKET_TYPES = [
        ('bus', 'Bus'),
        ('train', 'Train'),
        ('taxi', 'Taxi'),
        ('uber', 'Uber'),
        ('bolt', 'Bolt'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('used', 'Used'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transport_tickets')
    ticket_type = models.CharField(max_length=20, choices=TICKET_TYPES)
    route = models.CharField(max_length=200)
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    seat_number = models.CharField(max_length=20, blank=True, null=True)
    qr_code = models.TextField(blank=True, null=True)  # Base64 encoded ticket QR
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    reference = models.CharField(max_length=100, unique=True, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transport_tickets'
        ordering = ['-departure_time']

    def __str__(self):
        return f"{self.ticket_type} - {self.route} ({self.amount})"



class FraudAlert(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey('wallets.Transaction', on_delete=models.CASCADE, related_name='fraud_alerts')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='fraud_alerts')
    alert_type = models.CharField(max_length=50, choices=FRAUD_ALERT_TYPE_CHOICES, default='multiple_rules')
    reasons = models.JSONField(default=list)
    severity = models.CharField(max_length=30, choices=FRAUD_SEVERITY_CHOICES,default='low')
    status= models.CharField(max_length=30,choices=FRAUD_STATUS_CHOICES,default='pending')
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
                                    related_name='reviewed_fraud_alerts')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    review_notes = models.TextField(blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes =[
            models.Index(fields=['severity']),
            models.Index(fields=['status']),
            models.Index(fields=['user']),
            models.Index(fields=['created_at']),
        ]
    def __str__(self):
        return f"FraudAlert [{self.severity}] - {self.user.email} - {self.status}"


class Settlement(models.Model):
    """A payout batch of a merchant's completed transactions."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE, related_name='settlements')
    # M2M rather than a FK on Transaction: avoids a payments->wallets migration
    # ordering dependency on a field that lives on the wallets side, and
    # Transaction.merchant_id is a bare UUID (not a real FK) so this is the
    # cleanest way to track exactly which transactions a payout covered.
    transactions = models.ManyToManyField('wallets.Transaction', related_name='settlements', blank=True)
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    transaction_count = models.PositiveIntegerField(default=0)
    gross_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fee_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    initiated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
                                     related_name='initiated_settlements')
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'settlements'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['merchant', 'status']),
            models.Index(fields=['period_start', 'period_end']),
        ]

    def __str__(self):
        return f"Settlement for {self.merchant.name} - {self.net_amount} ({self.status})"