# apps/admin_panel/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'config', views.SystemConfigViewSet, basename='system-config')
router.register(r'audit-logs', views.AuditLogViewSet, basename='audit-logs')
router.register(r'fraud-alerts', views.FraudAlertViewSet, basename='fraud-alerts')

urlpatterns = [
    path('', include(router.urls)),
    path('users/', views.UserManagementView.as_view(), name='user-management'),
    path('users/<uuid:user_id>/', views.UserManagementView.as_view(), name='user-detail'),
    path('users/<uuid:user_id>/suspend/', views.UserSuspendView.as_view(), name='user-suspend'),
    path('users/<uuid:user_id>/activate/', views.UserActivateView.as_view(), name='user-activate'),
    path('merchants/pending/', views.MerchantVerificationView.as_view(), name='pending-merchants'),
    path('merchants/<uuid:merchant_id>/verify/', views.MerchantVerificationView.as_view(), name='verify-merchant'),
    path('analytics/', views.PlatformAnalyticsView.as_view(), name='platform-analytics'),
    path('fraud-monitoring/', views.FraudMonitoringView.as_view(), name='fraud-monitoring'),
]