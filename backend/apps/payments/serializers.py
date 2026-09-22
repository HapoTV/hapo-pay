# apps/payments/serializers.py
from rest_framework import serializers
from .models import Merchant, QRCode, NFCToken, AirtimePurchase, TransportTicket


class MerchantSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for merchant listings.

    Merchants are created and verified by admins, so clients only ever
    read this data. We deliberately hide sensitive fields like
    `business_registration` and contact details from the public API.
    """

    class Meta:
        model = Merchant
        fields = ('id', 'name', 'category', 'address', 'logo_url', 'verified', 'created_at')
        read_only_fields = ('id', 'verified', 'created_at')


class QRCodeSerializer(serializers.ModelSerializer):
    """
    Serializes QR code records. Adds a convenience `merchant_name` field
    so the frontend doesn't need a second request to display it.
    """

    merchant_name = serializers.CharField(source='merchant.name', read_only=True)

    class Meta:
        model = QRCode
        fields = (
            'id', 'merchant', 'merchant_name', 'amount', 'description',
            'expires_at', 'is_used', 'qr_image', 'created_at',
        )
        read_only_fields = ('id', 'is_used', 'created_at')


class NFCTokenSerializer(serializers.ModelSerializer):
    """
    Serializes NFC tokens. `token` and `id` are read-only because the
    server generates them during registration — clients must never be
    able to set their own token value.
    """

    class Meta:
        model = NFCToken
        fields = ('id', 'device_id', 'token', 'is_active', 'expires_at', 'created_at')
        read_only_fields = ('id', 'token', 'created_at')


class AirtimePurchaseSerializer(serializers.ModelSerializer):
    """
    Read-only view of airtime purchase history. Mutations happen through
    the dedicated `AirtimePurchaseView` endpoint, not through CRUD.
    """

    class Meta:
        model = AirtimePurchase
        fields = (
            'id', 'phone_number', 'amount', 'provider', 'status',
            'transaction_id', 'created_at', 'completed_at',
        )
        read_only_fields = ('id', 'status', 'transaction_id', 'created_at', 'completed_at')


class TransportTicketSerializer(serializers.ModelSerializer):
    """
    Read-only view of transport tickets. As with airtime, ticket
    creation goes through a dedicated endpoint.
    """

    class Meta:
        model = TransportTicket
        fields = (
            'id', 'ticket_type', 'route', 'departure_time', 'arrival_time',
            'amount', 'seat_number', 'qr_code', 'status', 'reference', 'created_at',
        )
        read_only_fields = ('id', 'qr_code', 'reference', 'created_at')


class QRPaymentSerializer(serializers.Serializer):
    """Input serializer for scanning/paying a QR code."""

    qr_id = serializers.UUIDField()


class NFCPaymentSerializer(serializers.Serializer):
    """
    Input serializer for NFC tap-to-pay.

    `amount` is optional because in some flows the terminal sends the
    amount separately (e.g. via a signed payload).
    """

    token = serializers.CharField()
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False
    )


class AirtimeBuySerializer(serializers.Serializer):
    """Input serializer for buying airtime."""

    phone_number = serializers.CharField(max_length=15)
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=1
    )
    provider = serializers.ChoiceField(choices=AirtimePurchase.PROVIDER_CHOICES)


class TransportBuySerializer(serializers.Serializer):
    """Input serializer for buying a transport ticket."""

    ticket_type = serializers.ChoiceField(choices=TransportTicket.TICKET_TYPES)
    route = serializers.CharField(max_length=200)
    departure_time = serializers.DateTimeField()
    arrival_time = serializers.DateTimeField()
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0.01
    )
    seat_number = serializers.CharField(max_length=20, required=False)