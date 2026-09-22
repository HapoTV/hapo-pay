# apps/notifications/services.py
from django.core.mail import send_mail
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification, NotificationPreference
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Central service for sending notifications across multiple channels:
    - In-app (database record)
    - Real-time (WebSocket)
    - Email
    - Push (Firebase Cloud Messaging)
    """

    @staticmethod
    def send_notification(user, title, body, notification_type, metadata=None):
        """
        Send a notification to a user via all enabled channels.

        Args:
            user: The user to notify.
            title (str): Notification title.
            body (str): Notification body/content.
            notification_type (str): Type of notification (see Notification.NOTIFICATION_TYPES).
            metadata (dict, optional): Extra data to attach to the notification.

        Returns:
            Notification: The created Notification instance, or None if failed.
        """
        try:
            # Validate user
            if not user:
                logger.error("send_notification called with no user.")
                return None

            # Create notification record in the database
            notification = Notification.objects.create(
                user=user,
                title=title,
                body=body,
                notification_type=notification_type,
                metadata=metadata or {}
            )

            # Fetch user preferences (optional)
            prefs = None
            try:
                prefs = NotificationPreference.objects.get(user=user)
            except NotificationPreference.DoesNotExist:
                logger.info(f"No notification preferences found for {user.email}, using defaults.")
            except Exception as e:
                logger.error(f"Error fetching notification preferences for {user.email}: {str(e)}")

            # Send via WebSocket (real-time, always attempt)
            NotificationService.send_websocket(user.id, notification)

            # Send email if enabled
            if prefs and prefs.email_enabled:
                NotificationService.send_email(user.email, title, body)

            # Send push notification if enabled
            if prefs and prefs.push_enabled:
                NotificationService.send_push_notification(user, title, body, metadata)

            logger.info(f"Notification sent to {user.email}: {title}")
            return notification

        except Exception as e:
            logger.error(f"Failed to send notification to {user}: {str(e)}")
            return None

    @staticmethod
    def send_websocket(user_id, notification):
        """
        Send a notification via WebSocket to the user's group.

        Args:
            user_id (str/UUID): The ID of the user.
            notification (Notification): The notification instance to send.
        """
        try:
            channel_layer = get_channel_layer()
            if not channel_layer:
                logger.warning("Channel layer not available. Skipping WebSocket notification.")
                return

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
            logger.info(f"WebSocket notification sent to user {user_id}")
        except Exception as e:
            logger.error(f"WebSocket notification failed for user {user_id}: {str(e)}")

    @staticmethod
    def send_email(recipient_email, subject, body):
        """
        Send an email notification.

        Args:
            recipient_email (str): Email address of the recipient.
            subject (str): Email subject.
            body (str): Email body content.
        """
        try:
            send_mail(
                subject=f"HapoPay: {subject}",
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False,
            )
            logger.info(f"Email sent to {recipient_email}: {subject}")
        except Exception as e:
            logger.error(f"Email notification failed for {recipient_email}: {str(e)}")

    @staticmethod
    def send_push_notification(user, title, body, metadata):
        """
        Send a push notification via Firebase Cloud Messaging (FCM).

        NOTE: This is currently a stub implementation. Replace with real FCM logic.

        Args:
            user: The user to send the push notification to.
            title (str): Notification title.
            body (str): Notification body.
            metadata (dict): Extra data to include in the push payload.
        """
        try:
            # --- Placeholder for real FCM integration ---
            # fcm_token = user.profile.fcm_token
            # if fcm_token:
            #     from firebase_admin import messaging
            #     message = messaging.Message(
            #         notification=messaging.Notification(title=title, body=body),
            #         token=fcm_token,
            #         data=metadata or {}
            #     )
            #     response = messaging.send(message)
            #     logger.info(f"Push notification sent: {response}")
            # else:
            #     logger.warning(f"No FCM token for user {user.email}")
            # ---------------------------------------------

            logger.info(f"Push notification (stub) sent to {user.email}: {title}")
        except Exception as e:
            logger.error(f"Push notification failed for {user.email}: {str(e)}")