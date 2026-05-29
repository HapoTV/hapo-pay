# apps/payments/admin.py
from django.contrib import admin
from .models import Merchant, QRCode, NFCToken, AirtimePurchase, TransportTicket

@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'verified', 'created_at')
    list_filter = ('category', 'verified', 'created_at')
    search_fields = ('name', 'email', 'phone')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(QRCode)
class QRCodeAdmin(admin.ModelAdmin):
    list_display = ('id', 'merchant', 'amount', 'expires_at', 'is_used')
    list_filter = ('is_used', 'expires_at')
    readonly_fields = ('created_at',)

@admin.register(NFCToken)
class NFCTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'device_id', 'expires_at', 'is_active')
    list_filter = ('is_active', 'expires_at')
    search_fields = ('user__email', 'device_id')

@admin.register(AirtimePurchase)
class AirtimePurchaseAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'amount', 'provider', 'status', 'created_at')
    list_filter = ('provider', 'status', 'created_at')
    search_fields = ('user__email', 'phone_number')

@admin.register(TransportTicket)
class TransportTicketAdmin(admin.ModelAdmin):
    list_display = ('user', 'route', 'ticket_type', 'amount', 'status', 'departure_time')
    list_filter = ('ticket_type', 'status', 'departure_time')
    search_fields = ('user__email', 'route')