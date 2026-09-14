# apps/wallets/services.py
from django.db import transaction
from django.db.models import Q, Sum
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from .models import Wallet, Transaction, SpendingLimit
from apps.notifications.services import NotificationService
import logging

logger = logging.getLogger(__name__)


class TransferService:
    """Handle all fund transfer operations"""

    @staticmethod
    @transaction.atomic
    def transfer_funds(sender, recipient, amount, description="", category='other'):
        """Transfer funds between two users"""
        try:
            amount = Decimal(amount)

            # A non-positive amount would invert the transfer: deduct_balance(-x)
            # increases the sender's balance and add_balance(-x) drains the
            # recipient, so reject it before any row is touched.
            if amount <= Decimal('0'):
                raise ValueError("Transfer amount must be greater than zero")

            if sender == recipient:
                raise ValueError("Cannot transfer to the same wallet")

            # Lock both rows in one query ordered by primary key, so two
            # concurrent transfers between the same pair always take the locks
            # in the same order and cannot deadlock against each other.
            locked = {
                w.user_id: w
                for w in Wallet.objects.select_for_update()
                                       .filter(user__in=[sender, recipient])
                                       .order_by('id')
            }
            sender_wallet = locked[sender.id]
            recipient_wallet = locked[recipient.id]

            if sender_wallet.balance < amount:
                raise ValueError("Insufficient balance")

            # Perform transfer
            if not sender_wallet.deduct_balance(amount):
                raise ValueError("Insufficient balance")
            recipient_wallet.add_balance(amount)

            # Create transaction records
            Transaction.objects.create(
                user=sender,
                amount=amount,
                type='transfer',
                category=category,
                status='completed',
                description=f"Transfer to {recipient.email}: {description}",
                reference_id=str(recipient.id)
            )

            transaction_record = Transaction.objects.create(
                user=recipient,
                amount=amount,
                type='transfer',
                category=category,
                status='completed',
                description=f"Transfer from {sender.email}: {description}",
                reference_id=str(sender.id)
            )

            # Send notification
            NotificationService.send_notification(
                user=recipient,
                title="Money Received!",
                body=f"You've received {amount} from {sender.profile.full_name}",
                notification_type='transfer'
            )

            return transaction_record

        except Exception as e:
            logger.error(f"Transfer failed: {str(e)}")
            raise


class AccountStatusService:
    """Enforces StudentProfile.is_account_frozen.

    The field (and freeze_reason beside it) existed on the model, was exposed
    read-only through StudentProfileSerializer, and was never written or read
    by any code path. So the advertised safety control was inert: a frozen
    student could still spend, because no payment path consulted it. This is
    the single place that decides, so QR, NFC, airtime, transport and transfer
    all agree.
    """

    @staticmethod
    def assert_can_spend(user):
        """Raise AccountFrozen if this user is barred from spending."""
        profile = getattr(user, 'student_profile', None)
        if profile is not None and profile.is_account_frozen:
            raise AccountFrozen(profile.freeze_reason or 'This account is frozen.')


class AccountFrozen(Exception):
    """Raised when a frozen account attempts to move money."""


class LimitCheckerService:
    """Derive a student's spend per window and check it against their limits.

    Spend is computed from Transaction rows rather than from stored counters.
    The previous design kept daily_spent/weekly_spent/monthly_spent columns and
    incremented them on every payment -- but nothing ever reset them, because
    no periodic task existed. `daily_spent` therefore meant "spent since the
    account was created", and a child was locked out permanently once their
    lifetime spend in a category exceeded their daily limit.

    Deriving removes that class of bug entirely: there is no counter to drift,
    no reset job that can silently stop running, and no window boundary to get
    wrong at deploy time. The cost is one indexed aggregate per payment
    (see the txn_user_category_created_idx index on Transaction).
    """

    # What counts as spending. Both sides of a transfer are written with
    # type='transfer' and are indistinguishable at the row level, so transfers
    # are excluded rather than counted as spend on the receiving child -- which
    # would make a parent topping up a wallet consume that child's own limit.
    SPEND_TYPES = ('payment', 'withdrawal')

    # Only money that actually moved. 'pending' has not been captured yet and
    # 'failed'/'refunded'/'cancelled' either never left the wallet or came back.
    SPEND_STATUSES = ('completed',)

    @staticmethod
    def window_starts(now=None):
        """Return the inclusive start of each limit window, in local time.

        Uses the project timezone rather than UTC so "daily" means the calendar
        day the family actually lives in.
        """
        now = now or timezone.localtime()
        day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return {
            'daily': day_start,
            # Week starts Monday, matching date.weekday().
            'weekly': day_start - timedelta(days=day_start.weekday()),
            'monthly': day_start.replace(day=1),
        }

    @classmethod
    def spent_in_windows(cls, student, category, now=None):
        """Spend by this student in this category, per window.

        One query. The three windows are nested (daily within weekly within
        monthly), so a single scan bounded by the monthly start can produce all
        three totals with conditional aggregates.
        """
        starts = cls.window_starts(now)

        totals = Transaction.objects.filter(
            user=student,
            category=category,
            type__in=cls.SPEND_TYPES,
            status__in=cls.SPEND_STATUSES,
            created_at__gte=starts['monthly'],
        ).aggregate(
            daily=Sum('amount', filter=Q(created_at__gte=starts['daily'])),
            weekly=Sum('amount', filter=Q(created_at__gte=starts['weekly'])),
            monthly=Sum('amount'),
        )

        return {k: (v or Decimal('0')) for k, v in totals.items()}

    @classmethod
    def spent_by_category(cls, student, now=None):
        """Spend per window for EVERY category, in one query.

        Used when serializing a list of limits, so rendering a child's nine
        categories costs one query instead of nine.
        """
        starts = cls.window_starts(now)

        rows = Transaction.objects.filter(
            user=student,
            type__in=cls.SPEND_TYPES,
            status__in=cls.SPEND_STATUSES,
            created_at__gte=starts['monthly'],
        ).values('category').annotate(
            daily=Sum('amount', filter=Q(created_at__gte=starts['daily'])),
            weekly=Sum('amount', filter=Q(created_at__gte=starts['weekly'])),
            monthly=Sum('amount'),
        )

        return {
            row['category']: {
                'daily': row['daily'] or Decimal('0'),
                'weekly': row['weekly'] or Decimal('0'),
                'monthly': row['monthly'] or Decimal('0'),
            }
            for row in rows
        }

    @classmethod
    def check_spending_limit(cls, student, amount, category):
        """Return True if this payment is within the child's limits.

        Must be called inside the transaction that will write the payment, and
        the caller must already hold the wallet row lock. The lock is what
        closes the check-then-act window: without it two concurrent payments
        both aggregate the same history, both decide they fit, and together
        exceed the limit. The aggregate below reads committed rows only, so
        serialising on the wallet is what makes the answer still true by the
        time the new Transaction row is written.
        """
        try:
            limit = SpendingLimit.objects.get(
                child=student, category=category, is_enabled=True
            )
        except SpendingLimit.DoesNotExist:
            # No limit configured for this category.
            return True

        spent = cls.spent_in_windows(student, category)
        return limit.check_limit(Decimal(amount), spent)


class WalletAlertService:
    """Handle wallet-specific alert notifications.

    Named distinctly from apps.notifications.services.NotificationService so it
    cannot shadow that import at module scope (see git history: the previous name
    shadowed it and broke every transfer with AttributeError).
    """

    @staticmethod
    def send_low_balance_alert(user, current_balance, threshold=50):
        """Send alert when balance is low"""
        if current_balance <= threshold:
            NotificationService.send_notification(
                user=user,
                title="Low Balance Alert",
                body=f"Your balance is {current_balance}. Consider requesting funds.",
                notification_type='alert'
            )

    @staticmethod
    def send_spending_alert(parent, child, amount, category):
        """Send alert to parent about child spending"""
        NotificationService.send_notification(
            user=parent,
            title="Spending Alert",
            body=f"{child.profile.full_name} spent {amount} on {category}",
            notification_type='spending_alert',
            metadata={'child_id': str(child.id), 'amount': str(amount)}
        )