# core/authentication.py
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.conf import settings
import jwt
import requests

User = get_user_model()


class SupabaseJWTAuthentication(BaseAuthentication):
    """Authenticate using JWT token from Supabase Auth"""

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        try:
            # Extract token
            token = auth_header.split(' ')[1]

            # Verify token with Supabase
            response = requests.get(
                f"{settings.SUPABASE_URL}/auth/v1/user",
                headers={"Authorization": f"Bearer {token}"}
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

        except (IndexError, KeyError, jwt.InvalidTokenError, requests.RequestException) as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')


class SupabaseAuthBackend:
    """Django auth backend for Supabase"""

    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            # Authenticate with Supabase
            response = requests.post(
                f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password",
                json={"email": email, "password": password},
                headers={"apikey": settings.SUPABASE_KEY}
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
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None