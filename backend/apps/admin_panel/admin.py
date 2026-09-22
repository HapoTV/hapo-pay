# apps/admin_panel/admin.py
from django.contrib import admin
from .models import SystemConfig, AuditLog
from apps.payments.models import FraudAlert


@admin.register(SystemConfig)
class SystemConfigAdmin(admin.ModelAdmin):
    """
    Django admin for system configuration values.
    """
    list_display = ('key', 'value', 'updated_at')
    search_fields = ('key',)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """
    Django admin for audit log entries.
    Read-only on the created_at field since it is auto-set.
    """
    list_display = ('user', 'action', 'ip_address', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('user__email', 'ip_address')
    readonly_fields = ('created_at',)


@admin.register(FraudAlert)
class FraudAlertAdmin(admin.ModelAdmin):
    """
    Django admin for fraud alerts.
    Filterable by alert type, severity and status for quick triage.
    """
    list_display = ('transaction', 'alert_type', 'severity', 'status', 'created_at')
    list_filter = ('alert_type', 'severity', 'status', 'created_at')
    search_fields = ('transaction__user__email',)