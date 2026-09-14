# core/idempotency.py
"""Replay protection for money-moving endpoints.

The problem this solves: a student taps their card twice, or a mobile client
times out waiting for a response and retries, or someone double-taps "Pay".
Each attempt is a well-formed, authenticated, authorised request to move money,
and the server has no way to tell it apart from a genuine second payment. Both
succeed. The wallet is debited twice and nothing anywhere reports an error --
which is precisely why this class of bug survives so long in production.

QR payments were already safe by accident: a QRCode is single-use and locked,
so the second submission finds `is_used=True` and is rejected. NFC, airtime,
transport, transfers and money-request approvals had no equivalent natural key.

The contract is the standard `Idempotency-Key` one, matching what
core/http_client.py already sends to our own upstream providers: the client
generates one key per *intent* (not per attempt) and resends it on every retry
of that intent.

Ordering matters more than it looks. The naive implementation checks for an
existing key, runs the handler, then stores the result -- but two concurrent
taps both miss the check and both run before either stores anything, which is
the exact scenario this exists to prevent. So the key is *reserved* (inserted
with a sentinel status) before the handler runs, under a unique constraint, and
only one request can win that insert.
"""
import hashlib
import json
import logging

from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.utils.encoders import JSONEncoder

logger = logging.getLogger(__name__)

HEADER = 'Idempotency-Key'

# A reservation older than this whose response was never recorded is treated as
# abandoned (the worker died mid-request) and may be retried. Without this a
# crashed request would wedge that key permanently.
STALE_RESERVATION_SECONDS = 90

# Sentinel meaning "reserved, handler still running".
_IN_FLIGHT = 0


class IdempotentReplay(APIException):
    """Not an error: carries the stored response of the original request."""

    def __init__(self, status_code, body):
        self.status_code = status_code
        self.detail = body


class IdempotencyConflict(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = {
        'status': 'error',
        'message': 'A request with this Idempotency-Key is still being processed.',
    }


class IdempotencyKeyReused(APIException):
    # 422 rather than 400: the request is well-formed, but reusing one key for
    # two different payloads is a client bug we must surface rather than hide
    # behind a replayed response for the *other* payload.
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_detail = {
        'status': 'error',
        'message': 'This Idempotency-Key was already used with a different request body.',
    }


def _fingerprint(request):
    """Stable hash of the request body, to detect key reuse with new payloads."""
    body = request.body or b''
    return hashlib.sha256(body).hexdigest()


def _json_safe(data):
    """Normalise a response body to what the client will actually receive.

    response.data at this point still holds live Python objects -- Decimal
    balances, UUIDs, datetimes -- which JSONField cannot store. Encoding with
    DRF's own JSONEncoder is not merely a workaround: it is the same conversion
    JSONRenderer applies on the way out, so the replayed body carries the same
    values and types the original response did.

    One caveat worth knowing: the body is stored in a jsonb column, which
    normalises object key order. A replay is therefore semantically identical
    but not necessarily byte-identical to the first response. That is fine for
    any client that parses JSON (all of ours), and would not be for one
    verifying a signature over the raw bytes.
    """
    return json.loads(json.dumps(data, cls=JSONEncoder))


class IdempotentMixin:
    """Mix into any APIView whose POST moves money.

    Set `idempotency_required = True` on a view (or IDEMPOTENCY_REQUIRED=True
    in settings) to reject requests that omit the header entirely.
    """

    idempotency_required = None

    def _idempotency_enforced(self):
        from django.conf import settings
        if self.idempotency_required is not None:
            return self.idempotency_required
        return getattr(settings, 'IDEMPOTENCY_REQUIRED', False)

    def initial(self, request, *args, **kwargs):
        # Runs after authentication, before the handler -- which is what we
        # need, since the key is scoped per user.
        super().initial(request, *args, **kwargs)

        self._idempotency_record = None

        if request.method not in ('POST', 'PUT', 'PATCH'):
            return

        key = request.headers.get(HEADER)

        if not key:
            if self._idempotency_enforced():
                raise APIException({
                    'status': 'error',
                    'message': f'{HEADER} header is required for this endpoint.',
                })
            # Optional for now so already-shipped clients keep working. They
            # remain exposed to double-submission until they send the header;
            # this is logged so the rollout can be measured.
            logger.info("No %s on %s; request is not replay-protected",
                        HEADER, request.path)
            return

        from apps.wallets.models import IdempotencyRecord

        fingerprint = _fingerprint(request)
        endpoint = request.path

        try:
            # Reserve the key. The unique constraint on (user, key) is what
            # makes this safe: of two concurrent taps, exactly one insert
            # succeeds and the other lands in the IntegrityError branch.
            with transaction.atomic():
                record = IdempotencyRecord.objects.create(
                    user=request.user,
                    key=key,
                    endpoint=endpoint,
                    request_fingerprint=fingerprint,
                    response_status=_IN_FLIGHT,
                )
            self._idempotency_record = record
            return
        except IntegrityError:
            pass

        record = IdempotencyRecord.objects.filter(user=request.user, key=key).first()
        if record is None:
            # Deleted between the failed insert and this read; let it run.
            return

        if record.request_fingerprint != fingerprint:
            raise IdempotencyKeyReused()

        if record.response_status == _IN_FLIGHT:
            age = (timezone.now() - record.created_at).total_seconds()
            if age < STALE_RESERVATION_SECONDS:
                raise IdempotencyConflict()
            # Abandoned reservation: take it over.
            logger.warning("Reclaiming stale idempotency reservation %s", record.id)
            record.created_at = timezone.now()
            record.save(update_fields=['created_at'])
            self._idempotency_record = record
            return

        logger.info("Replaying stored response for %s %s", HEADER, key)
        raise IdempotentReplay(record.response_status, record.response_body)

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)

        record = getattr(self, '_idempotency_record', None)
        if record is None:
            return response

        if response.status_code >= 400:
            # A failed attempt must not consume the key -- the client should be
            # able to correct the problem and retry with the same intent.
            record.delete()
            return response

        record.response_status = response.status_code

        try:
            body = _json_safe(response.data) if isinstance(response.data, (dict, list)) else {}
        except (TypeError, ValueError):
            # The money has already moved. Failing here -- or releasing the key
            # -- would let a retry charge the user a second time, which is far
            # worse than replaying a response with an empty body. Keep the
            # reservation, record the status, and make the gap loud.
            logger.exception(
                "Could not serialise response body for idempotency key %s on %s; "
                "storing status only. A replay will return an empty body.",
                record.key, record.endpoint,
            )
            body = {}

        record.response_body = body
        record.save(update_fields=['response_status', 'response_body'])

        return response
