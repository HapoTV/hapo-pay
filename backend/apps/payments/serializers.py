# apps/payments/serializers.py
from rest_framework import serializers
from decimal import Decimal
from .models import Merchant, QRCode, NFCToken, AirtimePurchase, TransportTicket


class MerchantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchant
        fields = ('id', 'name', 'category', 'address', 'logo_url', 'verified', 'created_at')
        read_only_fields = ('id', 'verified', 'created_at')


class QRCodeSerializer(serializers.ModelSerializer):
    merchant_name = serializers.CharField(source='merchant.name', read_only=True)

    class Meta:
        model = QRCode
        fields = ('id', 'merchant', 'merchant_name', 'amount', 'description',
                  'expires_at', 'is_used', 'qr_image', 'created_at')
        read_only_fields = ('id', 'is_used', 'created_at')


class NFCTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = NFCToken
        fields = ('id', 'device_id', 'token', 'is_active', 'expires_at', 'created_at')
        read_only_fields = ('id', 'token', 'created_at')


class AirtimePurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AirtimePurchase
        fields = ('id', 'phone_number', 'amount', 'provider', 'status',
                  'transaction_id', 'created_at', 'completed_at')
        read_only_fields = ('id', 'status', 'transaction_id', 'created_at', 'completed_at')


class TransportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportTicket
        fields = ('id', 'ticket_type', 'route', 'departure_time', 'arrival_time',
                  'amount', 'seat_number', 'qr_code', 'status', 'reference', 'created_at')
        read_only_fields = ('id', 'qr_code', 'reference', 'created_at')


class QRPaymentSerializer(serializers.Serializer):
    qr_id = serializers.UUIDField()


class NFCPaymentSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=255)
    # Was required=False with no min_value, and the view fell back to the raw
    # unvalidated request body. A negative amount reached deduct_balance() and
    # *increased* the payer's balance; a string amount raised TypeError (500).
    amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=Decimal('0.01')
    )


class AirtimeBuySerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    amount = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        min_value=Decimal('1'), max_value=Decimal('1000'),
    )
    provider = serializers.ChoiceField(choices=AirtimePurchase.PROVIDER_CHOICES)


class TransportBuySerializer(serializers.Serializer):
    ticket_type = serializers.ChoiceField(choices=TransportTicket.TICKET_TYPES)
    route = serializers.CharField(max_length=200)
    departure_time = serializers.DateTimeField()
    arrival_time = serializers.DateTimeField()
    amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=Decimal('0.01')
    )
    seat_number = serializers.CharField(max_length=20, required=False)

    def validate(self, data):
        if data['arrival_time'] <= data['departure_time']:
            raise serializers.ValidationError(
                {'arrival_time': 'Arrival must be after departure.'}
            )
        return data


class GenerateQRCodeSerializer(serializers.Serializer):
    """Validates QR generation input, which the view previously read straight
    from request.data: an unvalidated `amount` (negative/string/absent) and an
    unvalidated `expires_in` (non-numeric raised TypeError in timedelta)."""
    merchant_id = serializers.UUIDField()
    amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=Decimal('0.01')
    )
    description = serializers.CharField(max_length=200, required=False, allow_blank=True)
    expires_in = serializers.IntegerField(min_value=1, max_value=1440, default=15)