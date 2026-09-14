# core/authentication.py
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.conf import settings
import jwt
import logging
import requests

logger = logging.getLogger(__name__)

User = get_user_model()


class SupabaseJWTAuthentication(BaseAuthentication):
    """Authenticate using JWT token from Supabase Auth"""

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        try:
            # Extract token
            parts = auth_header.split(' ')
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                raise AuthenticationFailed('Invalid Authorization header')
            token = parts[1]

            # Verify token with Supabase.
            #
            # timeout: this call had none, so a hung Supabase auth endpoint
            # blocked the gunicorn worker indefinitely -- one slow dependency
            # took down the whole API.
            response = requests.get(
                f"{settings.SUPABASE_URL}/auth/v1/user",
                headers={"Authorization": f"Bearer {token}"},
                timeout=getattr(settings, 'EXTERNAL_API_TIMEOUT', 10),
            )

            if response.status_code != 200:
                raise AuthenticationFailed('Invalid token')

            user_data = response.json()

            # Get or create user in Django
            user, created = User.objects.get_or_create(
                supabase_id=user_data.get('id'),
                defaults={
                    'email': user_data.get('email'),
                    'role': user_data.get('user_metadata', {}).get('role', 'student')
                }
            )

            return (user, token)

        except (IndexError, KeyError, jwt.InvalidTokenError) as e:
            logger.warning("Supabase token verification rejected a token: %s", e)
            raise AuthenticationFailed('Invalid token')
        except requests.RequestException:
            # Distinguish "we could not reach the IdP" from "your token is
            # bad": returning 401 for an outage silently logs every user out.
            logger.exception("Supabase auth endpoint unreachable")
            raise AuthenticationFailed('Authentication service temporarily unavailable')


class SupabaseAuthBackend:
    """Django auth backend for Supabase"""

    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            # Authenticate with Supabase
            response = requests.post(
                f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password",
                json={"email": email, "password": password},
                headers={"apikey": settings.SUPABASE_KEY},
                timeout=getattr(settings, 'EXTERNAL_API_TIMEOUT', 10),
            )

            if response.status_code != 200:
                return None

            data = response.json()
            user_data = data.get('user')

            # Get or create user
            user, created = User.objects.get_or_create(
                supabase_id=user_data.get('id'),
                defaults={
                    'email': user_data.get('email'),
                    'role': user_data.get('user_metadata', {}).get('role', 'student')
                }
            )

            return user

        except Exception:
            # Returning None is correct for an auth backend, but the failure
            # must be visible: a bare silent `except` here hid Supabase
            # outages as ordinary "wrong password" responses.
            logger.exception("Supabase authentication backend failed")
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None