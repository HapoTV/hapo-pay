# middleware/rate_limit_middleware.py
from django.core.cache import cache
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

_PERIOD_SECONDS = {
    'second': 1,
    'minute': 60,
    'hour': 3600,
    'day': 86400,
}


def get_client_ip(request):
    """Resolve the client IP without trusting a spoofable header.

    X-Forwarded-For is client-supplied: anyone can send
    `X-Forwarded-For: 1.2.3.4` and get a fresh rate-limit bucket per request,
    which defeats the limiter entirely. Only the last
    settings.TRUSTED_PROXY_COUNT entries are written by our own proxies, so we
    index from the right-hand side and fall back to REMOTE_ADDR when the header
    is absent or too short to trust.
    """
    trusted_proxies = getattr(settings, 'TRUSTED_PROXY_COUNT', 0)
    remote_addr = request.META.get('REMOTE_ADDR')

    if trusted_proxies <= 0:
        return remote_addr

    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if not forwarded:
        return remote_addr

    parts = [part.strip() for part in forwarded.split(',') if part.strip()]
    if len(parts) < trusted_proxies:
        # Fewer hops than expected: the header was not produced by our proxy
        # chain, so it cannot be trusted.
        return remote_addr

    return parts[-trusted_proxies]


class RateLimitMiddleware(MiddlewareMixin):
    """Fixed-window IP rate limiting backed by the shared cache."""

    # Probes must never be throttled: a rate-limited health check makes a
    # healthy instance look dead and triggers a restart loop.
    EXEMPT_PREFIXES = ('/health/',)

    def process_request(self, request):
        if not getattr(settings, 'RATELIMIT_ENABLE', False):
            return None

        if request.path.startswith(self.EXEMPT_PREFIXES):
            return None

        client_ip = get_client_ip(request)
        if not client_ip:
            return None

        try:
            limit, period = self._parse_rate(settings.RATELIMIT_RATE)
        except (AttributeError, ValueError):
            logger.error("Invalid RATELIMIT_RATE; rate limiting disabled for this request")
            return None

        timeout = _PERIOD_SECONDS.get(period, 3600)
        rate_key = f"rate_limit_{client_ip}"

        # cache.add + cache.incr is atomic on Redis and memcached. The previous
        # get-then-set was a read-modify-write: concurrent requests all read
        # the same count and wrote back count+1, so the true request rate could
        # far exceed the limit under exactly the burst the limiter exists to
        # stop.
        if cache.add(rate_key, 1, timeout=timeout):
            return None

        try:
            count = cache.incr(rate_key)
        except ValueError:
            # Key expired between add() and incr().
            cache.set(rate_key, 1, timeout=timeout)
            return None

        if count > limit:
            logger.warning("Rate limit exceeded for %s on %s", client_ip, request.path)
            return JsonResponse({
                'status': 'error',
                'code': 429,
                'message': 'Rate limit exceeded. Please try again later.',
                'data': None,
                'errors': None
            }, status=429)

        return None

    @staticmethod
    def _parse_rate(rate):
        limit, period = rate.split('/')
        return int(limit), period
