# apps/wallets/services.py
from django.db import transaction
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
            sender_wallet = Wallet.objects.select_for_update().get(user=sender)
            recipient_wallet = Wallet.objects.select_for_update().get(user=recipient)

            if sender_wallet.balance < amount:
                raise ValueError("Insufficient balance")

            # Perform transfer
            sender_wallet.deduct_balance(amount)
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


class LimitCheckerService:
    """Check spending limits for students"""

    @staticmethod
    def check_spending_limit(student, amount, category):
        """Check if transaction is within spending limits"""
        try:
            limit = SpendingLimit.objects.get(child=student, category=category, is_enabled=True)
            return limit.check_limit(amount)
        except SpendingLimit.DoesNotExist:
            # No limit set for this category
            return True

    @staticmethod
    def update_spent_amounts(student, amount, category):
        """Update spent amounts after a transaction"""
        try:
            limit = SpendingLimit.objects.get(child=student, category=category)
            limit.daily_spent += amount
            limit.weekly_spent += amount
            limit.monthly_spent += amount
            limit.save()
        except SpendingLimit.DoesNotExist:
            pass


class NotificationService:
    """Handle notifications for wallet events"""

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