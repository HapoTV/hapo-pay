# apps/wallets/student_urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'wallet', views.WalletViewSet, basename='student-wallet')
router.register(r'transactions', views.TransactionViewSet, basename='student-transactions')
router.register(r'money-requests', views.MoneyRequestViewSet, basename='student-money-requests')

urlpatterns = [
    path('', include(router.urls)),
    path('spending-limits/', views.SpendingLimitViewSet.as_view({'get': 'list'}), name='student-spending-limits'),
    path('analytics/', views.SpendingAnalyticsView.as_view(), name='student-analytics'),
]