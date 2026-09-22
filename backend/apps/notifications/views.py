# apps/notifications/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from .models import Notification, NotificationPreference
from .serializers import NotificationSerializer, NotificationPreferenceSerializer
from core.permissions import IsParent, IsStudent
import logging

logger = logging.getLogger(__name__)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving user notifications.

    Provides read-only access. Supports filtering by read status and notification type.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Return notifications belonging to the authenticated user only.
        """
        try:
            return Notification.objects.filter(user=self.request.user)
        except Exception as e:
            logger.error(f"Error fetching notifications for {self.request.user}: {str(e)}")
            return Notification.objects.none()

    def list(self, request, *args, **kwargs):
        """
        List notifications with optional filters.

        Query params:
            - is_read (bool): Filter by read/unread status.
            - type (str): Filter by notification type.
        """
        try:
            queryset = self.filter_queryset(self.get_queryset())

            # Filter by read status
            is_read = request.query_params.get('is_read')
            if is_read is not None:
                is_read_bool = is_read.lower() == 'true'
                queryset = queryset.filter(is_read=is_read_bool)

            # Filter by notification type
            notification_type = request.query_params.get('type')
            if notification_type:
                queryset = queryset.filter(notification_type=notification_type)

            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'status': 'success',
                'data': serializer.data
            })

        except Exception as e:
            logger.error(f"Error listing notifications: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to retrieve notifications.',
                'data': None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MarkNotificationReadView(APIView):
    """
    API view to mark a single notification as read.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        """
        Mark the given notification as read.

        Args:
            notification_id (UUID): The ID of the notification.
        """
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            success = notification.mark_as_read()

            if success:
                return Response({
                    'status': 'success',
                    'message': 'Notification marked as read'
                })
            else:
                return Response({
                    'status': 'error',
                    'message': 'Failed to mark notification as read'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Notification.DoesNotExist:
            logger.warning(f"Notification {notification_id} not found for user {request.user}")
            return Response({
                'status': 'error',
                'message': 'Notification not found'
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error marking notification {notification_id} as read: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'An unexpected error occurred.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MarkAllReadView(APIView):
    """
    API view to mark all notifications for the authenticated user as read.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Mark all unread notifications as read for the current user."""
        try:
            updated_count = Notification.objects.filter(
                user=request.user, is_read=False
            ).update(is_read=True, read_at=timezone.now())

            logger.info(f"Marked {updated_count} notifications as read for {request.user}")

            return Response({
                'status': 'success',
                'message': f'{updated_count} notifications marked as read'
            })

        except Exception as e:
            logger.error(f"Error marking all notifications as read: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to mark notifications as read.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UnreadCountView(APIView):
    """
    API view to retrieve the count of unread notifications for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return the number of unread notifications."""
        try:
            count = Notification.objects.filter(user=request.user, is_read=False).count()
            return Response({
                'status': 'success',
                'data': {'unread_count': count}
            })
        except Exception as e:
            logger.error(f"Error fetching unread notification count: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to fetch unread count.',
                'data': {'unread_count': 0}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NotificationPreferenceView(APIView):
    """
    API view for retrieving and updating the user's notification preferences.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retrieve the current user's notification preferences (creates defaults if missing)."""
        try:
            preferences, created = NotificationPreference.objects.get_or_create(user=request.user)
            if created:
                logger.info(f"Created default notification preferences for {request.user}")

            serializer = NotificationPreferenceSerializer(preferences)
            return Response({
                'status': 'success',
                'data': serializer.data
            })
        except Exception as e:
            logger.error(f"Error fetching notification preferences: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to retrieve preferences.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        """Update the current user's notification preferences."""
        try:
            preferences, created = NotificationPreference.objects.get_or_create(user=request.user)
            serializer = NotificationPreferenceSerializer(
                preferences, data=request.data, partial=True
            )

            if serializer.is_valid():
                serializer.save()
                logger.info(f"Updated notification preferences for {request.user}")
                return Response({
                    'status': 'success',
                    'message': 'Preferences updated successfully',
                    'data': serializer.data
                })
            else:
                logger.warning(f"Invalid preferences data: {serializer.errors}")
                return Response({
                    'status': 'error',
                    'message': 'Invalid data provided.',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Error updating notification preferences: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to update preferences.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)