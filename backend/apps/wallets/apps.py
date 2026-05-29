# apps/wallets/apps.py
from django.apps import AppConfig

class WalletsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.wallets'
    label = 'wallets'
    verbose_name = 'Wallet Management'