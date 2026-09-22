# apps/wallets/student_urls.py
"""
Wallets App — Student URL Routing
=================================
Routes prefixed with `/student/` in the parent URL config.

- `StudentWalletView`        → plain APIView, registered with path()
- `StudentSpendingLimitsView`→ plain APIView, registered with path()
- `StudentTransactionViewSet`→ ViewSet, registered with router
- `StudentMoneyRequestViewSet`→ ViewSet, registered with router
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import student_views
import logging

logger = logging.getLogger(__name__)

try:
    router = DefaultRouter()
    # Only register ViewSets with a router — never plain APIView classes
    router.register(
        r'transactions',
        student_views.StudentTransactionViewSet,
        basename='student-transactions',
    )
    router.register(
        r'money-requests',
        student_views.StudentMoneyRequestViewSet,
        basename='student-money-requests',
    )

    urlpatterns = [
        # Plain APIViews use path(), not the router
        path(
            'wallet/',
            student_views.StudentWalletView.as_view(),
            name='student-wallet',
        ),
        path(
            'spending-limits/',
            student_views.StudentSpendingLimitsView.as_view(),
            name='student-spending-limits',
        ),

        # ViewSet routes
        path('', include(router.urls)),
    ]

except Exception as e:
    logger.exception(f"student_urls failed to build urlpatterns: {e}")
    urlpatterns = []