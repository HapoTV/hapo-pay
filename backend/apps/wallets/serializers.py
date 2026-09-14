# apps/wallets/serializers.py
from rest_framework import serializers
from django.utils import timezone
from decimal import Decimal
from .models import Wallet, Transaction, SpendingLimit, MoneyRequest
from .services import LimitCheckerService
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
    """Serializes a spending limit, including how much has been spent.

    daily_spent / weekly_spent / monthly_spent used to be stored columns. They
    are now derived from Transaction rows on read. The JSON shape is
    deliberately unchanged -- the Flutter and web clients already render these
    three keys, and the point of this change is that the numbers become
    correct, not that the contract moves.
    """

    child_email = serializers.EmailField(source='child.email', read_only=True)
    parent_email = serializers.EmailField(source='parent.email', read_only=True)

    daily_spent = serializers.SerializerMethodField()
    weekly_spent = serializers.SerializerMethodField()
    monthly_spent = serializers.SerializerMethodField()

    class Meta:
        model = SpendingLimit
        fields = ('id', 'child', 'child_email', 'parent', 'parent_email', 'category',
                  'daily_limit', 'weekly_limit', 'monthly_limit', 'daily_spent',
                  'weekly_spent', 'monthly_spent', 'is_enabled', 'created_at')
        read_only_fields = ('id', 'child', 'parent')

    def _spent(self, obj):
        """Per-child spend map, computed once per serialization pass.

        Cached on the serializer context so rendering a child's nine categories
        costs one query rather than nine. `self.context` is shared across the
        whole `many=True` pass, which is exactly the scope we want.
        """
        cache = self.context.setdefault('_spent_by_child', {})
        if obj.child_id not in cache:
            cache[obj.child_id] = LimitCheckerService.spent_by_category(obj.child_id)
        return cache[obj.child_id].get(obj.category, {})

    def get_daily_spent(self, obj):
        return self._spent(obj).get('daily', Decimal('0'))

    def get_weekly_spent(self, obj):
        return self._spent(obj).get('weekly', Decimal('0'))

    def get_monthly_spent(self, obj):
        return self._spent(obj).get('monthly', Decimal('0'))


class MoneyRequestSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source='child.profile.full_name', read_only=True)
    parent_name = serializers.CharField(source='parent.profile.full_name', read_only=True)

    class Meta:
        model = MoneyRequest
        fields = ('id', 'child', 'child_name', 'parent', 'parent_name', 'amount',
                  'reason', 'status', 'parent_notes', 'created_at', 'responded_at')
        # MoneyRequestViewSet is a ModelViewSet, so PUT/PATCH on a request are
        # routed straight into this serializer. With only id/created_at/
        # responded_at read-only, a student could PATCH their own pending
        # request to rewrite `amount`, flip `status` to 'approved', or
        # re-point `child`/`parent` at other accounts. Money movement is owned
        # by ApproveMoneyRequestView; everything that identifies or prices the
        # request is now server-controlled.
        read_only_fields = ('id', 'child', 'parent', 'amount', 'status',
                            'parent_notes', 'created_at', 'responded_at')


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