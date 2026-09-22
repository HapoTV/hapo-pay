# apps/wallets/tasks.py
"""
Wallets App — Celery Tasks
==========================
Scheduled background tasks for spending limit resets.

Schedule these in `hapopay/celery.py` (or via django-celery-beat) to run:
- reset_daily_spending_limits:   every day at 00:00 Africa/Johannesburg
- reset_weekly_spending_limits:  every Monday at 00:00
- reset_monthly_spending_limits: 1st of every month at 00:00

Every task is wrapped in try/except and returns a summary dict so Celery
can report success/failure without raising into the scheduler.
"""
from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def reset_daily_spending_limits(self):
    """
    Reset `daily_spent` to 0 for every SpendingLimit with a daily cap.

    Returns:
        dict: {'updated': <int>, 'status': 'ok'|'error', 'error': <str|None>}
    """
    try:
        # Imported lazily so the module can be imported before Django is ready
        from .models import SpendingLimit

        updated = SpendingLimit.objects.filter(
            daily_limit__gt=0
        ).update(daily_spent=0)

        logger.info(f"Daily spending limits reset: {updated} records updated")
        return {'updated': updated, 'status': 'ok', 'error': None}

    except Exception as e:
        logger.exception(f"reset_daily_spending_limits failed: {e}")
        # Retry with exponential backoff (Celery handles the timing)
        try:
            raise self.retry(exc=e, countdown=60)
        except Exception:
            return {'updated': 0, 'status': 'error', 'error': str(e)}


@shared_task(bind=True, max_retries=3)
def reset_weekly_spending_limits(self):
    """
    Reset `weekly_spent` to 0 for every SpendingLimit with a weekly cap.

    Returns:
        dict: {'updated': <int>, 'status': 'ok'|'error', 'error': <str|None>}
    """
    try:
        from .models import SpendingLimit

        updated = SpendingLimit.objects.filter(
            weekly_limit__gt=0
        ).update(weekly_spent=0)

        logger.info(f"Weekly spending limits reset: {updated} records updated")
        return {'updated': updated, 'status': 'ok', 'error': None}

    except Exception as e:
        logger.exception(f"reset_weekly_spending_limits failed: {e}")
        try:
            raise self.retry(exc=e, countdown=60)
        except Exception:
            return {'updated': 0, 'status': 'error', 'error': str(e)}


@shared_task(bind=True, max_retries=3)
def reset_monthly_spending_limits(self):
    """
    Reset `monthly_spent` to 0 for every SpendingLimit with a monthly cap.

    Returns:
        dict: {'updated': <int>, 'status': 'ok'|'error', 'error': <str|None>}
    """
    try:
        from .models import SpendingLimit

        updated = SpendingLimit.objects.filter(
            monthly_limit__gt=0
        ).update(monthly_spent=0)

        logger.info(f"Monthly spending limits reset: {updated} records updated")
        return {'updated': updated, 'status': 'ok', 'error': None}

    except Exception as e:
        logger.exception(f"reset_monthly_spending_limits failed: {e}")
        try:
            raise self.retry(exc=e, countdown=60)
        except Exception:
            return {'updated': 0, 'status': 'error', 'error': str(e)}