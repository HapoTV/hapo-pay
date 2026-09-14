# apps/wallets/tasks.py
"""Scheduled maintenance for the money domain.

Note what is deliberately NOT here: there is no task that resets spending-limit
counters. That job used to be implied by the daily_spent/weekly_spent/
monthly_spent columns -- and because it was never written, those counters only
ever grew and the limits eventually blocked everything. Spend is now derived
from Transaction rows per window, so there is no counter to reset and no
periodic job whose silent failure can break the feature.
"""
import logging

from celery import shared_task
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

from .models import IdempotencyRecord

logger = logging.getLogger(__name__)


@shared_task
def prune_idempotency_records():
    """Delete idempotency records past their replay window.

    These exist to collapse a retry of the same intent, which happens within
    seconds or minutes -- not weeks. Keeping them forever would grow the table
    without bound for no benefit. The retention window is the period during
    which we promise a replayed key returns the original response.
    """
    days = getattr(settings, 'IDEMPOTENCY_RETENTION_DAYS', 7)
    cutoff = timezone.now() - timedelta(days=days)

    deleted, _ = IdempotencyRecord.objects.filter(created_at__lt=cutoff).delete()
    logger.info("Pruned %s idempotency records older than %s days", deleted, days)
    return deleted
