# apps/payments/fraud_detection.py
"""
Fraud detection engine for HapoPay.

This module implements a lightweight, rule-based fraud detection system.
Every transaction that flows through the payment endpoints should be
passed to `check_transaction()`. If it returns `is_suspicious=True`,
the caller is expected to invoke `freeze_and_alert()` to lock the
transaction and notify the user.

Design principles
-----------------
1. **Never crash the caller.** Every public function wraps its body in
   try/except and returns a safe default on failure. A bug in the fraud
   engine must not prevent legitimate transactions from being processed
   (they will simply be treated as "not suspicious" — better to miss a
   flag than to break payments entirely).
2. **Structured returns.** `check_transaction` returns a 4-tuple
   `(is_suspicious, reasons, severity, alert_type)` so callers can
   decide what to do (log, freeze, notify, etc.).
3. **Explainable rules.** Every fired rule is recorded by name so an
   admin reviewing a `FraudAlert` can understand *why* it fired.
4. **Idempotent-ish.** `freeze_and_alert` is safe to call once per
   transaction; calling it twice would create duplicate alerts, so
   callers must check `is_suspicious` before invoking it.
"""

import logging
from datetime import timedelta
from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Rule thresholds
# ---------------------------------------------------------------------------
# Centralised so they can be tweaked without hunting through the code.
# In the future these could be loaded from the DB (`SystemConfig`) so
# admins can adjust them at runtime without a redeploy.
# ---------------------------------------------------------------------------
RULES = {
    'max_single_txn': Decimal('50000'),          # Any single txn above this is critical
    'max_hourly_volume': Decimal('100000'),      # Rolling 1-hour volume cap
    'max_txns_per_hour': 15,                     # Rolling 1-hour count cap
    'max_txns_per_day': 40,                      # Rolling 24-hour count cap
    'unusual_hour_start': 0,                     # 00:00
    'unusual_hour_end': 5,                       # 05:00
    'new_recipient_limit': Decimal('10000'),     # First-time merchant, large amount
    'rapid_succession_seconds': 30,              # Two txns within N seconds
}

# ---------------------------------------------------------------------------
# Rule severity classification
# ---------------------------------------------------------------------------
# Each rule is mapped to a severity bucket. `calculate_severity` uses
# these to determine the overall severity of a transaction that fired
# one or more rules.
# ---------------------------------------------------------------------------
CRITICAL_RULES = {'large_single_transaction', 'hourly_volume_exceeded'}
HIGH_RULES = {'velocity_hourly', 'velocity_daily'}
MEDIUM_RULES = {'new_recipient_large', 'unusual_hours'}
LOW_RULES = {'rapid_succession'}


# ---------------------------------------------------------------------------
# Severity / alert-type helpers
# ---------------------------------------------------------------------------

def calculate_severity(fired_rules: list) -> str:
    """
    Determine the overall severity level for a set of fired rules.

    Precedence (highest first):
        critical  → any critical rule fired
        high      → any high rule fired
        medium    → two or more rules fired (any mix)
        low       → exactly one non-critical rule fired

    Args:
        fired_rules: List of rule names that triggered.

    Returns:
        One of: 'critical', 'high', 'medium', 'low'.
        Returns 'low' if the input is empty or malformed.
    """
    try:
        if not fired_rules:
            return 'low'

        rule_set = set(fired_rules)

        if rule_set & CRITICAL_RULES:
            return 'critical'
        if rule_set & HIGH_RULES:
            return 'high'
        if len(rule_set) >= 2:
            return 'medium'
        return 'low'

    except Exception as e:
        # Defensive: a broken severity calculation should never break
        # the caller. Log and treat as low (least disruptive).
        logger.exception(
            f"[calculate_severity] Failed for rules={fired_rules}: {e}"
        )
        return 'low'


def get_primary_alert_type(fired_rules: list) -> str:
    """
    Pick the single most important rule to use as the alert's `type`.

    The `FraudAlert.alert_type` field is a single value even when
    multiple rules fire. We choose the highest-priority rule so admin
    dashboards can filter by the most serious issue at a glance.

    Args:
        fired_rules: List of rule names that triggered.

    Returns:
        The highest-priority rule name, or 'multiple_rules' if none of
        the known rules match (e.g. an unrecognised rule fired).
    """
    try:
        if not fired_rules:
            return 'multiple_rules'

        # Ordered from most to least severe.
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

    except Exception as e:
        logger.exception(
            f"[get_primary_alert_type] Failed for rules={fired_rules}: {e}"
        )
        return 'multiple_rules'


# ---------------------------------------------------------------------------
# Main entry point: check_transaction
# ---------------------------------------------------------------------------

def check_transaction(transaction, user) -> tuple:
    """
    Evaluate a transaction against every fraud rule.

    This is the function callers should invoke before committing a
    transaction. It is **read-only** — it never mutates the transaction
    or creates alerts. Use `freeze_and_alert()` for that.

    Args:
        transaction: The `Transaction` instance being evaluated.
        user:        The `User` who owns the transaction.

    Returns:
        A 4-tuple:
            is_suspicious (bool)  — True if any rule fired
            reasons       (list)  — names of fired rules
            severity      (str)   — 'low' | 'medium' | 'high' | 'critical'
            alert_type    (str|None) — highest-priority rule, or None

    On any unexpected error, returns `(False, [], 'low', None)` so the
    caller treats the transaction as non-suspicious. This favours
    availability over strict enforcement; we would rather miss a flag
    than block a legitimate payment because the fraud engine crashed.
    """
    # Imported lazily to avoid a circular import at module load time.
    from apps.wallets.models import Transaction

    try:
        reasons = []
        now = timezone.now()

        # -----------------------------------------------------------------
        # Rule 1: Large single transaction
        # -----------------------------------------------------------------
        try:
            if transaction.amount > RULES['max_single_txn']:
                reasons.append('large_single_transaction')
                logger.info(
                    f"[FRAUD] large_single_transaction | "
                    f"user={user.id} | amount={transaction.amount}"
                )
        except Exception as rule_err:
            logger.exception(
                f"[check_transaction] Rule 'large_single_transaction' failed: {rule_err}"
            )

        # -----------------------------------------------------------------
        # Rule 2: Hourly velocity (count of transactions in last hour)
        # -----------------------------------------------------------------
        try:
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
        except Exception as rule_err:
            logger.exception(
                f"[check_transaction] Rule 'velocity_hourly' failed: {rule_err}"
            )

        # -----------------------------------------------------------------
        # Rule 3: Daily velocity (count of transactions in last 24 hours)
        # -----------------------------------------------------------------
        try:
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
        except Exception as rule_err:
            logger.exception(
                f"[check_transaction] Rule 'velocity_daily' failed: {rule_err}"
            )

        # -----------------------------------------------------------------
        # Rule 4: Hourly volume (total amount in last hour)
        # -----------------------------------------------------------------
        try:
            hourly_volume = Transaction.objects.filter(
                user=user,
                created_at__gte=now - timedelta(hours=1),
                status__in=['completed', 'processing'],
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

            if hourly_volume + transaction.amount > RULES['max_hourly_volume']:
                reasons.append('hourly_volume_exceeded')
                logger.info(
                    f"[FRAUD] hourly_volume_exceeded | "
                    f"user={user.id} | hourly_volume={hourly_volume} | "
                    f"new={transaction.amount}"
                )
        except Exception as rule_err:
            logger.exception(
                f"[check_transaction] Rule 'hourly_volume_exceeded' failed: {rule_err}"
            )

        # -----------------------------------------------------------------
        # Rule 5: Unusual hours (only fires if another rule already fired)
        # -----------------------------------------------------------------
        # Rationale: a single transaction at 03:00 is not inherently
        # suspicious. But a transaction at 03:00 that *also* trips another
        # rule is a strong signal of account compromise.
        try:
            if RULES['unusual_hour_start'] <= now.hour <= RULES['unusual_hour_end']:
                if reasons:
                    reasons.append('unusual_hours')
                    logger.info(
                        f"[FRAUD] unusual_hours | "
                        f"user={user.id} | hour={now.hour}"
                    )
        except Exception as rule_err:
            logger.exception(
                f"[check_transaction] Rule 'unusual_hours' failed: {rule_err}"
            )

        # -----------------------------------------------------------------
        # Rule 6: First-time large payment to a merchant
        # -----------------------------------------------------------------
        try:
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
                        f"user={user.id} | merchant_id={transaction.merchant_id} | "
                        f"amount={transaction.amount}"
                    )
        except Exception as rule_err:
            logger.exception(
                f"[check_transaction] Rule 'new_recipient_large' failed: {rule_err}"
            )

        # -----------------------------------------------------------------
        # Rule 7: Rapid succession (another txn within N seconds)
        # -----------------------------------------------------------------
        try:
            rapid = Transaction.objects.filter(
                user=user,
                created_at__gte=now - timedelta(
                    seconds=RULES['rapid_succession_seconds']
                ),
                status__in=['completed', 'processing', 'pending'],
            ).exists()

            if rapid:
                reasons.append('rapid_succession')
                logger.info(
                    f"[FRAUD] rapid_succession | user={user.id}"
                )
        except Exception as rule_err:
            logger.exception(
                f"[check_transaction] Rule 'rapid_succession' failed: {rule_err}"
            )

        # -----------------------------------------------------------------
        # Aggregate results
        # -----------------------------------------------------------------
        severity = calculate_severity(reasons) if reasons else 'low'
        alert_type = get_primary_alert_type(reasons) if reasons else None

        return bool(reasons), reasons, severity, alert_type

    except Exception as e:
        # Last-resort guard. If anything above escapes its own try/except
        # we treat the transaction as non-suspicious so the payment can
        # proceed. Log the full traceback for investigation.
        logger.exception(
            f"[check_transaction] Fatal error while evaluating "
            f"txn={getattr(transaction, 'id', None)} user={getattr(user, 'id', None)}: {e}"
        )
        return False, [], 'low', None


# ---------------------------------------------------------------------------
# Freeze + alert
# ---------------------------------------------------------------------------

def freeze_and_alert(transaction, reasons: list, severity: str, alert_type: str):
    """
    Freeze a suspicious transaction and create a FraudAlert record.

    Should only be called when `check_transaction()` returned
    `is_suspicious=True`. This function:
        1. Marks the transaction as `frozen` and `is_flagged=True`,
           recording the fired rules in `fraud_reasons`.
        2. Creates a `FraudAlert` row so admins can review it.
        3. Sends a push notification to the user (best-effort).

    Args:
        transaction: Saved `Transaction` instance (must have a PK so the
                     FraudAlert FK can be set).
        reasons:     List of rule names that fired.
        severity:    String from `calculate_severity()`.
        alert_type:  Primary rule string from `get_primary_alert_type()`.

    Returns:
        The created `FraudAlert` instance, or `None` if the operation
        failed. The caller should still return a success response to
        the user (their payment will simply be held for review).
    """
    # Imported lazily to avoid a circular import at module load time.
    from apps.payments.models import FraudAlert

    try:
        # --- 1. Mark the transaction as frozen ---
        try:
            transaction.status = 'frozen'
            transaction.is_flagged = True
            transaction.fraud_reasons = reasons
            transaction.save(update_fields=[
                'status', 'is_flagged', 'fraud_reasons', 'updated_at'
            ])
        except Exception as txn_err:
            # If we can't freeze the transaction, we must not create an
            # alert — the two must move together or not at all.
            logger.exception(
                f"[freeze_and_alert] Failed to freeze txn "
                f"{getattr(transaction, 'id', None)}: {txn_err}"
            )
            return None

        # --- 2. Create the FraudAlert ---
        try:
            alert = FraudAlert.objects.create(
                transaction=transaction,
                user=transaction.user,
                alert_type=alert_type,
                reasons=reasons,
                severity=severity,
                status='pending',
            )
        except Exception as alert_err:
            logger.exception(
                f"[freeze_and_alert] Failed to create FraudAlert for "
                f"txn={transaction.id}: {alert_err}"
            )
            return None

        # --- 3. Log for the audit trail ---
        try:
            logger.warning(
                f'[FRAUD] Transaction frozen | '
                f'txn={transaction.id} | user={transaction.user.id} | '
                f'severity={severity} | reasons={reasons}'
            )
        except Exception as log_err:
            # Logging should never be fatal, but log the log failure too.
            logger.exception(f"[freeze_and_alert] Logging failed: {log_err}")

        # --- 4. Best-effort notification to the user ---
        # The user's payment will be held; they deserve to know.
        # Failures here must not prevent the alert from being recorded.
        try:
            from apps.notifications.tasks import send_notification_task

            send_notification_task.delay(
                user_id=str(transaction.user.id),
                template_key='fraud_alert',
                context={
                    'amount': str(transaction.amount),
                    'currency': 'ZAR',
                    'reason': 'Your transaction is under review for security purposes.',
                },
                push_title='Transaction Under Review',
                push_body=(
                    f'Your ZAR {transaction.amount} transaction '
                    f'is being reviewed'
                ),
            )
        except Exception as notify_err:
            # This is expected to fail in some environments (e.g. no Celery
            # worker, no push tokens). Log and continue.
            logger.error(
                f'[FRAUD] Failed to send fraud notification | '
                f'txn={transaction.id} | error={notify_err}'
            )

        return alert

    except Exception as e:
        # Catch-all for anything we didn't anticipate. Log with traceback
        # so we can diagnose, but do not re-raise — the caller (a payment
        # endpoint) should still respond to the user.
        logger.exception(
            f"[freeze_and_alert] Fatal error for "
            f"txn={getattr(transaction, 'id', None)}: {e}"
        )
        return None