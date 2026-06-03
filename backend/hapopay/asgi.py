# hapopay/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hapopay.settings')

# Import WebSocket consumers
from apps.notifications.consumers import NotificationConsumer
from apps.wallets.consumers import WalletConsumer

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path('ws/notifications/', NotificationConsumer.as_asgi()),
            path('ws/wallet/<str:user_id>/', WalletConsumer.as_asgi()),
        ])
    ),
})