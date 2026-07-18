# apps/wallets/apps.py
from django.apps import AppConfig

class WalletsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.wallets'
    label = 'wallets'
    verbose_name = 'Wallet Management'

    def ready(self):
        import apps.wallets.signals  # noqa: F401 — registers the post_save receiver