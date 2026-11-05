# apps/notifications/services.py
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification, NotificationPreference
import logging

logger = logging.getLogger(__name__)

# Maps notification_type to (email subject, email template)
EMAIL_TEMPLATES = {
    'transaction':              ('Payment Successful',          'emails/transaction_sent.html'),
    'transfer':                 ('Money Received',              'emails/transfer_received.html'),
    'money_request':            ('New Money Request',           'emails/money_request.html'),
    'money_request_approved':   ('Money Request Approved',      'emails/money_request.html'),
    'money_request_declined':   ('Money Request Declined',      'emails/money_request.html'),
    'alert':                    ('Account Alert',               'emails/fraud_alert.html'),
    'spending_alert':           ('Spending Alert',              'emails/transaction_sent.html'),
    'achievement':              ('Achievement Unlocked!',       'emails/transaction_sent.html'),
    'system':                   ('Important Account Update',    'emails/account_suspended.html'),
}


class NotificationService:
    """Handle all notification sending"""

    @staticmethod
    def send_notification(user, title, body, notification_type, metadata=None):
    
        notification = Notification.objects.create(
            user=user,
            title=title,
            body=body,
            notification_type=notification_type,
            metadata=metadata or {}
        )

        prefs, _ = NotificationPreference.objects.get_or_create(user=user)
        if not NotificationService._is_type_enabled(prefs, notification_type):
            logger.info(
                f'Notification suppressed by preferences | '
                f'user={user.id} | type={notification_type}'
            )
            return notification

        NotificationService.send_websocket(user.id, notification)

        if prefs.email_enabled:
            context = {
                'user': user,
                **(metadata or {}),
            }
            NotificationService.send_email(
                user=user,
                notification_type=notification_type,
                context=context,
            )
        if prefs.push_enabled:
            NotificationService.send_push(
                user=user,
                title=title,
                body=body,
                data=metadata or {},
            )

        if prefs.sms_enabled and notification_type in ('alert', 'system'):
            NotificationService.send_sms(
                phone_number=getattr(user, 'phone_number', None),
                message=f'HapoPay Alert: {title}. {body}',
            )

        return notification

    @staticmethod
    def _is_type_enabled(prefs, notification_type):
        if notification_type in ('transaction', 'transfer', 'alert'):
            return prefs.transaction_alerts
        if notification_type == 'spending_alert':
            return prefs.spending_alerts
        if notification_type == 'promotion':
            return prefs.promotion_alerts
        return True  

    @staticmethod
    def send_websocket(user_id, notification):
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'user_{user_id}',
                {
                    'type': 'notification',
                    'notification': {
                        'id':         str(notification.id),
                        'title':      notification.title,
                        'body':       notification.body,
                        'type':       notification.notification_type,
                        'created_at': notification.created_at.isoformat(),
                        'metadata':   notification.metadata,
                    }
                }
            )
        except Exception as e:
            logger.error(f'WebSocket notification failed | user={user_id} | error={e}')

    @staticmethod
    def send_email(user, notification_type, context):
        try:
            subject, template = EMAIL_TEMPLATES.get(
                notification_type,
                ('HapoPay Notification', 'emails/transaction_sent.html')
            )
            html_content = render_to_string(template, context)

            msg = EmailMultiAlternatives(
                subject=f'HapoPay: {subject}',
                body=html_content,           # plain text fallback
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
            )
            msg.attach_alternative(html_content, 'text/html')
            msg.send(fail_silently=False)

            logger.info(f'Email sent | user={user.id} | type={notification_type}')
        except Exception as e:
            logger.error(f'Email failed | user={user.id} | error={e}')

    @staticmethod
    def send_push(user, title, body, data=None):
        """Send Firebase push notification to all active device tokens"""
        try:
            import firebase_admin
            from firebase_admin import credentials, messaging

            if not firebase_admin._apps:
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred)

            tokens = list(
                user.device_tokens.filter(is_active=True).values_list('token', flat=True)
            )
            if not tokens:
                return

            message = messaging.MulticastMessage(
                notification=messaging.Notification(title=title, body=body),
                data={k: str(v) for k, v in (data or {}).items()},
                tokens=tokens,
            )
            response = messaging.send_each_for_multicast(message)

            for idx, result in enumerate(response.responses):
                if not result.success:
                    user.device_tokens.filter(token=tokens[idx]).update(is_active=False)
                    logger.warning(f'Deactivated invalid FCM token | user={user.id}')

            logger.info(
                f'Push sent | user={user.id} | '
                f'success={response.success_count} | failed={response.failure_count}'
            )
        except Exception as e:
            logger.error(f'Push notification failed | user={user.id} | error={e}')

  