# core/exceptions.py
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import exceptions, status
import logging

logger = logging.getLogger(__name__)


# Exceptions whose message is intended for the caller. Anything else is
# internal and must not be echoed back.
_SAFE_DETAIL_EXCEPTIONS = (
    exceptions.ValidationError,
    exceptions.AuthenticationFailed,
    exceptions.NotAuthenticated,
    exceptions.PermissionDenied,
    exceptions.NotFound,
    exceptions.MethodNotAllowed,
    exceptions.Throttled,
    exceptions.ParseError,
)


def custom_exception_handler(exc, context):
    """Custom exception handler for consistent error responses.

    NOTE: not currently registered as DRF's EXCEPTION_HANDLER -- doing so
    changes the error shape for every client. See the audit report.
    """

    # Call DRF's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # `message: str(exc)` was unconditional, so any exception DRF happened
        # to map to a 4xx had its internal text (database constraint names,
        # file paths, upstream provider errors) relayed to the caller.
        if isinstance(exc, _SAFE_DETAIL_EXCEPTIONS):
            message = str(exc)
        else:
            logger.warning("Handled non-API exception on %s",
                           context.get('request').path if context.get('request') else '?',
                           exc_info=True)
            message = response.status_text if hasattr(response, 'status_text') else 'Request failed'

        return Response({
            'status': 'error',
            'code': response.status_code,
            'message': message,
            'data': None,
            'errors': response.data
        }, status=response.status_code)

    # Handle unhandled exceptions
    logger.error("Unhandled exception: %s", exc, exc_info=True)

    return Response({
        'status': 'error',
        'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
        'message': 'An unexpected error occurred',
        'data': None,
        'errors': None
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)