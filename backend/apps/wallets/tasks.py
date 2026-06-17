# apps/wallets/tasks.py
from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task
def reset_daily_spending_limits():
    """
    Reset daily_spent to 0 for all spending limits.
    Run every day at midnight (Africa/Johannesburg).
    """
    from .models import SpendingLimit

    updated = SpendingLimit.objects.filter(daily_limit__gt=0).update(daily_spent=0)
    logger.info(f"Daily spending limits reset: {updated} records updated")
    return updated


@shared_task
def reset_weekly_spending_limits():
    """
    Reset weekly_spent to 0 for all spending limits.
    Run every Monday at midnight.
    """
    from .models import SpendingLimit

    updated = SpendingLimit.objects.filter(weekly_limit__gt=0).update(weekly_spent=0)
    logger.info(f"Weekly spending limits reset: {updated} records updated")
    return updated


@shared_task
def reset_monthly_spending_limits():
    """
    Reset monthly_spent to 0 for all spending limits.
    Run on the 1st of every month at midnight.
    """
    from .models import SpendingLimit

    updated = SpendingLimit.objects.filter(monthly_limit__gt=0).update(monthly_spent=0)
    logger.info(f"Monthly spending limits reset: {updated} records updated")
    return updated
