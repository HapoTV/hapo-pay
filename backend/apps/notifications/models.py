# apps/notifications/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid
import logging

logger = logging.getLogger(__name__)


class Notification(models.Model):
    """
    Model representing a notification sent to a user.

    Notifications can be of various types (transaction, transfer, alerts, etc.)
    and are used to inform users about important events in the HapoPay system.
    """
    NOTIFICATION_TYPES = [
        ('transaction', 'Transaction'),
        ('transfer', 'Transfer'),
        ('money_request', 'Money Request'),
        ('money_request_approved', 'Request Approved'),
        ('money_request_declined', 'Request Declined'),
        ('alert', 'Alert'),
        ('spending_alert', 'Spending Alert'),
        ('achievement', 'Achievement'),
        ('promotion', 'Promotion'),
        ('system', 'System'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    body = models.TextField()
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['is_read']),
        ]

    def __str__(self):
        """Return a human-readable representation of the notification."""
        try:
            return f"{self.user.email} - {self.title}"
        except Exception as e:
            logger.error(f"Error in Notification.__str__: {str(e)}")
            return f"Notification {self.id}"

    def mark_as_read(self):
        """
        Mark this notification as read and record the timestamp.

        Returns:
            bool: True if successful, False otherwise.
        """
        try:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
            logger.info(f"Notification {self.id} marked as read for user {self.user.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to mark notification {self.id} as read: {str(e)}")
            return False


class NotificationPreference(models.Model):
    """
    Model storing user preferences for receiving notifications.

    Controls whether notifications are sent via email, push, or SMS,
    and which categories of notifications the user wants to receive.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )
    email_enabled = models.BooleanField(default=True)
    push_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)
    transaction_alerts = models.BooleanField(default=True)
    spending_alerts = models.BooleanField(default=True)
    promotion_alerts = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notification_preferences'

    def __str__(self):
        """Return a human-readable representation of the preferences."""
        try:
            return f"Preferences for {self.user.email}"
        except Exception as e:
            logger.error(f"Error in NotificationPreference.__str__: {str(e)}")
            return f"Preferences {self.id}"