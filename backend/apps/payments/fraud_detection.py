import logging
from datetime import timedelta
from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone

logger = logging.getLogger(__name__)

RULES = {
    'max_single_txn': Decimal('50000'),
    'max_hourly_volume': Decimal('100000'),
    'max_txns_per_hour': 15,
    'max_txns_per_day': 40,
    'unusual_hour_start': 0,
    'unusual_hour_end': 5,
    'new_recipient_limit': Decimal('10000'),
    'rapid_succession_seconds': 30,
}

CRITICAL_RULES = {'large_single_transaction', 'hourly_volume_exceeded'}
HIGH_RULES = {'velocity_hourly', 'velocity_daily'}
MEDIUM_RULES = {'new_recipient_large', 'unusual_hours'}
LOW_RULES = {'rapid_succession'}


def calculate_severity(fired_rules: list) -> str:
    rule_set = set(fired_rules)

    if rule_set & CRITICAL_RULES:
        return 'critical'
    if rule_set & HIGH_RULES:
        return 'high'
    if len(rule_set) >= 2:
        return 'medium'
    return 'low'


def get_primary_alert_type(fired_rules: list) -> str:
    priority = [
        'large_single_transaction',
        'hourly_volume_exceeded',
        'velocity_hourly',
        'velocity_daily',
        'new_recipient_large',
        'unusual_hours',
        'rapid_succession',
    ]

    for rule in priority:
        if rule in fired_rules:
            return rule
    return 'multiple_rules'


def check_transaction(transaction, user) -> tuple:
    from apps.wallets.models import Transaction

    reasons = []
    now = timezone.now()

    if transaction.amount > RULES['max_single_txn']:
        reasons.append('large_single_transaction')
        logger.info(
            f"[FRAUD] large_single_transaction | "
            f"user={user.id} | amount={transaction.amount}"
        )

  
    txns_last_hour = Transaction.objects.filter(
        user=user,
        created_at__gte=now - timedelta(hours=1),
        status__in=['completed', 'processing', 'frozen'],
    ).count()

    if txns_last_hour >= RULES['max_txns_per_hour']:
        reasons.append('velocity_hourly')
        logger.info(
            f"[FRAUD] velocity_hourly | "
            f"user={user.id} | txns_last_hour={txns_last_hour}"
        )

    
    txns_last_day = Transaction.objects.filter(
        user=user,
        created_at__gte=now - timedelta(days=1),
        status__in=['completed', 'processing', 'frozen'],
    ).count()

    if txns_last_day >= RULES['max_txns_per_day']:
        reasons.append('velocity_daily')
        logger.info(
            f"[FRAUD] velocity_daily | "
            f"user={user.id} | txns_last_day={txns_last_day}"
        )

   
    hourly_volume = Transaction.objects.filter(
        user=user,
        created_at__gte=now - timedelta(hours=1),
        status__in=['completed', 'processing'],
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

    if hourly_volume + transaction.amount > RULES['max_hourly_volume']:
        reasons.append('hourly_volume_exceeded')
        logger.info(
            f"[FRAUD] hourly_volume_exceeded | "
            f"user={user.id} | hourly_volume={hourly_volume} | new={transaction.amount}"
        )

    
    if RULES['unusual_hour_start'] <= now.hour <= RULES['unusual_hour_end']:
        if reasons:
            reasons.append('unusual_hours')
            logger.info(
                f"[FRAUD] unusual_hours | "
                f"user={user.id} | hour={now.hour}"
            )

    
    if transaction.merchant_id:
        prior_to_merchant = Transaction.objects.filter(
            user=user,
            merchant_id=transaction.merchant_id,
            status='completed',
        ).count()
        if prior_to_merchant == 0 and transaction.amount > RULES['new_recipient_limit']:
            reasons.append('new_recipient_large')
            logger.info(
                f"[FRAUD] new_recipient_large | "
                f"user={user.id} | merchant_id={transaction.merchant_id} | amount={transaction.amount}"
            )

    
    rapid = Transaction.objects.filter(
        user=user,
        created_at__gte=now - timedelta(seconds=RULES['rapid_succession_seconds']),
        status__in=['completed', 'processing', 'pending'],
    ).exists()

    if rapid:
        reasons.append('rapid_succession')
        logger.info(f"[FRAUD] rapid_succession | user={user.id}")

    severity = calculate_severity(reasons) if reasons else 'low'
    alert_type = get_primary_alert_type(reasons) if reasons else None

    return bool(reasons), reasons, severity, alert_type



def freeze_and_alert(transaction, reasons: list, severity: str, alert_type:str):
    """
    Freeze the transaction and create a FraudAlert record.
    ONly call this when check_transaction returns is_suspicious=True.

    ARGS:
        transaction: saved Transaction instance(needs a PK for the FK).
        reasons: List of rules that were triggered.
        severity: string from calculated_severity().
        alert_type: Primary rule string from get_primary_alert_type()
     
    Returns:
    FraudAlert instance
    """
    from apps.payments.models import FraudAlert
    
    transaction.status = 'frozen'
    transaction.is_flagged = True
    transaction.fraud_reasons = reasons
    transaction.save(update_fields=['status', 'is_flagged', 'fraud_reasons', 'updated_at'])

    alert = FraudAlert.objects.create(
        transaction = transaction,
        user=transaction.user,
        alert_type=alert_type,
        reasons=reasons,
        severity=severity,
        status='pending',
    )

    logging.warning(
        f'[FRAUD] Transaction frozen | '
        f'txn={transaction.id} | user={transaction.user.id} | '
        f'severity={severity} | reasons={reasons}'
    )

    try:
        from apps.notifications.tasks import send_notification_task
        send_notification_task.delay(
            user_id=str(transaction.user.id),
            template_key='fraud_alert',
            context={
                'amount': str(transaction.amount),
                'currency':'ZAR',
                'reason': ' Your transaaction is under review for security purposes.',
            },
            push_title='Transaction Under Review',
            push_body=f'Your ZAR {transaction.amount} transaction is being reviewed',
        )
    except Exception as e:
        logger.error(f'[FRAUD] Failed to send fraud notification | error={e}')

    return alert