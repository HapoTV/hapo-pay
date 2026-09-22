# apps/notifications/consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json
import logging

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling real-time notifications.

    Each authenticated user is assigned to a unique group (user_<id>)
    and receives notifications pushed by the NotificationService.
    """

    async def connect(self):
        """
        Handle WebSocket connection.

        - Rejects anonymous users.
        - Adds the authenticated user to their personal notification group.
        """
        try:
            self.user = self.scope.get('user')

            # Reject anonymous users
            if not self.user or self.user.is_anonymous:
                logger.warning("Anonymous WebSocket connection attempt rejected.")
                await self.close()
                return

            self.room_group_name = f"user_{self.user.id}"

            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()
            logger.info(f"WebSocket connected for user {self.user.email} (group: {self.room_group_name})")

        except Exception as e:
            logger.error(f"Error during WebSocket connect: {str(e)}")
            try:
                await self.close()
            except Exception:
                pass

    async def disconnect(self, close_code):
        """
        Handle WebSocket disconnection.

        Removes the user from their notification group.
        """
        try:
            if hasattr(self, 'room_group_name'):
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
                logger.info(f"WebSocket disconnected for group {self.room_group_name} (code: {close_code})")
        except Exception as e:
            logger.error(f"Error during WebSocket disconnect: {str(e)}")

    async def receive(self, text_data):
        """
        Handle incoming messages from the WebSocket client.

        Supported message types:
            - ping: responds with pong to keep connection alive.
            - mark_read: marks a notification as read.
        """
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')

            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'message': 'Connection alive'
                }))

            elif message_type == 'mark_read':
                notification_id = text_data_json.get('notification_id')
                if notification_id:
                    await self.mark_notification_read(notification_id)
                else:
                    logger.warning("mark_read received without notification_id")

            else:
                logger.warning(f"Unknown WebSocket message type: {message_type}")

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON received via WebSocket: {str(e)}")
        except Exception as e:
            logger.error(f"Error handling WebSocket message: {str(e)}")

    async def notification(self, event):
        """
        Send a notification to the WebSocket client.

        Called by the channel layer when a notification is pushed to the user's group.
        """
        try:
            await self.send(text_data=json.dumps({
                'type': 'notification',
                'notification': event['notification']
            }))
        except Exception as e:
            logger.error(f"Error sending notification via WebSocket: {str(e)}")

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """
        Mark a notification as read in the database.

        Args:
            notification_id (str): The UUID of the notification to mark as read.
        """
        try:
            from .models import Notification
            notification = Notification.objects.get(id=notification_id, user=self.user)
            notification.mark_as_read()
        except Exception as e:
            logger.error(f"Error marking notification {notification_id} as read: {str(e)}")