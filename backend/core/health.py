# core/health.py
"""Liveness and readiness endpoints.

There was no health endpoint at all: docker-compose probed `/admin/`, which
pulls in sessions, auth and template rendering, so an admin-only failure could
mark a healthy container dead (and a redirect made it pass even when the
database was unreachable). Split into two probes because they answer different
questions:

* liveness  -- is this process running? Must not touch dependencies, or a
  database blip restarts every container at once instead of just removing them
  from the load balancer.
* readiness -- can this process serve traffic? Checks the database and cache.
"""
import logging

from django.core.cache import cache
from django.db import connection
from django.http import JsonResponse

logger = logging.getLogger(__name__)


def liveness(request):
    """Process is up. Deliberately checks nothing external."""
    return JsonResponse({'status': 'ok'})


def readiness(request):
    """Process can serve traffic: database and cache both reachable."""
    checks = {}
    healthy = True

    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            cursor.fetchone()
        checks['database'] = 'ok'
    except Exception:
        logger.exception("Readiness probe: database check failed")
        checks['database'] = 'error'
        healthy = False

    try:
        cache.set('_readiness_probe', '1', timeout=5)
        checks['cache'] = 'ok' if cache.get('_readiness_probe') == '1' else 'error'
        healthy = healthy and checks['cache'] == 'ok'
    except Exception:
        logger.exception("Readiness probe: cache check failed")
        checks['cache'] = 'error'
        healthy = False

    return JsonResponse(
        {'status': 'ok' if healthy else 'unhealthy', 'checks': checks},
        status=200 if healthy else 503,
    )
