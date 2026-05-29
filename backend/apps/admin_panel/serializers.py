# apps/admin_panel/serializers.py
from rest_framework import serializers
from .models import SystemConfig, AuditLog, FraudAlert
from apps.accounts.models import User
from apps.wallets.models import Transaction


class SystemConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemConfig
        fields = ('key', 'value', 'description', 'updated_at')
        read_only_fields = ('updated_at',)


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = AuditLog
        fields = ('id', 'user', 'user_email', 'action', 'resource_type',
                  'resource_id', 'changes', 'ip_address', 'created_at')
        read_only_fields = ('id', 'created_at')


class FraudAlertSerializer(serializers.ModelSerializer):
    transaction_details = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='transaction.user.email', read_only=True)

    class Meta:
        model = FraudAlert
        fields = ('id', 'transaction', 'transaction_details', 'user_email', 'alert_type',
                  'severity', 'description', 'status', 'resolution_notes', 'created_at', 'resolved_at')
        read_only_fields = ('id', 'created_at')

    def get_transaction_details(self, obj):
        return {
            'amount': obj.transaction.amount,
            'type': obj.transaction.type,
            'created_at': obj.transaction.created_at,
            'merchant': obj.transaction.merchant_name
        }


class UserManagementSerializer(serializers.ModelSerializer):
    profile_name = serializers.CharField(source='profile.full_name', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'is_active', 'profile_name', 'created_at', 'last_login')
        read_only_fields = ('id', 'created_at')


class PlatformAnalyticsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_transactions = serializers.IntegerField()
    total_volume = serializers.DecimalField(max_digits=15, decimal_places=2)
    active_users = serializers.IntegerField()
    pending_alerts = serializers.IntegerField()