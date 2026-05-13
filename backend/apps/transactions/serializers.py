from rest_framework import serializers
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id", "child", "amount", "currency", "transaction_type",
            "status", "description", "merchant_name", "reference", "created_at",
        ]
        read_only_fields = ["id", "status", "reference", "created_at"]
