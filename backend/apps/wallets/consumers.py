# apps/wallets/consumers.py
"""
Wallets App — WebSocket Consumers
=================================
Provides real-time wallet updates over WebSockets.

Clients connect to:
    ws://<host>/ws/wallet/<user_id>/

Server-to-client events:
- balance_update: emitted when a wallet balance changes
- transaction_notification: emitted when a new transaction is created
- pong: response to a client 'ping'

All async handlers wrap their logic in try/except so a single malformed
message cannot drop the connection or crash the consumer.
"""
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json
import logging

logger = logging.getLogger(__name__)


class WalletConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time wallet updates.

    On connect:
        - Reads `user_id` from the URL.
        - Joins the group `wallet_<user_id>` so the server can push updates.

    Supports:
        - ping/pong keep-alive from the client
        - balance_update broadcasts from the server
        - transaction_notification broadcasts from the server
    """

    async def connect(self):
        """
        Accept the WebSocket connection and join the user's room group.

        If the URL doesn't contain a `user_id`, the connection is closed
        with a 4000-series code so the client knows the request was bad.
        """
        try:
            self.user_id = self.scope['url_route']['kwargs'].get('user_id')

            if not self.user_id:
                logger.warning("WalletConsumer.connect: missing user_id in URL")
                await self.close(code=4000)
                return

            self.room_group_name = f'wallet_{self.user_id}'

            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name,
            )

            await self.accept()
            logger.info(f"WalletConsumer connected: user_id={self.user_id}")

        except KeyError as e:
            logger.exception(f"WalletConsumer.connect missing key: {e}")
            await self.close(code=4001)
        except Exception as e:
            logger.exception(f"WalletConsumer.connect error: {e}")
            await self.close(code=4002)

    async def disconnect(self, close_code):
        """
        Leave the user's room group when the socket closes.

        Safe to call even if `connect` failed — we check for the attribute
        before using it.
        """
        try:
            if hasattr(self, 'room_group_name'):
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name,
                )
            logger.info(
                f"WalletConsumer disconnected: user_id={getattr(self, 'user_id', None)} "
                f"code={close_code}"
            )
        except Exception as e:
            logger.exception(f"WalletConsumer.disconnect error: {e}")

    async def receive(self, text_data):
        """
        Handle an inbound WebSocket message from the client.

        Currently supports only the 'ping' keep-alive message. Any other
        message type is ignored (with a log entry).

        Malformed JSON is caught and reported back to the client rather
        than crashing the connection.
        """
        try:
            try:
                data = json.loads(text_data)
            except json.JSONDecodeError as e:
                logger.warning(f"WalletConsumer.receive invalid JSON: {e}")
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Invalid JSON payload',
                }))
                return

            message_type = data.get('type')

            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'message': 'Connection alive',
                }))
            else:
                logger.debug(
                    f"WalletConsumer.receive ignored message type: {message_type}"
                )

        except Exception as e:
            logger.exception(f"WalletConsumer.receive error: {e}")
            try:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Internal error handling message',
                }))
            except Exception:
                # Socket already closed — nothing more we can do
                pass

    async def balance_update(self, event):
        """
        Forward a server-side `balance_update` event to the client.

        Expected event payload:
            {
                'balance': '123.45',
                'currency': 'ZAR',
                'timestamp': '2026-05-29T12:00:00Z',
            }
        """
        try:
            await self.send(text_data=json.dumps({
                'type': 'balance_update',
                'balance': event.get('balance'),
                'currency': event.get('currency'),
                'timestamp': event.get('timestamp'),
            }))
        except Exception as e:
            logger.exception(f"WalletConsumer.balance_update error: {e}")

    async def transaction_notification(self, event):
        """
        Forward a server-side `transaction_notification` event to the client.

        Expected event payload:
            {
                'transaction': {...},
                'timestamp': '2026-05-29T12:00:00Z',
            }
        """
        try:
            await self.send(text_data=json.dumps({
                'type': 'transaction',
                'transaction': event.get('transaction'),
                'timestamp': event.get('timestamp'),
            }))
        except Exception as e:
            logger.exception(f"WalletConsumer.transaction_notification error: {e}")