# apps/admin_panel/models.py
from django.db import models
from django.conf import settings
import uuid


class SystemConfig(models.Model):
    """
    Stores system-wide configuration key-value pairs.
    Used for feature flags, limits, and runtime settings that admins
    can change without redeploying the application.
    """
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
    """
    Immutable record of every significant action performed in the system.
    Used for security audits, debugging, and compliance.
    Never update or delete these records.
    """
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


# NOTE: The FraudAlert model is defined in apps/payments/models.py
# because fraud detection is a payments concern. Admin panel views
# import it from there.