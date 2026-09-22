# apps/notifications/apps.py
from django.apps import AppConfig

"""
Configuration for the notifications app.
"""
class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notifications'
    label = 'notifications'
    verbose_name = 'Notifications'