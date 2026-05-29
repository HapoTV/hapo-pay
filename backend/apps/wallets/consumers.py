# apps/wallets/consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json


class WalletConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time wallet updates"""

    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'wallet_{self.user_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
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