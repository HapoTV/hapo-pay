# core/channels_auth.py
from urllib.parse import parse_qs
import logging

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user_from_access_token(raw_token):
    from apps.accounts.models import User

    try:
        validated_token = AccessToken(raw_token)  # verifies signature + expiry
        return User.objects.get(id=validated_token['user_id'], is_active=True)
    except (TokenError, User.DoesNotExist, KeyError) as e:
        logger.debug(f"WebSocket auth rejected: {e}")
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Authenticates WebSocket connections with the same SimpleJWT access
    tokens used for regular API requests (REST_FRAMEWORK's
    JWTAuthentication), read from a `?token=` query-string parameter.

    Why this exists: this app authenticates over HTTP with a Bearer JWT,
    not a Django session cookie. asgi.py previously wrapped the websocket
    router in channels.auth.AuthMiddlewareStack, which only recognizes
    session/cookie auth — so scope['user'] was always AnonymousUser for
    every real client, and NotificationConsumer/WalletConsumer silently
    closed every connection. WebSocket clients can't set a custom
    Authorization header during the browser handshake, so the token is
    passed as a query parameter instead — e.g.
    wss://host/ws/wallet/<user_id>/?token=<access_token>
    """

    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode()
        token = parse_qs(query_string).get('token', [None])[0]

        scope['user'] = await get_user_from_access_token(token) if token else AnonymousUser()

        return await super().__call__(scope, receive, send)
