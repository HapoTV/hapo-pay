# apps/wallets/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'children/limits', views.SpendingLimitViewSet, basename='spending-limits')
router.register(r'money-requests', views.MoneyRequestViewSet, basename='money-requests')
<<<<<<< HEAD
router.register(r'wallet', views.WalletViewSet, basename='wallet')
router.register(r'transactions', views.TransactionViewSet, basename='transactions')

urlpatterns = [
    path('', include(router.urls)),

    # Fund transfers
    path('transfer/', views.TransferFundsView.as_view(), name='transfer-funds'),

    # Money request approval
    path('approve-request/', views.ApproveMoneyRequestView.as_view(), name='approve-request'),

    # Spending analytics
    path('analytics/', views.SpendingAnalyticsView.as_view(), name='spending-analytics'),

    # Children management
    path('children/', views.ChildrenView.as_view(), name='children-list'),
    path('children/<uuid:child_id>/', views.ChildDetailView.as_view(), name='child-detail'),
    path('children/<uuid:child_id>/transactions/', views.ChildTransactionsView.as_view(), name='child-transactions'),

    # Account freeze / unfreeze
    path('freeze-account/<uuid:child_id>/', views.FreezeAccountView.as_view(), name='freeze-account'),
    path('unfreeze-account/<uuid:child_id>/', views.UnfreezeAccountView.as_view(), name='unfreeze-account'),

    # Transaction categories
    path('categories/', views.TransactionCategoriesView.as_view(), name='transaction-categories'),
]
=======

urlpatterns = [
    path('', include(router.urls)),
    path('transfer/', views.TransferFundsView.as_view(), name='transfer-funds'),
    path('approve-request/', views.ApproveMoneyRequestView.as_view(), name='approve-request'),
    path('analytics/', views.SpendingAnalyticsView.as_view(), name='spending-analytics'),
    path('wallet/', views.WalletViewSet.as_view({'get': 'list'}), name='parent-wallet'),
    path('transactions/', views.TransactionViewSet.as_view({'get': 'list'}), name='parent-transactions'),
]
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
