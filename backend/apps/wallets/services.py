# apps/wallets/services.py
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
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

    # All valid transaction categories (mirrors Transaction.CATEGORY_CHOICES)
    VALID_CATEGORIES = {
        'food', 'transport', 'shopping', 'entertainment',
        'education', 'health', 'savings', 'airtime', 'other'
    }

    # Map from merchant category (payments app) → transaction category (wallets app)
    # When a QR/NFC payment is made at a merchant, the merchant's category
    # determines the transaction category automatically.
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
        Raises ValueError with a clear message if not.
        """
        if category not in CategoryService.VALID_CATEGORIES:
            raise ValueError(
                f"Invalid category '{category}'. "
                f"Must be one of: {', '.join(sorted(CategoryService.VALID_CATEGORIES))}"
            )
        return category

    @staticmethod
    def from_merchant(merchant_category):
        """
        Derive a transaction category from a merchant's category.
        Falls back to 'other' for unrecognised merchant categories.

        Example:
            CategoryService.from_merchant('restaurant') → 'food'
            CategoryService.from_merchant('retail')     → 'shopping'
        """
        return CategoryService.MERCHANT_TO_TRANSACTION_CATEGORY.get(
            merchant_category, 'other'
        )

    @staticmethod
    def resolve(category=None, merchant_category=None):
        """
        Resolve the final category for a transaction.

        Priority:
        1. Explicit category provided → validate and use it
        2. Merchant category provided → auto-map it
        3. Neither → default to 'other'

        This ensures payment transactions always have a meaningful category
        rather than silently defaulting to 'other' for everything.
        """
        if category and category != 'other':
            return CategoryService.validate(category)

        if merchant_category:
            return CategoryService.from_merchant(merchant_category)

        return 'other'


class TransferService:
    """
    Handle fund transfers between users with proper locking and fraud detection.

    This service ensures that transfers are atomic and prevent race conditions
    by using select_for_update() to lock wallet rows during the transaction.
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
            Transaction object for the recipient

        Raises:
            ValueError: If insufficient balance or wallet not found
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

            if sender_wallet.balance < amount:
                raise ValueError("Insufficient balance")

            # Create pending transaction for fraud detection
            sender_txn = Transaction(
                user=sender,
                amount=amount,
                type='transfer',
                category=category,
                status='pending',
                description=f"Transfer to {recipient.email}: {description}",
                reference_id=str(recipient.id),
            )

            # Check for fraud
            is_suspicious, reasons, severity, alert_type = check_transaction(sender_txn, sender)
            if is_suspicious:
                sender_txn.save()
                freeze_and_alert(sender_txn, reasons, severity, alert_type)
                logger.warning(
                    f"Transfer frozen for fraud review | sender={sender.id} | "
                    f"amount={amount} | reasons={reasons}"
                )
                return sender_txn

            # Perform transfer
            sender_wallet.balance -= Decimal(str(amount))
            sender_wallet.save(update_fields=['balance', 'updated_at'])

            recipient_wallet.balance += Decimal(str(amount))
            recipient_wallet.save(update_fields=['balance', 'updated_at'])

            # Update sender transaction to completed
            sender_txn.status = 'completed'
            sender_txn.save()

            # Create recipient transaction
            recipient_txn = Transaction.objects.create(
                user=recipient,
                amount=amount,
                type='transfer',
                category=category,
                status='completed',
                description=f"Transfer from {sender.email}: {description}",
                reference_id=str(sender.id)
            )

            # Send notification to recipient
            try:
                NotificationService.send_notification(
                    user=recipient,
                    title="Money Received!",
                    body=f"You've received R{amount} from {sender.profile.full_name}",
                    notification_type='transfer'
                )
            except Exception:
                # Don't fail the transfer if notification fails
                pass

            logger.info(
                f"Transfer complete: {sender.email} → {recipient.email} R{amount}"
            )
            return recipient_txn

        except Exception as e:
            logger.error(f"Transfer failed: {sender.email} → {recipient.email} | {str(e)}")
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

        Raises ValueError if:
        - sender has insufficient balance
        - either wallet does not exist
        - recipient account is frozen
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

            if sender_wallet.balance < amount:
                raise ValueError("Insufficient balance")

            # Perform atomic balance update
            sender_wallet.balance -= amount
            sender_wallet.save(update_fields=['balance', 'updated_at'])

            recipient_wallet.balance += amount
            recipient_wallet.save(update_fields=['balance', 'updated_at'])

            # Record both sides of the transfer
            Transaction.objects.create(
                user=sender,
                amount=amount,
                type='transfer',
                category=category,
                status='completed',
                description=f"Transfer to {recipient.email}: {description}",
                reference_id=str(recipient.id)
            )
            recipient_tx = Transaction.objects.create(
                user=recipient,
                amount=amount,
                type='transfer',
                category=category,
                status='completed',
                description=f"Transfer from {sender.email}: {description}",
                reference_id=str(sender.id)
            )

            NotificationService.send_notification(
                user=recipient,
                title="Money Received!",
                body=f"You've received R{amount} from {sender.profile.full_name}",
                notification_type='transfer'
            )

            logger.info(
                f"Transfer complete: {sender.email} → {recipient.email} R{amount}"
            )
            return recipient_tx

        except Exception as e:
            logger.error(f"Transfer failed: {sender.email} → {recipient.email} | {str(e)}")
            raise

    @staticmethod
    @transaction.atomic
    def deposit(user, amount, reference_id='', description='Wallet deposit'):
        """
        Credit a wallet (e.g. after Paystack payment confirmation).
        Wallet is locked before crediting to prevent double-credits.

        Returns the created Transaction record.
        """
        try:
            wallet = Wallet.objects.select_for_update().get(user=user)

            wallet.balance += Decimal(str(amount))
            wallet.save(update_fields=['balance', 'updated_at'])

            tx = Transaction.objects.create(
                user=user,
                amount=amount,
                type='deposit',
                category='other',
                status='completed',
                description=description,
                reference_id=reference_id
            )

            # Alert if balance was very low before deposit
            WalletAlertService.check_low_balance(user, wallet.balance)

            logger.info(f"Deposit: {user.email} R{amount} | ref={reference_id}")
            return tx

        except Wallet.DoesNotExist:
            logger.error(f"Deposit failed: wallet not found for {user.email}")
            raise ValueError("Wallet not found")
        except Exception as e:
            logger.error(f"Deposit failed: {user.email} | {str(e)}")
            raise

    @staticmethod
    @transaction.atomic
    def deduct(user, amount, tx_type='payment', category='other',
               description='', merchant_name=None, merchant_id=None,
               merchant_category=None):
        """
        Deduct from a wallet (payments, airtime, transport).
        Wallet is locked before deducting.

        For student users, spending limits are enforced before the deduction.
        Spent amounts are recorded after a successful deduction.

        Category is resolved via CategoryService:
        - If an explicit category is provided, it is validated
        - If a merchant_category is provided, it is auto-mapped
        - Otherwise defaults to 'other'

        Returns the created Transaction record.
        Raises ValueError if insufficient balance or invalid category.
        Raises SpendingLimitEnforcer.SpendingLimitExceeded if limit exceeded.
        """
        # Resolve and validate category before touching the DB
        resolved_category = CategoryService.resolve(
            category=category,
            merchant_category=merchant_category
        )

        # Enforce spending limits for students before any DB write
        if user.role == 'student':
            SpendingLimitEnforcer.enforce(user, amount, resolved_category)

        try:
            wallet = Wallet.objects.select_for_update().get(user=user)

            if wallet.balance < Decimal(str(amount)):
                raise ValueError("Insufficient balance")

            wallet.balance -= Decimal(str(amount))
            wallet.save(update_fields=['balance', 'updated_at'])

            tx = Transaction.objects.create(
                user=user,
                amount=amount,
                type=tx_type,
                category=resolved_category,
                status='completed',
                description=description,
                merchant_name=merchant_name,
                merchant_id=merchant_id,
            )

            # Record spending against limits after successful deduction
            if user.role == 'student' and tx_type == 'payment':
                SpendingLimitEnforcer.record(user, amount, resolved_category)

            # Alert parent about child spending
            if user.role == 'student':
                try:
                    parent = user.student_profile.parent
                    if parent:
                        WalletAlertService.send_spending_alert(
                            parent, user, amount, resolved_category
                        )
                except Exception:
                    pass  # Don't block payment for notification failure

            # Alert if balance is now low
            WalletAlertService.check_low_balance(user, wallet.balance)

            logger.info(
                f"Deduct: {user.email} R{amount} [{tx_type}/{resolved_category}]"
            )
            return tx

        except Wallet.DoesNotExist:
            logger.error(f"Deduct failed: wallet not found for {user.email}")
            raise ValueError("Wallet not found")
        except SpendingLimitEnforcer.SpendingLimitExceeded:
            raise  # Re-raise as-is so views can handle it
        except Exception as e:
            logger.error(f"Deduct failed: {user.email} | {str(e)}")
            raise

    @staticmethod
    def get_balance(user):
        """Read current balance. No lock needed for reads."""
        try:
            return Wallet.objects.get(user=user).balance
        except Wallet.DoesNotExist:
            raise ValueError("Wallet not found")


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
            return True  # No limit set — allow

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
            limit.daily_spent += Decimal(str(amount))
            limit.weekly_spent += Decimal(str(amount))
            limit.monthly_spent += Decimal(str(amount))
            limit.save(update_fields=[
                'daily_spent', 'weekly_spent', 'monthly_spent', 'updated_at'
            ])
            logger.info(
                f"Spending recorded: {student.email} R{amount} [{category}]"
            )
        except SpendingLimit.DoesNotExist:
            pass  # No limit configured for this category


class WalletAlertService:
    """Send wallet-related alerts."""

    LOW_BALANCE_THRESHOLD = Decimal('50.00')

    @staticmethod
    def check_low_balance(user, current_balance):
        """Send low balance alert if balance drops below threshold."""
        if current_balance <= WalletAlertService.LOW_BALANCE_THRESHOLD:
            NotificationService.send_notification(
                user=user,
                title="Low Balance Alert",
                body=f"Your balance is R{current_balance}. Consider requesting funds.",
                notification_type='alert'
            )

    @staticmethod
    def send_spending_alert(parent, child, amount, category):
        """Notify parent when child makes a payment."""
        NotificationService.send_notification(
            user=parent,
            title="Spending Alert",
            body=f"{child.profile.full_name} spent R{amount} on {category}",
            notification_type='spending_alert',
            metadata={'child_id': str(child.id), 'amount': str(amount)}
        )


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
            self.limit_type = limit_type  # 'daily', 'weekly', or 'monthly'
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

        Raises SpendingLimitEnforcer.SpendingLimitExceeded with details
        if any limit (daily, weekly, monthly) would be exceeded.

        Does nothing if:
        - No limit is set for this category
        - The limit is disabled
        - The student is not a student role
        """
        if student.role != 'student':
            return  # Limits only apply to students

        try:
            limit = SpendingLimit.objects.get(
                child=student,
                category=category,
                is_enabled=True
            )
        except SpendingLimit.DoesNotExist:
            return  # No limit configured — allow

        amount = Decimal(str(amount))

        # Check daily limit
        if limit.daily_limit > 0:
            if limit.daily_spent + amount > limit.daily_limit:
                raise SpendingLimitEnforcer.SpendingLimitExceeded(
                    category=category,
                    limit_type='daily',
                    limit_value=limit.daily_limit,
                    spent=limit.daily_spent,
                    amount=amount,
                )

        # Check weekly limit
        if limit.weekly_limit > 0:
            if limit.weekly_spent + amount > limit.weekly_limit:
                raise SpendingLimitEnforcer.SpendingLimitExceeded(
                    category=category,
                    limit_type='weekly',
                    limit_value=limit.weekly_limit,
                    spent=limit.weekly_spent,
                    amount=amount,
                )

        # Check monthly limit
        if limit.monthly_limit > 0:
            if limit.monthly_spent + amount > limit.monthly_limit:
                raise SpendingLimitEnforcer.SpendingLimitExceeded(
                    category=category,
                    limit_type='monthly',
                    limit_value=limit.monthly_limit,
                    spent=limit.monthly_spent,
                    amount=amount,
                )

        logger.info(
            f"Limit check passed: {student.email} R{amount} [{category}]"
        )

    @staticmethod
    @transaction.atomic
    def record(student, amount, category):
        """
        Increment spent amounts after a successful payment.
        Call this AFTER the payment has been processed successfully.
        """
        LimitCheckerService.record_spending(student, amount, category)

        # Notify parent if child is approaching a limit
        SpendingLimitEnforcer._check_limit_warning(student, category)

    @staticmethod
    def _check_limit_warning(student, category):
        """
        Warn parent if child has used >= 80% of any limit.
        """
        try:
            limit = SpendingLimit.objects.get(child=student, category=category, is_enabled=True)
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
                    metadata={'child_id': str(student.id), 'category': category}
                )

        except (SpendingLimit.DoesNotExist, Exception):
            pass  # Don't block payment flow for warnings