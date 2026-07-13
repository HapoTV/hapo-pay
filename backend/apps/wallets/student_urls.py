# apps/wallets/student_urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
<<<<<<< HEAD
from . import student_views

router = DefaultRouter()
router.register(r'transactions', student_views.StudentTransactionViewSet, basename='student-transactions')
router.register(r'money-requests', student_views.StudentMoneyRequestViewSet, basename='student-money-requests')

urlpatterns = [
    path('', include(router.urls)),
    path('wallet/', student_views.StudentWalletView.as_view(), name='student-wallet'),
    path('spending-limits/', student_views.StudentSpendingLimitsView.as_view(), name='student-spending-limits'),
]
=======
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
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
