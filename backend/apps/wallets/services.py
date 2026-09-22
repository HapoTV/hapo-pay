# apps/wallets/services.py
"""
Wallets App Services
====================
Business logic for wallets. All balance mutations go through WalletService
so that select_for_update() and atomicity are guaranteed in one place.

Services:
- CategoryService: transaction category resolution + validation
- TransferService: legacy parent→child transfer with fraud detection
- WalletService: central balance operations (transfer, deposit, deduct)
- LimitCheckerService: spending limit checks + recording
- WalletAlertService: low-balance and spending notifications
- SpendingLimitEnforcer: unified spending limit enforcement
"""
from django.db import transaction
from django.utils import timezone
from decimal import Decimal, InvalidOperation
from apps.payments.fraud_detection import check_transaction, freeze_and_alert
from .models import Wallet, Transaction, SpendingLimit
from apps.notifications.services import NotificationService
import logging

logger = logging.getLogger(__name__)


class CategoryService:
    """
    Transaction categorization system.

    Every payment transaction must have a category. This service:
    1. Validates that a category is a recognised value
    2. Auto-maps merchant categories to transaction categories
       so a 'restaurant' merchant automatically produces a 'food' transaction
    3. Provides the full list of valid categories for use across the app
    """

    VALID_CATEGORIES = {
        'food', 'transport', 'shopping', 'entertainment',
        'education', 'health', 'savings', 'airtime', 'other'
    }

    MERCHANT_TO_TRANSACTION_CATEGORY = {
        'restaurant': 'food',
        'retail': 'shopping',
        'transport': 'transport',
        'entertainment': 'entertainment',
        'education': 'education',
        'healthcare': 'health',
        'airtime': 'airtime',
        'other': 'other',
    }

    @staticmethod
    def validate(category):
        """
        Validate that a category string is one of the allowed values.

        Raises:
            ValueError: If category is not in VALID_CATEGORIES.
        """
        try:
            if category not in CategoryService.VALID_CATEGORIES:
                raise ValueError(
                    f"Invalid category '{category}'. "
                    f"Must be one of: {', '.join(sorted(CategoryService.VALID_CATEGORIES))}"
                )
            return category
        except ValueError:
            raise
        except Exception as e:
            logger.exception(f"Unexpected error in CategoryService.validate: {e}")
            raise ValueError(f"Category validation failed: {e}")

    @staticmethod
    def from_merchant(merchant_category):
        """
        Derive a transaction category from a merchant's category.
        Falls back to 'other' for unrecognised merchant categories.
        """
        try:
            return CategoryService.MERCHANT_TO_TRANSACTION_CATEGORY.get(
                merchant_category, 'other'
            )
        except Exception as e:
            logger.exception(f"Unexpected error in CategoryService.from_merchant: {e}")
            return 'other'

    @staticmethod
    def resolve(category=None, merchant_category=None):
        """
        Resolve the final category for a transaction.

        Priority:
        1. Explicit category provided → validate and use it
        2. Merchant category provided → auto-map it
        3. Neither → default to 'other'
        """
        try:
            if category and category != 'other':
                return CategoryService.validate(category)

            if merchant_category:
                return CategoryService.from_merchant(merchant_category)

            return 'other'
        except ValueError:
            raise
        except Exception as e:
            logger.exception(f"Unexpected error in CategoryService.resolve: {e}")
            return 'other'


class TransferService:
    """
    Handle fund transfers between users with proper locking and fraud detection.

    NOTE: Prefer WalletService.transfer() for new code. This service exists
    for backward compatibility and is used by some legacy views.
    """

    @staticmethod
    @transaction.atomic
    def transfer_funds(sender, recipient, amount, description="", category='other'):
        """
        Transfer funds between two users with fraud detection.

        Args:
            sender: User object sending money
            recipient: User object receiving money
            amount: Decimal amount to transfer
            description: Optional description of the transfer
            category: Transaction category (default: 'other')

        Returns:
            Transaction object for the recipient (or sender if fraud-frozen).

        Raises:
            ValueError: If insufficient balance or wallet not found.
        """
        try:
            # Lock both wallets in a consistent order to prevent deadlocks
            wallets = Wallet.objects.select_for_update().filter(
                user__in=[sender, recipient]
            ).order_by('id')

            wallet_map = {wallet.user_id: wallet for wallet in wallets}
            sender_wallet = wallet_map.get(sender.id)
            recipient_wallet = wallet_map.get(recipient.id)

            if not sender_wallet or not recipient_wallet:
                raise ValueError("One or both wallets not found")

            amount_dec = Decimal(str(amount))

            if sender_wallet.balance < amount_dec:
                raise ValueError("Insufficient balance")

            # Create pending transaction for fraud detection
            sender_txn = Transaction(
                user=sender,
                amount=amount_dec,
                type='transfer',
                category=category,
                status='pending',
                description=f"Transfer to {recipient.email}: {description}",
                reference_id=str(recipient.id),
            )

            # Check for fraud
            try:
                is_suspicious, reasons, severity, alert_type = check_transaction(sender_txn, sender)
            except Exception as e:
                logger.exception(f"Fraud check failed for transfer: {e}")
                is_suspicious, reasons, severity, alert_type = False, [], 'low', None

            if is_suspicious:
                try:
                    sender_txn.save()
                    freeze_and_alert(sender_txn, reasons, severity, alert_type)
                except Exception as e:
                    logger.exception(f"Failed to freeze/alert on suspicious transfer: {e}")
                logger.warning(
                    f"Transfer frozen for fraud review | sender={sender.id} | "
                    f"amount={amount_dec} | reasons={reasons}"
                )
                return sender_txn

            # Perform transfer
            sender_wallet.balance -= amount_dec
            sender_wallet.save(update_fields=['balance', 'updated_at'])

            recipient_wallet.balance += amount_dec
            recipient_wallet.save(update_fields=['balance', 'updated_at'])

            sender_txn.status = 'completed'
            sender_txn.save()

            recipient_txn = Transaction.objects.create(
                user=recipient,
                amount=amount_dec,
                type='transfer',
                category=category,
                status='completed',
                description=f"Transfer from {sender.email}: {description}",
                reference_id=str(sender.id),
            )

            # Notification is best-effort
            try:
                NotificationService.send_notification(
                    user=recipient,
                    title="Money Received!",
                    body=f"You've received R{amount_dec} from {sender.profile.full_name}",
                    notification_type='transfer',
                )
            except Exception as e:
                logger.warning(f"Transfer notification failed: {e}")

            logger.info(f"Transfer complete: {sender.email} → {recipient.email} R{amount_dec}")
            return recipient_txn

        except ValueError:
            raise
        except Exception as e:
            logger.exception(f"Transfer failed: {sender.email} → {recipient.email} | {e}")
            raise


class WalletService:
    """
    Central service for all wallet balance operations.

    Every operation that reads and writes a wallet balance MUST go through
    this service. Using select_for_update() ensures the wallet row is locked
    at the database level for the duration of the transaction, preventing
    race conditions when multiple requests hit the server simultaneously.
    """

    @staticmethod
    @transaction.atomic
    def transfer(sender, recipient, amount, description='', category='other'):
        """
        Transfer funds from sender to recipient.

        Both wallets are locked for the duration of this operation.

        Raises:
            ValueError: If sender has insufficient balance, either wallet is
                missing, or the amount is invalid.
        """
        try:
            # Lock both wallets in a consistent order (by UUID) to prevent deadlocks
            wallets = Wallet.objects.select_for_update().filter(
                user__in=[sender, recipient]
            ).order_by('id')

            wallet_map = {w.user_id: w for w in wallets}
            sender_wallet = wallet_map.get(sender.id)
            recipient_wallet = wallet_map.get(recipient.id)

            if not sender_wallet or not recipient_wallet:
                raise ValueError("One or both wallets not found")

            try:
                amount_dec = Decimal(str(amount))
            except (InvalidOperation, TypeError):
                raise ValueError(f"Invalid transfer amount: {amount!r}")

            if amount_dec <= 0:
                raise ValueError("Transfer amount must be positive")

            if sender_wallet.balance < amount_dec:
                raise ValueError("Insufficient balance")

            # Perform atomic balance update
            sender_wallet.balance -= amount_dec
            sender_wallet.save(update_fields=['balance', 'updated_at'])

            recipient_wallet.balance += amount_dec
            recipient_wallet.save(update_fields=['balance', 'updated_at'])

            # Record both sides of the transfer
            Transaction.objects.create(
                user=sender,
                amount=amount_dec,
                type='transfer',
                category=category,
                status='completed',
                description=f"Transfer to {recipient.email}: {description}",
                reference_id=str(recipient.id),
            )
            recipient_tx = Transaction.objects.create(
                user=recipient,
                amount=amount_dec,
                type='transfer',
                category=category,
                status='completed',
                description=f"Transfer from {sender.email}: {description}",
                reference_id=str(sender.id),
            )

            try:
                NotificationService.send_notification(
                    user=recipient,
                    title="Money Received!",
                    body=f"You've received R{amount_dec} from {sender.profile.full_name}",
                    notification_type='transfer',
                )
            except Exception as e:
                logger.warning(f"Transfer notification failed: {e}")

            logger.info(f"Transfer complete: {sender.email} → {recipient.email} R{amount_dec}")
            return recipient_tx

        except ValueError:
            raise
        except Exception as e:
            logger.exception(f"Transfer failed: {sender.email} → {recipient.email} | {e}")
            raise

    @staticmethod
    @transaction.atomic
    def deposit(user, amount, reference_id='', description='Wallet deposit'):
        """
        Credit a wallet (e.g. after Paystack payment confirmation).
        Wallet is locked before crediting to prevent double-credits.

        Returns:
            Transaction: The created deposit transaction.

        Raises:
            ValueError: If wallet not found or amount invalid.
        """
        try:
            wallet = Wallet.objects.select_for_update().get(user=user)

            try:
                amount_dec = Decimal(str(amount))
            except (InvalidOperation, TypeError):
                raise ValueError(f"Invalid deposit amount: {amount!r}")

            if amount_dec <= 0:
                raise ValueError("Deposit amount must be positive")

            wallet.balance += amount_dec
            wallet.save(update_fields=['balance', 'updated_at'])

            tx = Transaction.objects.create(
                user=user,
                amount=amount_dec,
                type='deposit',
                category='other',
                status='completed',
                description=description,
                reference_id=reference_id,
            )

            try:
                WalletAlertService.check_low_balance(user, wallet.balance)
            except Exception as e:
                logger.warning(f"Low-balance alert failed: {e}")

            logger.info(f"Deposit: {user.email} R{amount_dec} | ref={reference_id}")
            return tx

        except Wallet.DoesNotExist:
            logger.error(f"Deposit failed: wallet not found for {user.email}")
            raise ValueError("Wallet not found")
        except ValueError:
            raise
        except Exception as e:
            logger.exception(f"Deposit failed: {user.email} | {e}")
            raise

    @staticmethod
    @transaction.atomic
    def deduct(user, amount, tx_type='payment', category='other',
               description='', merchant_name=None, merchant_id=None,
               merchant_category=None):
        """
        Deduct from a wallet (payments, airtime, transport).

        Wallet is locked before deducting. For student users, spending limits
        are enforced before the deduction and recorded after.

        Category is resolved via CategoryService.

        Returns:
            Transaction: The created transaction.

        Raises:
            ValueError: If insufficient balance or invalid category.
            SpendingLimitEnforcer.SpendingLimitExceeded: If limit exceeded.
        """
        # Resolve category before touching the DB
        resolved_category = CategoryService.resolve(
            category=category,
            merchant_category=merchant_category,
        )

        # Enforce spending limits for students before any DB write
        if user.role == 'student':
            SpendingLimitEnforcer.enforce(user, amount, resolved_category)

        try:
            wallet = Wallet.objects.select_for_update().get(user=user)

            try:
                amount_dec = Decimal(str(amount))
            except (InvalidOperation, TypeError):
                raise ValueError(f"Invalid deduct amount: {amount!r}")

            if amount_dec <= 0:
                raise ValueError("Deduct amount must be positive")

            if wallet.balance < amount_dec:
                raise ValueError("Insufficient balance")

            wallet.balance -= amount_dec
            wallet.save(update_fields=['balance', 'updated_at'])

            tx = Transaction.objects.create(
                user=user,
                amount=amount_dec,
                type=tx_type,
                category=resolved_category,
                status='completed',
                description=description,
                merchant_name=merchant_name,
                merchant_id=merchant_id,
            )

            # Record spending after successful deduction
            if user.role == 'student' and tx_type == 'payment':
                try:
                    SpendingLimitEnforcer.record(user, amount_dec, resolved_category)
                except Exception as e:
                    logger.warning(f"Failed to record spending: {e}")

            # Parent alert (best-effort)
            if user.role == 'student':
                try:
                    parent = user.student_profile.parent
                    if parent:
                        WalletAlertService.send_spending_alert(
                            parent, user, amount_dec, resolved_category
                        )
                except Exception as e:
                    logger.warning(f"Spending alert failed: {e}")

            # Low-balance alert (best-effort)
            try:
                WalletAlertService.check_low_balance(user, wallet.balance)
            except Exception as e:
                logger.warning(f"Low-balance alert failed: {e}")

            logger.info(f"Deduct: {user.email} R{amount_dec} [{tx_type}/{resolved_category}]")
            return tx

        except Wallet.DoesNotExist:
            logger.error(f"Deduct failed: wallet not found for {user.email}")
            raise ValueError("Wallet not found")
        except SpendingLimitEnforcer.SpendingLimitExceeded:
            raise
        except ValueError:
            raise
        except Exception as e:
            logger.exception(f"Deduct failed: {user.email} | {e}")
            raise

    @staticmethod
    def get_balance(user):
        """
        Read current balance (no lock needed for reads).

        Raises:
            ValueError: If wallet not found.
        """
        try:
            return Wallet.objects.get(user=user).balance
        except Wallet.DoesNotExist:
            logger.error(f"get_balance: wallet not found for {user.email}")
            raise ValueError("Wallet not found")
        except Exception as e:
            logger.exception(f"get_balance failed for {user.email}: {e}")
            raise ValueError(f"Could not read balance: {e}")


class LimitCheckerService:
    """Check and update spending limits for students."""

    @staticmethod
    def check_spending_limit(student, amount, category):
        """
        Returns True if the transaction is within the student's spending limit.
        Returns True if no limit is set for this category.
        """
        try:
            limit = SpendingLimit.objects.get(
                child=student, category=category, is_enabled=True
            )
            return limit.check_limit(amount)
        except SpendingLimit.DoesNotExist:
            return True
        except Exception as e:
            logger.exception(f"check_spending_limit error: {e}")
            # Fail-safe: allow the transaction if the check itself is broken
            return True

    @staticmethod
    def update_spent_amounts(student, amount, category):
        """
        Update spent amounts after a transaction.
        Alias for record_spending for backward compatibility.
        """
        return LimitCheckerService.record_spending(student, amount, category)

    @staticmethod
    @transaction.atomic
    def record_spending(student, amount, category):
        """
        Update the spent amounts after a successful transaction.
        Must be called after every student payment.
        Uses select_for_update to prevent concurrent updates to spent amounts.
        """
        try:
            limit = SpendingLimit.objects.select_for_update().get(
                child=student, category=category
            )
            amount_dec = Decimal(str(amount))
            limit.daily_spent += amount_dec
            limit.weekly_spent += amount_dec
            limit.monthly_spent += amount_dec
            limit.save(update_fields=[
                'daily_spent', 'weekly_spent', 'monthly_spent', 'updated_at'
            ])
            logger.info(f"Spending recorded: {student.email} R{amount_dec} [{category}]")
        except SpendingLimit.DoesNotExist:
            # No limit configured — nothing to record
            pass
        except Exception as e:
            logger.exception(f"record_spending error: {e}")
            # Do not raise: recording is best-effort after a successful payment


class WalletAlertService:
    """Send wallet-related alerts (low balance, spending)."""

    LOW_BALANCE_THRESHOLD = Decimal('50.00')

    @staticmethod
    def check_low_balance(user, current_balance):
        """Send low balance alert if balance drops below threshold."""
        try:
            if current_balance <= WalletAlertService.LOW_BALANCE_THRESHOLD:
                NotificationService.send_notification(
                    user=user,
                    title="Low Balance Alert",
                    body=f"Your balance is R{current_balance}. Consider requesting funds.",
                    notification_type='alert',
                )
        except Exception as e:
            logger.warning(f"Low-balance alert failed for {user.email}: {e}")

    @staticmethod
    def send_spending_alert(parent, child, amount, category):
        """Notify parent when child makes a payment."""
        try:
            NotificationService.send_notification(
                user=parent,
                title="Spending Alert",
                body=f"{child.profile.full_name} spent R{amount} on {category}",
                notification_type='spending_alert',
                metadata={'child_id': str(child.id), 'amount': str(amount)},
            )
        except Exception as e:
            logger.warning(f"Spending alert failed for parent {parent.email}: {e}")


class SpendingLimitEnforcer:
    """
    Single entry point for spending limit enforcement on student payments.

    Usage in any payment view:
        SpendingLimitEnforcer.enforce(student, amount, category)
        # Raises SpendingLimitExceeded if blocked
        # Call record() after payment succeeds

        SpendingLimitEnforcer.record(student, amount, category)
        # Updates spent amounts after successful payment
    """

    class SpendingLimitExceeded(Exception):
        """Raised when a student's payment would exceed their spending limit."""

        def __init__(self, category, limit_type, limit_value, spent, amount):
            self.category = category
            self.limit_type = limit_type
            self.limit_value = limit_value
            self.spent = spent
            self.amount = amount
            self.remaining = max(Decimal('0'), limit_value - spent)
            super().__init__(
                f"{limit_type.title()} limit exceeded for {category}. "
                f"Limit: R{limit_value}, Spent: R{spent}, "
                f"Attempted: R{amount}, Remaining: R{self.remaining}"
            )

    @staticmethod
    def enforce(student, amount, category):
        """
        Check all spending limits for this student + category + amount.

        Raises:
            SpendingLimitEnforcer.SpendingLimitExceeded: If any limit is breached.
        """
        try:
            if student.role != 'student':
                return

            try:
                limit = SpendingLimit.objects.get(
                    child=student, category=category, is_enabled=True
                )
            except SpendingLimit.DoesNotExist:
                return  # No limit configured — allow

            amount_dec = Decimal(str(amount))

            if limit.daily_limit > 0 and (limit.daily_spent + amount_dec) > limit.daily_limit:
                raise SpendingLimitEnforcer.SpendingLimitExceeded(
                    category=category, limit_type='daily',
                    limit_value=limit.daily_limit, spent=limit.daily_spent,
                    amount=amount_dec,
                )

            if limit.weekly_limit > 0 and (limit.weekly_spent + amount_dec) > limit.weekly_limit:
                raise SpendingLimitEnforcer.SpendingLimitExceeded(
                    category=category, limit_type='weekly',
                    limit_value=limit.weekly_limit, spent=limit.weekly_spent,
                    amount=amount_dec,
                )

            if limit.monthly_limit > 0 and (limit.monthly_spent + amount_dec) > limit.monthly_limit:
                raise SpendingLimitEnforcer.SpendingLimitExceeded(
                    category=category, limit_type='monthly',
                    limit_value=limit.monthly_limit, spent=limit.monthly_spent,
                    amount=amount_dec,
                )

            logger.info(f"Limit check passed: {student.email} R{amount_dec} [{category}]")

        except SpendingLimitEnforcer.SpendingLimitExceeded:
            raise
        except (InvalidOperation, TypeError) as e:
            logger.error(f"enforce received invalid amount {amount!r}: {e}")
            # Fail-safe: block the payment if amount is invalid
            raise SpendingLimitEnforcer.SpendingLimitExceeded(
                category=category, limit_type='unknown',
                limit_value=Decimal('0'), spent=Decimal('0'),
                amount=Decimal('0'),
            )
        except Exception as e:
            logger.exception(f"Unexpected error in SpendingLimitEnforcer.enforce: {e}")
            # Fail-safe: allow payment on unexpected error (log for investigation)
            return

    @staticmethod
    @transaction.atomic
    def record(student, amount, category):
        """
        Increment spent amounts after a successful payment.
        Call this AFTER the payment has been processed successfully.
        """
        try:
            LimitCheckerService.record_spending(student, amount, category)
            SpendingLimitEnforcer._check_limit_warning(student, category)
        except Exception as e:
            logger.exception(f"SpendingLimitEnforcer.record error: {e}")
            # Do not raise — recording is best-effort

    @staticmethod
    def _check_limit_warning(student, category):
        """
        Warn parent if child has used >= 80% of any limit.
        """
        try:
            limit = SpendingLimit.objects.get(
                child=student, category=category, is_enabled=True
            )
            parent = student.student_profile.parent
            if not parent:
                return

            warnings = []

            if limit.daily_limit > 0:
                pct = (limit.daily_spent / limit.daily_limit) * 100
                if pct >= 80:
                    warnings.append(f"daily ({pct:.0f}% used)")

            if limit.weekly_limit > 0:
                pct = (limit.weekly_spent / limit.weekly_limit) * 100
                if pct >= 80:
                    warnings.append(f"weekly ({pct:.0f}% used)")

            if limit.monthly_limit > 0:
                pct = (limit.monthly_spent / limit.monthly_limit) * 100
                if pct >= 80:
                    warnings.append(f"monthly ({pct:.0f}% used)")

            if warnings:
                NotificationService.send_notification(
                    user=parent,
                    title="Spending Limit Warning",
                    body=(
                        f"{student.profile.full_name} is near their "
                        f"{', '.join(warnings)} {category} limit"
                    ),
                    notification_type='spending_alert',
                    metadata={'child_id': str(student.id), 'category': category},
                )
        except SpendingLimit.DoesNotExist:
            pass
        except Exception as e:
            logger.warning(f"_check_limit_warning failed: {e}")