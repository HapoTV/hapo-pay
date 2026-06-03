# middleware/rate_limit_middleware.py
from django.core.cache import cache
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
import time


class RateLimitMiddleware(MiddlewareMixin):
    """Rate limiting middleware"""

    def process_request(self, request):
        if not settings.RATELIMIT_ENABLE:
            return None

        # Get client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            client_ip = x_forwarded_for.split(',')[0]
        else:
            client_ip = request.META.get('REMOTE_ADDR')

        # Create rate limit key
        rate_key = f"rate_limit_{client_ip}"

        # Get current count
        count = cache.get(rate_key, 0)

        # Parse rate limit
        rate_limit = settings.RATELIMIT_RATE
        limit, period = rate_limit.split('/')
        limit = int(limit)

        if count >= limit:
            return JsonResponse({
                'status': 'error',
                'code': 429,
                'message': 'Rate limit exceeded. Please try again later.',
                'data': None,
                'errors': None
            }, status=429)

        # Increment count
        cache.set(rate_key, count + 1, timeout=self._get_timeout(period))

        return None

    def _get_timeout(self, period):
        """Convert period string to seconds"""
        if period == 'second':
            return 1
        elif period == 'minute':
            return 60
        elif period == 'hour':
            return 3600
        elif period == 'day':
            return 86400
        return 3600