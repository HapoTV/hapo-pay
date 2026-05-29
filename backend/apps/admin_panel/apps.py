# apps/admin_panel/apps.py
from django.apps import AppConfig

class AdminPanelConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.admin_panel'
    label = 'admin_panel'
    verbose_name = 'Admin Panel'