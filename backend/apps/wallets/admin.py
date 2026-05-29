# apps/wallets/admin.py
from django.contrib import admin
from .models import Wallet, Transaction, SpendingLimit, MoneyRequest

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'currency', 'created_at')
    search_fields = ('user__email',)
    list_filter = ('currency', 'created_at')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'amount', 'type', 'category', 'status', 'created_at')
    list_filter = ('type', 'category', 'status', 'created_at')
    search_fields = ('user__email', 'description', 'merchant_name')
    readonly_fields = ('created_at',)

@admin.register(SpendingLimit)
class SpendingLimitAdmin(admin.ModelAdmin):
    list_display = ('child', 'category', 'daily_limit', 'weekly_limit', 'monthly_limit')
    list_filter = ('category',)
    search_fields = ('child__email',)

@admin.register(MoneyRequest)
class MoneyRequestAdmin(admin.ModelAdmin):
    list_display = ('child', 'parent', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('child__email', 'parent__email', 'reason')