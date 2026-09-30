# hapopay/settings_test.py
"""Test-specific settings — isolated from Supabase."""
from .settings import *  # noqa: F401,F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

SUPABASE_URL = ''
SUPABASE_KEY = ''
SUPABASE_SERVICE_KEY = ''
SUPABASE_JWT_SECRET = ''

CACHES = {
    'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}
}

CHANNEL_LAYERS = {
    'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'}
}

EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']

AXES_ENABLED = False

SIMPLE_JWT = {
    **SIMPLE_JWT,  # noqa: F405
    'SIGNING_KEY': 'test-secret-key-do-not-use-in-production',
}

LOGGING['root']['level'] = 'CRITICAL'  # noqa: F405