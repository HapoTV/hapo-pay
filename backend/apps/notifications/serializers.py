# apps/notifications/serializers.py
from rest_framework import serializers
from .models import Notification, NotificationPreference

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'title', 'body', 'notification_type', 'is_read', 'metadata', 'created_at')
        read_only_fields = ('id', 'created_at')

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ('email_enabled', 'push_enabled', 'sms_enabled',
                 'transaction_alerts', 'spending_alerts', 'promotion_alerts')