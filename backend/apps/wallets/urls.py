# apps/wallets/urls.py
"""
Wallets App — Parent URL Routing
================================
Routes prefixed with `/parent/` (or mounted wherever the project includes
this module). All endpoints require a parent JWT except where noted.

URL names (reverse()):
- transfer-funds
- approve-request
- spending-analytics
- children-list
- child-detail
- child-transactions
- freeze-account
- unfreeze-account
- transaction-categories
- spending-limits (router)
- money-requests   (router)
- wallet           (router)
- transactions     (router)
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
import logging

logger = logging.getLogger(__name__)

try:
    router = DefaultRouter()
    router.register(
        r'children/limits',
        views.SpendingLimitViewSet,
        basename='spending-limits',
    )
    router.register(
        r'money-requests',
        views.MoneyRequestViewSet,
        basename='money-requests',
    )
    router.register(
        r'wallet',
        views.WalletViewSet,
        basename='wallet',
    )
    router.register(
        r'transactions',
        views.TransactionViewSet,
        basename='transactions',
    )

    urlpatterns = [
        path('', include(router.urls)),

        # Fund transfers
        path(
            'transfer/',
            views.TransferFundsView.as_view(),
            name='transfer-funds',
        ),

        # Money request approval
        path(
            'approve-request/',
            views.ApproveMoneyRequestView.as_view(),
            name='approve-request',
        ),

        # Spending analytics
        path(
            'analytics/',
            views.SpendingAnalyticsView.as_view(),
            name='spending-analytics',
        ),

        # Children management
        path(
            'children/',
            views.ChildrenView.as_view(),
            name='children-list',
        ),
        path(
            'children/<uuid:child_id>/',
            views.ChildDetailView.as_view(),
            name='child-detail',
        ),
        path(
            'children/<uuid:child_id>/transactions/',
            views.ChildTransactionsView.as_view(),
            name='child-transactions',
        ),

        # Account freeze / unfreeze
        path(
            'freeze-account/<uuid:child_id>/',
            views.FreezeAccountView.as_view(),
            name='freeze-account',
        ),
        path(
            'unfreeze-account/<uuid:child_id>/',
            views.UnfreezeAccountView.as_view(),
            name='unfreeze-account',
        ),

        # Transaction categories
        path(
            'categories/',
            views.TransactionCategoriesView.as_view(),
            name='transaction-categories',
        ),
    ]

except Exception as e:
    # If router construction fails, log loudly and expose an empty list
    # so Django can still boot for debugging.
    logger.exception(f"wallets/urls.py failed to build router: {e}")
    urlpatterns = []