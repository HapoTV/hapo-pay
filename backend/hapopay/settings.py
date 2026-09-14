# hapopay/settings.py
import os
from pathlib import Path
from datetime import timedelta
from celery.schedules import crontab
import environ

# Initialize environment variables
env = environ.Env(
    DEBUG=(bool, False)
)

BASE_DIR = Path(__file__).resolve().parent.parent

# Take environment variables from .env file
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])

# External provider configuration.
# These were read as settings.AIRIME_* / settings.TRANSPORT_* by
# apps/payments/services.py and config/providers.py but never defined here, so
# every airtime and transport purchase failed with AttributeError (caught and
# reported to the caller as a provider error). Names keep the existing
# AIRIME_ spelling so .env files and the provider config keep working.
AIRIME_API_KEY = env('AIRIME_API_KEY', default='')
AIRIME_PROVIDER_URL = env('AIRIME_PROVIDER_URL', default='')
TRANSPORT_API_KEY = env('TRANSPORT_API_KEY', default='')
TRANSPORT_API_URL = env('TRANSPORT_API_URL', default='')

# Outbound HTTP: every third-party call must be bounded. A call with no
# timeout can hang a gunicorn worker indefinitely while holding a wallet row
# lock.
EXTERNAL_API_TIMEOUT = env.int('EXTERNAL_API_TIMEOUT', default=10)

# Read by middleware/rate_limit_middleware.py, which raised AttributeError on
# settings.RATELIMIT_ENABLE the moment it was enabled.
#
# Default OFF, deliberately. This middleware buckets by client IP for the whole
# API, which is the wrong granularity for this product: students share a
# school's single public address and mobile users sit behind carrier-grade NAT,
# so one bucket would throttle hundreds of legitimate users collectively --
# an outage, not a control. Rate limiting is enforced where it belongs instead:
#   * nginx, per route, at the edge (see nginx/conf.d/hapopay.conf) -- it knows
#     the real client IP and sheds load without consuming a gunicorn worker;
#   * DRF ScopedRateThrottle, per authenticated user, on the credential and
#     payment endpoints (see DEFAULT_THROTTLE_RATES above).
# Enable this only for a deployment with no reverse proxy in front, and raise
# the rate to match your real client topology.
RATELIMIT_ENABLE = env.bool('RATELIMIT_ENABLE', default=False)
RATELIMIT_RATE = env('RATELIMIT_RATE', default='600/minute')

# Number of proxies we control in front of Django (nginx = 1). The rate
# limiter and audit log read the client IP from the right-hand side of
# X-Forwarded-For using this count; trusting the left-most entry would let any
# caller spoof a fresh IP per request and bypass rate limiting entirely. Keep
# 0 when Django is directly exposed.
TRUSTED_PROXY_COUNT = env.int('TRUSTED_PROXY_COUNT', default=1)

# Read by apps/admin_panel/views.py instead of a literal in the view body.
FRAUD_LARGE_TRANSACTION_THRESHOLD = env('FRAUD_LARGE_TRANSACTION_THRESHOLD', default='10000')

# Supabase Configuration
SUPABASE_URL = env('SUPABASE_URL')
SUPABASE_KEY = env('SUPABASE_KEY')
SUPABASE_SERVICE_KEY = env('SUPABASE_SERVICE_KEY')
SUPABASE_JWT_SECRET = env('SUPABASE_JWT_SECRET')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    # Required for token revocation. Without it LogoutView's token.blacklist()
    # raises and BLACKLIST_AFTER_ROTATION is silently inert, so a stolen
    # refresh token stayed valid for its full 7-day lifetime after logout.
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'channels',
    'drf_yasg',
    'django_filters',
    'axes',
    'django_extensions',

    # Custom apps
    'apps.accounts',
    'apps.wallets',
    'apps.payments',
    'apps.gamification',
    'apps.admin_panel',
    'apps.notifications',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'axes.middleware.AxesMiddleware',
    # These three modules existed under middleware/ but were never listed
    # here, so rate limiting and the audit trail were dead code: no request
    # was ever rate limited and no AuditLog row was ever written by them.
    # Ordered after AuthenticationMiddleware because both read request.user.
    'middleware.rate_limit_middleware.RateLimitMiddleware',
    'middleware.audit_log_middleware.AuditLogMiddleware',
]

ROOT_URLCONF = 'hapopay.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'hapopay.wsgi.application'
ASGI_APPLICATION = 'hapopay.asgi.application'

# Database - PostgreSQL with Supabase
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DATABASE_NAME'),
        'USER': env('DATABASE_USER'),
        'PASSWORD': env('DATABASE_PASSWORD'),
        'HOST': env('DATABASE_HOST'),
        'PORT': env('DATABASE_PORT'),
        'OPTIONS': {
            # Overridable so CI (a plain Postgres service container with no
            # TLS) can run the suite. Defaults to 'require' so any real
            # deployment still refuses an unencrypted database connection.
            'sslmode': env('DATABASE_SSLMODE', default='require'),
            # Bounds any single query. Without it one pathological query can
            # pin a connection (and any row locks it holds) indefinitely.
            'options': f"-c statement_timeout={env.int('DB_STATEMENT_TIMEOUT_MS', default=15000)}",
        },
        # Reuse connections between requests instead of opening a new TCP+TLS
        # connection per request, which is the single largest per-request cost
        # against a remote (Supabase) Postgres.
        'CONN_MAX_AGE': env.int('DB_CONN_MAX_AGE', default=60),
        'CONN_HEALTH_CHECKS': True,
    }
}

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Authentication Backends
AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    # NOTE: core/pagination.CustomPagination and
    # core/exceptions.custom_exception_handler are both written but deliberately
    # NOT wired up here. Enabling either changes the JSON shape of every list
    # and every error response, which would break the existing Flutter and web
    # clients. See the audit report: this is a coordinated client+server change.
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        # AnonRateThrottle keys on client IP. HapoPay's users are students on a
        # school's single public address and phones behind carrier-grade NAT,
        # so 100/day per IP meant one school exhausting the entire anonymous
        # budget for everyone behind it -- nobody else could log in or register
        # for the rest of the day. Raised to a level that still bounds abuse
        # but cannot lock out a shared address.
        'anon': env('THROTTLE_ANON', default='2000/day'),
        # UserRateThrottle keys on the authenticated user, so this one is
        # correctly scoped per person.
        'user': env('THROTTLE_USER', default='2000/day'),
        # Applied per authenticated user via ScopedRateThrottle on the
        # money-moving endpoints. Also keys on user, not IP.
        #
        # There is deliberately no per-IP 'auth' scope: credential abuse is
        # covered by django-axes (per-account lockout, 5 failures / 15 min)
        # and by nginx's per-route limit at the edge, neither of which
        # penalises everyone sharing an address.
        'payment': env('THROTTLE_PAYMENT', default='30/min'),
    },
}

# JWT Settings
SIMPLE_JWT = {
    # 1 hour was a long window for a bearer token on a payments API with no
    # revocation path; 15 minutes keeps the refresh/rotate flow intact while
    # bounding the value of a stolen access token.
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=env.int('ACCESS_TOKEN_MINUTES', default=15)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=env.int('REFRESH_TOKEN_DAYS', default=7)),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    # Defaults to SECRET_KEY for backwards compatibility, but should be a
    # separate secret: reusing SECRET_KEY means a leak of either one forces
    # rotation of both, invalidating all sessions and all signed data at once.
    'SIGNING_KEY': env('JWT_SIGNING_KEY', default=SECRET_KEY),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS Settings
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8000',
])
CORS_ALLOW_CREDENTIALS = True

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Johannesburg'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Cache Configuration
#
# LocMemCache is per-process: with gunicorn running 4 workers, DRF throttle
# counters, the rate-limit middleware and password-reset tokens each lived in
# whichever worker happened to serve the request. That let an attacker get 4x
# the intended rate limit, and made password resets fail intermittently when
# the reset landed on a different worker than the request that issued it. It
# is also wiped on every restart. Redis is shared and survives restarts.
REDIS_URL = env('REDIS_URL', default='')

if REDIS_URL:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': REDIS_URL,
        }
    }
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {'hosts': [REDIS_URL]},
        },
    }
else:
    # Local development without Redis. Never use these in production: see the
    # note above.
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
    }
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels.layers.InMemoryChannelLayer',
        },
    }

# Celery. hapopay/celery.py reads these via the CELERY_ namespace; none were
# defined, so every worker started with the default in-memory broker and
# silently dropped tasks.
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default=REDIS_URL or 'redis://localhost:6379/1')
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default=REDIS_URL or 'redis://localhost:6379/2')
CELERY_TASK_SERIALIZER = 'json'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
# Redelivered if a worker dies mid-task, so a queued payout notification is
# not lost on deploy.
CELERY_TASK_ACKS_LATE = True
CELERY_TASK_REJECT_ON_WORKER_LOST = True

# The only scheduled work in the system. Deliberately small: spending-limit
# windows are derived from Transaction rows rather than from counters, so no
# reset job exists to silently stop running.
CELERY_BEAT_SCHEDULE = {
    'prune-idempotency-records': {
        'task': 'apps.wallets.tasks.prune_idempotency_records',
        'schedule': crontab(hour=3, minute=30),
    },
}

# Replay protection for money-moving endpoints (see core/idempotency.py).
#
# Optional by default: the shipped Flutter and web clients do not send an
# Idempotency-Key header yet, and rejecting requests without one would be an
# immediate outage for every installed app. Requests that omit it are logged
# and run unprotected. Flip this to True once both clients send the header --
# that is the point at which double-tap protection becomes guaranteed rather
# than best-effort.
IDEMPOTENCY_REQUIRED = env.bool('IDEMPOTENCY_REQUIRED', default=False)
IDEMPOTENCY_RETENTION_DAYS = env.int('IDEMPOTENCY_RETENTION_DAYS', default=7)

# Transport & cookie security
#
# None of these were set. Against a production deployment that means session
# and CSRF cookies were transmitted over plain HTTP, readable by JavaScript,
# and sent on cross-site requests -- and there was no HSTS, so a first-visit
# downgrade attack was possible. They are gated on DEBUG so local HTTP
# development is unaffected.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

if not DEBUG:
    SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    CSRF_COOKIE_SAMESITE = 'Lax'
    SECURE_HSTS_SECONDS = env.int('SECURE_HSTS_SECONDS', default=31536000)
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'same-origin'
X_FRAME_OPTIONS = 'DENY'

# Reject oversized request bodies before they are parsed into memory.
DATA_UPLOAD_MAX_MEMORY_SIZE = env.int('DATA_UPLOAD_MAX_MEMORY_SIZE', default=5 * 1024 * 1024)
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000

# CSRF trusted origins must be explicit once cookies are Secure + SameSite.
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=[])

# Axes Configuration
AXES_ENABLED = True
AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = timedelta(minutes=15)

# Logging Configuration
LOG_DIR = os.path.join(BASE_DIR, 'logs')
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        # Redacts secrets from log records before they are written. Nothing
        # previously stopped a token, password or card value that happened to
        # appear in a log message from being persisted to disk in cleartext
        # (a PCI-DSS 3.4 / SOC 2 problem, and the log file had no rotation
        # either so it was retained indefinitely).
        'redact_sensitive': {
            '()': 'core.logging_filters.RedactSensitiveFilter',
        },
    },
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
            'filters': ['redact_sensitive'],
        },
        'file': {
            # Rotating, not plain FileHandler: the previous handler grew
            # without bound and would eventually fill the volume.
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(LOG_DIR, 'hapopay.log'),
            'maxBytes': env.int('LOG_MAX_BYTES', default=10 * 1024 * 1024),
            'backupCount': env.int('LOG_BACKUP_COUNT', default=10),
            'formatter': 'verbose',
            'filters': ['redact_sensitive'],
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': env('LOG_LEVEL', default='INFO'),
    },
}

# Email. The console backend was hardcoded, so in production every password
# reset email was written to stdout and never delivered -- password reset was
# effectively broken while appearing to succeed.
EMAIL_BACKEND = env('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = env('EMAIL_HOST', default='')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
EMAIL_TIMEOUT = env.int('EMAIL_TIMEOUT', default=10)
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='noreply@hapopay.com')

# Error monitoring. sentry-sdk is already a pinned dependency but was never
# initialised, so nothing reported unhandled exceptions in production.
SENTRY_DSN = env('SENTRY_DSN', default='')

# Only initialise for a DSN that is actually a URL. .env files in this project
# carry the placeholder "your_sentry_dsn_url", which is truthy but invalid, and
# sentry_sdk.init() raises BadDsn on it -- that would abort settings import and
# take the entire application down at boot. Monitoring must never be able to
# stop the service it monitors, hence the scheme check and the try/except.
if SENTRY_DSN.startswith(('http://', 'https://')):
    try:
        import sentry_sdk
        from sentry_sdk.integrations.django import DjangoIntegration

        sentry_sdk.init(
            dsn=SENTRY_DSN,
            integrations=[DjangoIntegration()],
            traces_sample_rate=env.float('SENTRY_TRACES_SAMPLE_RATE', default=0.1),
            # Never ship request bodies or headers: they carry bearer tokens
            # and payment payloads.
            send_default_pii=False,
            environment=env('ENVIRONMENT', default='development'),
        )
    except Exception:  # pragma: no cover - monitoring must not break boot
        import logging as _logging
        _logging.getLogger(__name__).exception("Sentry initialisation failed; continuing without it")