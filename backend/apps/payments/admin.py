# apps/payments/admin.py
"""
Django admin configuration for the payments app.

Each ModelAdmin provides:
    - A sensible `list_display` for the changelist view.
    - `list_filter` for quick slicing by status / category / date.
    - `search_fields` so admins can find records by user email, phone,
      merchant name, etc.
    - `readonly_fields` for auto-generated fields that should never be
      hand-edited (timestamps, server-generated IDs).
"""

from django.contrib import admin
from .models import (
    Merchant,
    QRCode,
    NFCToken,
    AirtimePurchase,
    TransportTicket,
)


@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
    """
    Admin view for merchants.

    Admins use this page to verify merchants (set `verified=True` and
    record `verified_by` / `verified_at`). The changelist shows the
    verification state at a glance, and search is enabled across the
    fields most likely to be used when looking up a merchant.
    """

    list_display = ('name', 'category', 'verified', 'created_at')
    list_filter = ('category', 'verified', 'created_at')
    search_fields = ('name', 'email', 'phone')
    readonly_fields = ('created_at', 'updated_at')

    def get_queryset(self, request):
        """
        Optimise the changelist by selecting the related verifier user.

        Without `select_related`, each row with a `verified_by` user
        would trigger a separate query. This is a minor but free win.
        """
        try:
            qs = super().get_queryset(request)
            return qs.select_related('verified_by')
        except Exception as e:
            # Admin should never crash; fall back to the base queryset.
            import logging
            logging.getLogger(__name__).exception(
                f"[MerchantAdmin] get_queryset failed: {e}"
            )
            return super().get_queryset(request)


@admin.register(QRCode)
class QRCodeAdmin(admin.ModelAdmin):
    """
    Admin view for QR codes.

    Useful for auditing: an admin can see which QRs were used, when,
    and by whom. We filter by `is_used` so admins can quickly find
    abandoned (unused) QRs that should be cleaned up.
    """

    list_display = ('id', 'merchant', 'amount', 'expires_at', 'is_used')
    list_filter = ('is_used', 'expires_at')
    readonly_fields = ('created_at',)
    search_fields = ('merchant__name', 'description')

    def get_queryset(self, request):
        """Select the related merchant to avoid N+1 queries."""
        try:
            qs = super().get_queryset(request)
            return qs.select_related('merchant', 'used_by')
        except Exception as e:
            import logging
            logging.getLogger(__name__).exception(
                f"[QRCodeAdmin] get_queryset failed: {e}"
            )
            return super().get_queryset(request)


@admin.register(NFCToken)
class NFCTokenAdmin(admin.ModelAdmin):
    """
    Admin view for NFC tokens.

    Enables admins to disable a specific token if a device is lost or
    suspected of being compromised. Search is enabled on the user
    email and the `device_id` (which is what the client sends to the
    terminal).
    """

    list_display = ('user', 'device_id', 'expires_at', 'is_active')
    list_filter = ('is_active', 'expires_at')
    search_fields = ('user__email', 'device_id')

    def get_queryset(self, request):
        """Select the related user to avoid N+1 queries."""
        try:
            qs = super().get_queryset(request)
            return qs.select_related('user')
        except Exception as e:
            import logging
            logging.getLogger(__name__).exception(
                f"[NFCTokenAdmin] get_queryset failed: {e}"
            )
            return super().get_queryset(request)


@admin.register(AirtimePurchase)
class AirtimePurchaseAdmin(admin.ModelAdmin):
    """
    Admin view for airtime purchases.

    Filterable by provider and status — useful for reconciling with
    the provider's own dashboard if a purchase is stuck in `pending`
    or `failed`.
    """

    list_display = ('user', 'phone_number', 'amount', 'provider', 'status', 'created_at')
    list_filter = ('provider', 'status', 'created_at')
    search_fields = ('user__email', 'phone_number', 'transaction_id')

    def get_queryset(self, request):
        """Select the related user to avoid N+1 queries."""
        try:
            qs = super().get_queryset(request)
            return qs.select_related('user')
        except Exception as e:
            import logging
            logging.getLogger(__name__).exception(
                f"[AirtimePurchaseAdmin] get_queryset failed: {e}"
            )
            return super().get_queryset(request)


@admin.register(TransportTicket)
class TransportTicketAdmin(admin.ModelAdmin):
    """
    Admin view for transport tickets.

    Useful for handling customer-support cases: find a ticket by the
    user's email or the provider's booking reference, then check its
    status.
    """

    list_display = ('user', 'route', 'ticket_type', 'amount', 'status', 'departure_time')
    list_filter = ('ticket_type', 'status', 'departure_time')
    search_fields = ('user__email', 'route', 'reference')

    def get_queryset(self, request):
        """Select the related user to avoid N+1 queries."""
        try:
            qs = super().get_queryset(request)
            return qs.select_related('user')
        except Exception as e:
            import logging
            logging.getLogger(__name__).exception(
                f"[TransportTicketAdmin] get_queryset failed: {e}"
            )
            return super().get_queryset(request)