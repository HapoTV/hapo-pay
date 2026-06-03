# apps/notifications/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.NotificationViewSet, basename='notifications')

urlpatterns = [
    path('', include(router.urls)),
    path('<uuid:notification_id>/read/', views.MarkNotificationReadView.as_view(), name='mark-read'),
    path('mark-all-read/', views.MarkAllReadView.as_view(), name='mark-all-read'),
    path('unread-count/', views.UnreadCountView.as_view(), name='unread-count'),
    path('preferences/', views.NotificationPreferenceView.as_view(), name='preferences'),
]