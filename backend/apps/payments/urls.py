# apps/payments/urls.py
"""
URL routing for the payments app.

We use a DRF `DefaultRouter` for the read-only `MerchantViewSet`, and
explicit `path()` entries for the action-oriented endpoints (pay,
generate, register, buy). Keeping the actions explicit makes the API
surface easy to read and prevents accidental CRUD endpoints from being
exposed.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

# Router for the read-only merchant listing.
router = DefaultRouter()
router.register(r'merchants', views.MerchantViewSet, basename='merchants')

urlpatterns = [
    # Merchant listing + detail (read-only).
    path('', include(router.urls)),

    # QR-code flow.
    path('qr/pay/', views.QRPaymentView.as_view(), name='qr-pay'),
    path('qr/generate/', views.GenerateQRCodeView.as_view(), name='qr-generate'),

    # NFC tap-to-pay flow.
    path('nfc/pay/', views.NFCPaymentView.as_view(), name='nfc-pay'),
    path('nfc/register/', views.RegisterNFCTokenView.as_view(), name='nfc-register'),

    # Airtime purchase.
    path('airtime/buy/', views.AirtimePurchaseView.as_view(), name='airtime-buy'),

    # Transport ticket purchase.
    path('transport/buy/', views.TransportTicketView.as_view(), name='transport-buy'),
]