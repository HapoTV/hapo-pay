# apps/wallets/admin.py
"""
Wallets App — Django Admin Configuration
========================================
Registers Wallet, Transaction, SpendingLimit, and MoneyRequest with the
Django admin interface. Each ModelAdmin defines the columns, filters, search
fields, and read-only fields used to inspect and moderate wallet data.

All admin methods are wrapped in try/except so a single bad row or
unexpected data shape cannot break the admin list/detail pages.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Wallet, Transaction, SpendingLimit, MoneyRequest
import logging

logger = logging.getLogger(__name__)


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    """
    Admin view for Wallet.

    Lists owners, balance, currency, and creation date.
    Balances are read-only in admin to force all mutations through
    WalletService (services.py) which enforces locking + audit rules.
    """

    list_display = ('user', 'balance', 'currency', 'created_at')
    search_fields = ('user__email',)
    list_filter = ('currency', 'created_at')
    readonly_fields = ('created_at', 'updated_at')

    def get_queryset(self, request):
        """Optimize the admin queryset by selecting related user rows."""
        try:
            return super().get_queryset(request).select_related('user')
        except Exception as e:
            logger.exception(f"WalletAdmin.get_queryset error: {e}")
            return super().get_queryset(request)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """
    Admin view for Transaction.

    Shows type/category/status filters so admins can quickly find suspicious
    or flagged activity. Fraud flags are read-only in admin.
    """

    list_display = ('id', 'user', 'amount', 'type', 'category', 'status', 'created_at')
    list_filter = ('type', 'category', 'status', 'created_at')
    search_fields = ('user__email', 'description', 'merchant_name')
    readonly_fields = ('created_at',)

    def get_queryset(self, request):
        """Optimize by selecting the related user."""
        try:
            return super().get_queryset(request).select_related('user')
        except Exception as e:
            logger.exception(f"TransactionAdmin.get_queryset error: {e}")
            return super().get_queryset(request)


@admin.register(SpendingLimit)
class SpendingLimitAdmin(admin.ModelAdmin):
    """
    Admin view for SpendingLimit.

    Lists per-child category limits. Spent amounts are read-only because
    they are maintained exclusively by SpendingLimitEnforcer.
    """

    list_display = ('child', 'category', 'daily_limit', 'weekly_limit', 'monthly_limit')
    list_filter = ('category',)
    search_fields = ('child__email',)

    def get_queryset(self, request):
        """Optimize by selecting the related child user."""
        try:
            return super().get_queryset(request).select_related('child')
        except Exception as e:
            logger.exception(f"SpendingLimitAdmin.get_queryset error: {e}")
            return super().get_queryset(request)


@admin.register(MoneyRequest)
class MoneyRequestAdmin(admin.ModelAdmin):
    """
    Admin view for MoneyRequest.

    Shows pending/approved/declined requests so admins can audit
    parent/child interactions.
    """

    list_display = ('child', 'parent', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('child__email', 'parent__email', 'reason')

    def get_queryset(self, request):
        """Optimize by selecting child + parent in one query."""
        try:
            return super().get_queryset(request).select_related('child', 'parent')
        except Exception as e:
            logger.exception(f"MoneyRequestAdmin.get_queryset error: {e}")
            return super().get_queryset(request)