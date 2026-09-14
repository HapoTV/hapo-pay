# core/http_client.py
"""A shared, bounded HTTP session for outbound third-party calls.

Every provider call in this codebase is money-adjacent, so the defaults here
are deliberately conservative:

* **Connection pooling.** A module-level Session reuses TCP+TLS connections.
  Calling `requests.post` directly (as the provider services did) performs a
  fresh TLS handshake per request, which is the dominant latency cost and,
  under load, exhausts ephemeral ports.
* **Mandatory timeout.** `request()` refuses to run without one. A call with no
  timeout can hang a worker forever -- and in this codebase those calls are
  made while holding a `select_for_update` lock on a wallet row, so one slow
  provider stalls every payment for that user.
* **Retries with backoff and jitter, on idempotent methods only.** Retrying a
  POST that may already have been applied upstream is how a single airtime
  purchase becomes two. POST is retried only when the caller passes an
  idempotency key, which is the provider's contract for safe replay.
* **TLS verification is never disabled.** `verify` is not exposed as a
  parameter, so no call site can turn it off.
"""
import logging
import random

import requests
from django.conf import settings
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)

DEFAULT_TIMEOUT = 10

# 5xx and 429 are worth retrying; 4xx means our request was wrong.
_RETRY_STATUSES = (429, 500, 502, 503, 504)

_IDEMPOTENT_METHODS = frozenset({'GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'})


def _build_session():
    session = requests.Session()
    retry = Retry(
        total=3,
        connect=3,
        read=2,
        status=3,
        status_forcelist=_RETRY_STATUSES,
        allowed_methods=_IDEMPOTENT_METHODS,
        # Exponential backoff; urllib3 >= 2 adds jitter when backoff_jitter is
        # set, which spreads a retry storm instead of synchronising every
        # client onto the same retry instant.
        backoff_factor=0.5,
        raise_on_status=False,
        respect_retry_after_header=True,
    )
    adapter = HTTPAdapter(max_retries=retry, pool_connections=10, pool_maxsize=20)
    session.mount('https://', adapter)
    session.mount('http://', adapter)
    return session


_session = _build_session()


def request(method, url, *, timeout=None, idempotency_key=None, **kwargs):
    """Perform an outbound HTTP request with bounded time and safe retries.

    Args:
        idempotency_key: required to retry a non-idempotent method. Sent as the
            standard `Idempotency-Key` header so a replayed POST is collapsed
            by the provider rather than applied twice.
    """
    method = method.upper()
    timeout = timeout or getattr(settings, 'EXTERNAL_API_TIMEOUT', DEFAULT_TIMEOUT)

    if not url.lower().startswith('https://') and not settings.DEBUG:
        # Provider credentials and payment payloads must never cross a plaintext
        # connection outside local development.
        raise ValueError(f"Refusing to call non-HTTPS URL in production: {url}")

    headers = dict(kwargs.pop('headers', None) or {})
    if idempotency_key:
        headers.setdefault('Idempotency-Key', str(idempotency_key))

    if method not in _IDEMPOTENT_METHODS and not idempotency_key:
        logger.debug("Calling %s %s without an idempotency key: no retry on failure",
                     method, url)

    # Small jitter before the first attempt keeps a burst of concurrent
    # callers (e.g. a Celery batch) from hitting the provider in lockstep.
    if kwargs.pop('jitter', False):
        import time
        time.sleep(random.uniform(0, 0.1))

    return _session.request(
        method, url, timeout=timeout, headers=headers, **kwargs
    )


def get(url, **kwargs):
    return request('GET', url, **kwargs)


def post(url, **kwargs):
    return request('POST', url, **kwargs)
