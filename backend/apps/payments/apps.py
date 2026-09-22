# apps/payments/apps.py
from django.apps import AppConfig

"""
Configuration for the payments app.
"""
class PaymentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.payments'
    label = 'payments'
    verbose_name = 'Payment Management'