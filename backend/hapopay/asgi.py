# hapopay/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hapopay.settings')

# Import WebSocket consumers
from apps.notifications.consumers import NotificationConsumer
from apps.wallets.consumers import WalletConsumer
from core.channels_auth import JWTAuthMiddleware

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    # AuthMiddlewareStack was replaced with JWTAuthMiddleware: this API
    # authenticates over Bearer JWT, not Django session cookies, so the
    # session-based stack never populated scope['user'] for a real client.
    "websocket": JWTAuthMiddleware(
        URLRouter([
            path('ws/notifications/', NotificationConsumer.as_asgi()),
            path('ws/wallet/<str:user_id>/', WalletConsumer.as_asgi()),
        ])
    ),
})