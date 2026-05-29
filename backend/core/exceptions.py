# core/exceptions.py
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Custom exception handler for consistent error responses"""

    # Call DRF's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        return Response({
            'status': 'error',
            'code': response.status_code,
            'message': str(exc),
            'data': None,
            'errors': response.data
        }, status=response.status_code)

    # Handle unhandled exceptions
    logger.error(f"Unhandled exception: {exc}", exc_info=True)

    return Response({
        'status': 'error',
        'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
        'message': 'An unexpected error occurred',
        'data': None,
        'errors': None
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)