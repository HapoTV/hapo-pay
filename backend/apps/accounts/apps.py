# apps/accounts/apps.py
from django.apps import AppConfig

class AccountsConfig(AppConfig):
    """
    App configuration for the accounts app.

    Registers the app under the label 'accounts' and sets the default
    auto field type to BigAutoField for all models in this app.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'
    label = 'accounts'
    verbose_name = 'Accounts Management'