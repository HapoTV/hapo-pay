# apps/notifications/services.py
from django.core.mail import send_mail
from django.conf import settings
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
        """Send notification to user via all enabled channels"""

        # Create notification record
        notification = Notification.objects.create(
            user=user,
            title=title,
            body=body,
            notification_type=notification_type,
            metadata=metadata or {}
        )

        # Get user preferences
        try:
            prefs = NotificationPreference.objects.get(user=user)
        except NotificationPreference.DoesNotExist:
            prefs = None

        # Send WebSocket (real-time)
        NotificationService.send_websocket(user.id, notification)

        # Send email if enabled
        if prefs and prefs.email_enabled:
            NotificationService.send_email(user.email, title, body)

        # Send push notification if enabled
        if prefs and prefs.push_enabled:
            NotificationService.send_push_notification(user, title, body, metadata)

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