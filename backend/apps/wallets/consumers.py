# apps/wallets/consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json


class WalletConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time wallet updates"""

    async def connect(self):
        """Accept only an authenticated owner of the requested wallet.

        Security: this consumer previously joined the `wallet_<user_id>` group
        using the user_id straight from the URL, with no authentication and no
        ownership check. Any anonymous client could open
        ws://.../ws/wallet/<victim-uuid>/ and receive that user's live balance
        and transaction stream. Mirrors the check NotificationConsumer already
        performs.
        """
        user = self.scope.get('user')

        if user is None or user.is_anonymous:
            await self.close(code=4401)
            return

        requested_user_id = self.scope['url_route']['kwargs']['user_id']

        if str(user.id) != str(requested_user_id):
            await self.close(code=4403)
            return

        self.user_id = str(user.id)
        self.room_group_name = f'wallet_{self.user_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group. Guarded because a rejected connection never joined
        # one, and an unguarded attribute access raised on every refusal.
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Receive message from WebSocket"""
        try:
            text_data_json = json.loads(text_data)
        except (TypeError, ValueError):
            # Malformed frames previously raised out of the consumer.
            return
        if not isinstance(text_data_json, dict):
            return
        message_type = text_data_json.get('type')

        if message_type == 'ping':
            await self.send(text_data=json.dumps({
                'type': 'pong',
                'message': 'Connection alive'
            }))

    async def balance_update(self, event):
        """Send balance update to client"""
        await self.send(text_data=json.dumps({
            'type': 'balance_update',
            'balance': event['balance'],
            'currency': event['currency'],
            'timestamp': event['timestamp']
        }))

    async def transaction_notification(self, event):
        """Send transaction notification to client"""
        await self.send(text_data=json.dumps({
            'type': 'transaction',
            'transaction': event['transaction'],
            'timestamp': event['timestamp']
        }))