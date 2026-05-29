# apps/gamification/apps.py
from django.apps import AppConfig

class GamificationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.gamification'
    label = 'gamification'
    verbose_name = 'Gamification Management'