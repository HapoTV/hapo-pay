# apps/notifications/admin.py
from django.contrib import admin
from .models import Notification, NotificationPreference
import logging

logger = logging.getLogger(__name__)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """
    Django admin configuration for the Notification model.
    """
    list_display = ('user', 'title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('user__email', 'title', 'body')
    readonly_fields = ('created_at',)

    def has_add_permission(self, request):
        """
        Disable manual addition of notifications via the admin.
        Notifications should be created programmatically.
        """
        try:
            return False
        except Exception as e:
            logger.error(f"Error checking add permission: {str(e)}")
            return False


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    """
    Django admin configuration for the NotificationPreference model.
    """
    list_display = ('user', 'email_enabled', 'push_enabled', 'sms_enabled')
    list_filter = ('email_enabled', 'push_enabled', 'sms_enabled')
    search_fields = ('user__email',)