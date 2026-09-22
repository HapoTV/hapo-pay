# apps/notifications/serializers.py
from rest_framework import serializers
from .models import Notification, NotificationPreference
import logging

logger = logging.getLogger(__name__)


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Notification model.

    Exposes the notification's fields for API responses.
    """
    class Meta:
        model = Notification
        fields = (
            'id', 'title', 'body', 'notification_type',
            'is_read', 'metadata', 'created_at'
        )
        read_only_fields = ('id', 'created_at')

    def to_representation(self, instance):
        """
        Customize the serialized output (e.g., ensure metadata is JSON-safe).
        """
        try:
            return super().to_representation(instance)
        except Exception as e:
            logger.error(f"Error serializing notification {getattr(instance, 'id', 'unknown')}: {str(e)}")
            return {
                'id': str(getattr(instance, 'id', '')),
                'title': getattr(instance, 'title', ''),
                'body': getattr(instance, 'body', ''),
                'notification_type': getattr(instance, 'notification_type', ''),
                'is_read': getattr(instance, 'is_read', False),
                'metadata': {},
                'created_at': None,
            }


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer for the NotificationPreference model.

    Allows users to toggle which channels and categories of notifications they receive.
    """
    class Meta:
        model = NotificationPreference
        fields = (
            'email_enabled', 'push_enabled', 'sms_enabled',
            'transaction_alerts', 'spending_alerts', 'promotion_alerts'
        )

    def validate(self, data):
        """
        Validate that at least one delivery channel remains enabled.
        """
        try:
            # Prevent disabling all channels at once (optional business rule)
            all_channels = ['email_enabled', 'push_enabled', 'sms_enabled']
            provided = {k: data.get(k) for k in all_channels if k in data}

            if provided and not any(provided.values()):
                raise serializers.ValidationError(
                    "At least one notification channel must remain enabled."
                )
            return data
        except serializers.ValidationError:
            raise
        except Exception as e:
            logger.error(f"Error validating notification preferences: {str(e)}")
            raise serializers.ValidationError("Invalid notification preferences.")