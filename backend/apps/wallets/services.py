# apps/wallets/services.py
from django.db import transaction
from django.db.models import F
from django.utils import timezone
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
    """Check spending limits for students"""

    @staticmethod
    def check_spending_limit(student, amount, category):
        """Check if transaction is within spending limits.

        Must be called inside the same transaction (and before
        update_spent_amounts) so the check and the increment see the same
        locked row; otherwise concurrent payments each pass the check against
        a stale counter and together exceed the limit.
        """
        try:
            limit = SpendingLimit.objects.select_for_update().get(
                child=student, category=category, is_enabled=True
            )
            return limit.check_limit(amount)
        except SpendingLimit.DoesNotExist:
            # No limit set for this category
            return True

    @staticmethod
    def update_spent_amounts(student, amount, category):
        """Update spent amounts after a transaction.

        Uses an F() expression so the increment is computed by the database
        rather than from a value read earlier in Python; two concurrent
        payments can no longer overwrite each other's counter.
        """
        SpendingLimit.objects.filter(child=student, category=category).update(
            daily_spent=F('daily_spent') + amount,
            weekly_spent=F('weekly_spent') + amount,
            monthly_spent=F('monthly_spent') + amount,
        )


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