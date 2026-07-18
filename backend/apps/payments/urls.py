# apps/payments/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'merchants', views.MerchantViewSet, basename='merchants')

urlpatterns = [
    path('qr/pay/', views.QRPaymentView.as_view(), name='qr-pay'),
    path('qr/generate/', views.GenerateQRCodeView.as_view(), name='qr-generate'),
    path('nfc/pay/', views.NFCPaymentView.as_view(), name='nfc-pay'),
    path('nfc/register/', views.RegisterNFCTokenView.as_view(), name='nfc-register'),
    path('airtime/buy/', views.AirtimePurchaseView.as_view(), name='airtime-buy'),
    path('transport/buy/', views.TransportTicketView.as_view(), name='transport-buy'),
    # These must come before include(router.urls): the router's
    # merchants/<pk>/ pattern would otherwise match "me" as a pk first.
    path('merchants/me/dashboard/', views.MerchantDashboardView.as_view(), name='merchant-dashboard'),
    path('merchants/me/analytics/', views.MerchantAnalyticsView.as_view(), name='merchant-analytics'),
    path('merchants/me/settlements/', views.MerchantSettlementListView.as_view(), name='merchant-settlements'),
    path('', include(router.urls)),
]