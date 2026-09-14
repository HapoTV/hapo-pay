# apps/admin_panel/models.py
from django.db import models
from django.conf import settings
import uuid


class SystemConfig(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = 'system_config'

    def __str__(self):
        return f"{self.key} = {self.value[:50]}"


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('payment', 'Payment'),
        ('transfer', 'Transfer'),
        ('admin_action', 'Admin Action'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=50)
    resource_id = models.CharField(max_length=100, null=True, blank=True)
    changes = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email if self.user else 'Anonymous'} - {self.action} - {self.created_at}"


# class FraudAlert(models.Model):
#     ALERT_TYPES = [
#         ('large_transaction', 'Large Transaction'),
#         ('unusual_pattern', 'Unusual Pattern'),
#         ('multiple_failures', 'Multiple Failures'),
#         ('suspicious_merchant', 'Suspicious Merchant',
#         ('location_mismatch', 'Location Mismatch'),
#     ]

#     SEVERITY_CHOICES = [
#         ('low', 'Low'),
#         ('medium', 'Medium'),
#         ('high', 'High'),
#         ('critical', 'Critical'),
#     ]

#     STATUS_CHOICES = [
#         ('pending', 'Pending Review'),
#         ('investigating', 'Under Investigation'),
#         ('confirmed', 'Confirmed Fraud'),
#         ('false_positive', 'False Positive'),
#         ('resolved', 'Resolved'),
#     ]

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     transaction = models.ForeignKey('wallets.Transaction', on_delete=models.CASCADE, related_name='fraud_alerts')
#     alert_type = models.CharField(max_length=30, choices=ALERT_TYPES)
#     severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
#     description = models.TextField()
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
#     resolved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
#     resolution_notes = models.TextField(blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     resolved_at = models.DateTimeField(null=True, blank=True)

#     class Meta:
#         db_table = 'fraud_alerts'
#         ordering = ['-severity', '-created_at']

#     def __str__(self):
#         return f"{self.alert_type} - {self.severity} - {self.transaction.id}"