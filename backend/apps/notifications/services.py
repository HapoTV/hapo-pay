# apps/notifications/services.py
from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification, NotificationPreference
import json
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Handle all notification sending"""

    @staticmethod
    def send_notification(user, title, body, notification_type, metadata=None):
        """Persist a notification and deliver it on every enabled channel.

        Two behaviours changed here, both of which broke promised features:

        1. Preferences are created on demand. The old code did
           `NotificationPreference.objects.get(user=user)` and set prefs=None on
           DoesNotExist, so email and push were skipped entirely for any user
           who had never opened the preferences screen -- which is every user,
           because nothing else creates that row. Both flags default to True,
           so the intent was clearly for them to fire. get_or_create applies
           those defaults.

        2. Delivery is deferred to transaction commit. This method is called
           from inside money-movement transactions that hold select_for_update
           locks on wallet rows. Sending SMTP mail inline held those locks for
           the duration of the mail handshake, and a notification sent before a
           later rollback told the user they had received money that they had
           not. on_commit means nothing is delivered unless the money actually
           moved, and a slow mail server can never stall a payment.
        """

        # Create notification record (in-transaction: it must be consistent
        # with the financial rows it describes).
        notification = Notification.objects.create(
            user=user,
            title=title,
            body=body,
            notification_type=notification_type,
            metadata=metadata or {}
        )

        prefs, _ = NotificationPreference.objects.get_or_create(user=user)

        user_id = user.id
        user_email = user.email
        email_enabled = prefs.email_enabled
        push_enabled = prefs.push_enabled

        def _deliver():
            # Real-time
            NotificationService.send_websocket(user_id, notification)

            if email_enabled:
                NotificationService.send_email(user_email, title, body)

            if push_enabled:
                NotificationService.send_push_notification(user, title, body, metadata)

        # Outside an atomic block on_commit runs immediately, so this is also
        # correct for callers that are not in a transaction.
        transaction.on_commit(_deliver)

        return notification

    @staticmethod
    def send_websocket(user_id, notification):
        """Send notification via WebSocket"""
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{user_id}",
                {
                    'type': 'notification',
                    'notification': {
                        'id': str(notification.id),
                        'title': notification.title,
                        'body': notification.body,
                        'type': notification.notification_type,
                        'created_at': notification.created_at.isoformat()
                    }
                }
            )
        except Exception as e:
            logger.error(f"WebSocket notification failed: {str(e)}")

    @staticmethod
    def send_email(recipient_email, subject, body):
        """Send email notification"""
        try:
            send_mail(
                subject=f"HapoPay: {subject}",
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Email notification failed: {str(e)}")

    @staticmethod
    def send_push_notification(user, title, body, metadata):
        """Send push notification via Firebase"""
        try:
            # This is a mock implementation
            # Replace with actual Firebase Cloud Messaging integration

            # Get user's FCM token (stored in user profile)
            # fcm_token = user.profile.fcm_token
            # if fcm_token:
            #     from firebase_admin import messaging
            #     message = messaging.Message(
            #         notification=messaging.Notification(
            #             title=title,
            #             body=body,
            #         ),
            #         token=fcm_token,
            #         data=metadata or {}
            #     )
            #     response = messaging.send(message)

            logger.info(f"Push notification sent to {user.email}: {title}")
        except Exception as e:
            logger.error(f"Push notification failed: {str(e)}")