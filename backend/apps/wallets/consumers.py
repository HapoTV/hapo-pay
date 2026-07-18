# apps/wallets/consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json


class WalletConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time wallet updates"""

    async def connect(self):
        self.user = self.scope['user']

        if self.user.is_anonymous:
            await self.close()
            return

        requested_user_id = self.scope['url_route']['kwargs']['user_id']

        # Previously this consumer trusted `user_id` straight from the URL
        # with no check against the authenticated user, so anyone could
        # subscribe to any wallet's live balance/transaction feed just by
        # knowing (or guessing) a UUID. The room must be derived from the
        # authenticated session, never from an untrusted URL param.
        if str(self.user.id) != str(requested_user_id):
            await self.close()
            return

        self.room_group_name = f'wallet_{self.user.id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Receive message from WebSocket"""
        text_data_json = json.loads(text_data)
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