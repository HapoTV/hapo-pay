# apps/wallets/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import Wallet, Transaction, SpendingLimit, MoneyRequest
from apps.accounts.models import User


class WalletSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Wallet
        fields = ('id', 'user', 'user_email', 'balance', 'currency', 'is_active', 'created_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')


class TransactionSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Transaction
        fields = ('id', 'user', 'user_email', 'amount', 'type', 'category', 'status',
                  'description', 'merchant_name', 'merchant_id', 'reference_id',
                  'metadata', 'created_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')


class SpendingLimitSerializer(serializers.ModelSerializer):
    child_email = serializers.EmailField(source='child.email', read_only=True)
    parent_email = serializers.EmailField(source='parent.email', read_only=True)

    class Meta:
        model = SpendingLimit
        fields = ('id', 'child', 'child_email', 'parent', 'parent_email', 'category',
                  'daily_limit', 'weekly_limit', 'monthly_limit', 'daily_spent',
                  'weekly_spent', 'monthly_spent', 'is_enabled', 'created_at')
        read_only_fields = ('id', 'child', 'parent', 'daily_spent', 'weekly_spent', 'monthly_spent')


class MoneyRequestSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.profile.full_name', read_only=True)
    parent_name = serializers.CharField(source='parent.profile.full_name', read_only=True)

    class Meta:
        model = MoneyRequest
        fields = ('id', 'child', 'child_name', 'parent', 'parent_name', 'amount',
                  'reason', 'status', 'parent_notes', 'created_at', 'responded_at')
        read_only_fields = ('id', 'created_at', 'responded_at')


class TransferFundsSerializer(serializers.Serializer):
    recipient_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)
    description = serializers.CharField(max_length=255, required=False)


class UpdateSpendingLimitSerializer(serializers.Serializer):
    category = serializers.ChoiceField(choices=Transaction.CATEGORY_CHOICES)
    daily_limit = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    weekly_limit = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    monthly_limit = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    is_enabled = serializers.BooleanField(default=True)


class CreateMoneyRequestSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)
    reason = serializers.CharField(max_length=500)


class ApproveMoneyRequestSerializer(serializers.Serializer):
    request_id = serializers.UUIDField()
    action = serializers.ChoiceField(choices=['approve', 'decline'])
    parent_notes = serializers.CharField(max_length=500, required=False)