# apps/wallets/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'children/limits', views.SpendingLimitViewSet, basename='spending-limits')
router.register(r'money-requests', views.MoneyRequestViewSet, basename='money-requests')

urlpatterns = [
    path('', include(router.urls)),
    path('transfer/', views.TransferFundsView.as_view(), name='transfer-funds'),
    path('approve-request/', views.ApproveMoneyRequestView.as_view(), name='approve-request'),
    path('analytics/', views.SpendingAnalyticsView.as_view(), name='spending-analytics'),
    path('wallet/', views.WalletViewSet.as_view({'get': 'list'}), name='parent-wallet'),
    path('transactions/', views.TransactionViewSet.as_view({'get': 'list'}), name='parent-transactions'),
]