# apps/wallets/student_urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import student_views

router = DefaultRouter()
router.register(r'transactions', student_views.StudentTransactionViewSet, basename='student-transactions')
router.register(r'money-requests', student_views.StudentMoneyRequestViewSet, basename='student-money-requests')

urlpatterns = [
    path('', include(router.urls)),
    path('wallet/', student_views.StudentWalletView.as_view(), name='student-wallet'),
    path('spending-limits/', student_views.StudentSpendingLimitsView.as_view(), name='student-spending-limits'),
]
