# middleware/rls_middleware.py
from django.utils.deprecation import MiddlewareMixin
from core.supabase_client import supabase
import logging

logger = logging.getLogger(__name__)


class RLSMiddleware(MiddlewareMixin):
    """Middleware to handle Row Level Security context"""

    def process_request(self, request):
        """Set Supabase user context for RLS"""
        if hasattr(request, 'user') and request.user.is_authenticated:
            # Set user context for Supabase RLS
            try:
                supabase.auth.set_session(
                    access_token=request.META.get('HTTP_AUTHORIZATION', '').replace('Bearer ', ''),
                    refresh_token=None
                )
            except Exception as e:
                logger.warning(f"Failed to set Supabase context: {str(e)}")

    def process_response(self, request, response):
        """Clear Supabase context"""
        try:
            supabase.auth.sign_out()
        except Exception:
            pass
        return response