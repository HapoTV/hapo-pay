# apps/admin_panel/services.py
"""
Admin panel service layer.

Centralizes business logic used by admin panel views so that views stay thin
and the same operations can be reused from management commands, Celery tasks,
or tests.

All service methods are static and use @transaction.atomic where multiple
database writes must succeed or fail together.
"""
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from apps.accounts.models import User
from apps.wallets.models import Transaction, Wallet
from apps.payments.models import FraudAlert
from .models import AuditLog, SystemConfig
import logging

logger = logging.getLogger(__name__)


class AuditLogService:
    """
    Service for creating audit log entries.
    All admin actions should go through this service to guarantee consistency.
    """

    @staticmethod
    def log(request, action, resource_type, resource_id=None, changes=None):
        """
        Create an audit log entry for the given request.

        Args:
            request: Django request object (used to extract user, IP, UA)
            action: Short string describing the action (e.g. 'update_user')
            resource_type: Type of resource affected (e.g. 'user', 'merchant')
            resource_id: Optional ID of the affected resource
            changes: Optional dict of changes made

        Returns:
            AuditLog instance, or None if logging failed
        """
        try:
            return AuditLog.objects.create(
                user=request.user if request.user.is_authenticated else None,
                action=action,
                resource_type=resource_type,
                resource_id=str(resource_id) if resource_id else None,
                changes=changes or {},
                ip_address=request.META.get('REMOTE_ADDR', '0.0.0.0'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
            )
        except Exception as e:
            # Never let audit logging break the actual operation
            logger.error(f"Failed to create audit log: {e}")
            return None


class UserManagementService:
    """
    Service for admin actions on user accounts.
    """

    @staticmethod
    @transaction.atomic
    def update_user(user, data, actor, request=None):
        """
        Update a user's role and/or active status.

        Args:
            user: User instance to update
            data: Dict containing optional 'role' and 'is_active' keys
            actor: The admin user performing the action
            request: Optional request for audit logging

        Returns:
            The updated User instance

        Raises:
            ValueError: If the update fails
        """
        try:
            if 'role' in data:
                user.role = data['role']
            if 'is_active' in data:
                user.is_active = data['is_active']
            user.save()

            if request:
                AuditLogService.log(
                    request,
                    action='update_user',
                    resource_type='user',
                    resource_id=user.id,
                    changes=data,
                )
            return user
        except Exception as e:
            logger.error(f"Failed to update user {user.id}: {e}")
            raise ValueError(f"Could not update user: {str(e)}")

    @staticmethod
    @transaction.atomic
    def suspend_user(user, reason, request=None):
        """
        Deactivate a user account.
        """
        try:
            user.is_active = False
            user.save(update_fields=['is_active'])

            if request:
                AuditLogService.log(
                    request,
                    action='suspend_user',
                    resource_type='user',
                    resource_id=user.id,
                    changes={'reason': reason},
                )
            return user
        except Exception as e:
            logger.error(f"Failed to suspend user {user.id}: {e}")
            raise ValueError(f"Could not suspend user: {str(e)}")

    @staticmethod
    @transaction.atomic
    def activate_user(user, request=None):
        """
        Reactivate a user account.
        """
        try:
            user.is_active = True
            user.save(update_fields=['is_active'])

            if request:
                AuditLogService.log(
                    request,
                    action='activate_user',
                    resource_type='user',
                    resource_id=user.id,
                )
            return user
        except Exception as e:
            logger.error(f"Failed to activate user {user.id}: {e}")
            raise ValueError(f"Could not activate user: {str(e)}")

    @staticmethod
    @transaction.atomic
    def delete_user(user, request=None):
        """
        Delete a user account permanently.
        Should generally be avoided in favour of deactivation.
        """
        try:
            user_id = user.id
            user.delete()

            if request:
                AuditLogService.log(
                    request,
                    action='delete_user',
                    resource_type='user',
                    resource_id=user_id,
                )
            return True
        except Exception as e:
            logger.error(f"Failed to delete user {user.id}: {e}")
            raise ValueError(f"Could not delete user: {str(e)}")


class MerchantVerificationService:
    """
    Service for verifying or rejecting merchant applications.
    """

    @staticmethod
    @transaction.atomic
    def verify_merchant(merchant, admin_user, request=None):
        """
        Mark a merchant as verified.

        Args:
            merchant: Merchant instance
            admin_user: Admin performing the verification
            request: Optional request for audit logging

        Returns:
            Updated merchant instance
        """
        try:
            merchant.verified = True
            merchant.verified_by = admin_user
            merchant.verified_at = timezone.now()
            merchant.save(update_fields=['verified', 'verified_by', 'verified_at'])

            if request:
                AuditLogService.log(
                    request,
                    action='verify_merchant',
                    resource_type='merchant',
                    resource_id=merchant.id,
                )
            return merchant
        except Exception as e:
            logger.error(f"Failed to verify merchant {merchant.id}: {e}")
            raise ValueError(f"Could not verify merchant: {str(e)}")

    @staticmethod
    @transaction.atomic
    def reject_merchant(merchant, request=None):
        """
        Reject a merchant application.
        """
        try:
            merchant.verified = False
            merchant.save(update_fields=['verified'])

            if request:
                AuditLogService.log(
                    request,
                    action='reject_merchant',
                    resource_type='merchant',
                    resource_id=merchant.id,
                )
            return merchant
        except Exception as e:
            logger.error(f"Failed to reject merchant {merchant.id}: {e}")
            raise ValueError(f"Could not reject merchant: {str(e)}")


class FraudAlertService:
    """
    Service for reviewing and resolving fraud alerts.
    """

    @staticmethod
    @transaction.atomic
    def update_alert(alert, new_status, reviewer, review_notes='', request=None):
        """
        Update a fraud alert's status.

        When an alert is marked 'false_positive', the underlying transaction
        is automatically unfrozen and returned to the 'completed' state.

        Args:
            alert: FraudAlert instance
            new_status: One of FraudAlert.STATUS_CHOICES
            reviewer: Admin user performing the review
            review_notes: Optional notes
            request: Optional request for audit logging

        Returns:
            Updated FraudAlert instance
        """
        try:
            alert.status = new_status
            alert.review_notes = review_notes
            alert.reviewed_by = reviewer
            alert.reviewed_at = timezone.now()

            # If cleared, unfreeze the associated transaction
            if new_status == 'false_positive':
                try:
                    txn = alert.transaction
                    txn.status = 'completed'
                    txn.is_flagged = False
                    txn.save(update_fields=['status', 'is_flagged', 'updated_at'])
                except Exception as txn_err:
                    logger.error(f"Failed to unfreeze transaction: {txn_err}")

            alert.save()

            if request:
                AuditLogService.log(
                    request,
                    action='update_fraud_alert',
                    resource_type='fraud_alert',
                    resource_id=alert.id,
                    changes={'status': new_status},
                )
            return alert
        except Exception as e:
            logger.error(f"Failed to update fraud alert {alert.id}: {e}")
            raise ValueError(f"Could not update fraud alert: {str(e)}")


class SystemConfigService:
    """
    Service for reading and writing system configuration values.
    """

    @staticmethod
    def get(key, default=None):
        """
        Read a config value by key.
        Returns the default if the key does not exist.
        """
        try:
            return SystemConfig.objects.get(key=key).value
        except SystemConfig.DoesNotExist:
            return default
        except Exception as e:
            logger.error(f"Failed to read system config '{key}': {e}")
            return default

    @staticmethod
    @transaction.atomic
    def set(key, value, admin_user=None, description=None):
        """
        Create or update a config value.
        """
        try:
            config, _ = SystemConfig.objects.update_or_create(
                key=key,
                defaults={
                    'value': value,
                    'updated_by': admin_user,
                    'description': description or '',
                }
            )
            return config
        except Exception as e:
            logger.error(f"Failed to set system config '{key}': {e}")
            raise ValueError(f"Could not set system config: {str(e)}")


class AnalyticsService:
    """
    Service for computing platform-wide analytics.
    Kept separate from views so it can be reused by Celery tasks or reports.
    """

    @staticmethod
    def get_platform_analytics(period='month'):
        """
        Compute aggregate statistics for the admin dashboard.

        Args:
            period: 'week', 'month', or 'year'

        Returns:
            Dict of analytics values
        """
        from django.db.models import Sum
        from datetime import timedelta

        try:
            now = timezone.now()
            if period == 'week':
                start_date = now - timedelta(days=7)
            elif period == 'year':
                start_date = now - timedelta(days=365)
            else:
                start_date = now - timedelta(days=30)

            transactions = Transaction.objects.filter(created_at__gte=start_date)

            return {
                'period': period,
                'total_users': User.objects.count(),
                'active_users': User.objects.filter(
                    last_login__gte=start_date, is_active=True
                ).count(),
                'total_transactions': transactions.count(),
                'total_volume': transactions.aggregate(
                    total=Sum('amount')
                )['total'] or 0,
                'pending_alerts': FraudAlert.objects.filter(status='pending').count(),
            }
        except Exception as e:
            logger.error(f"Failed to compute analytics: {e}")
            return {
                'period': period,
                'total_users': 0,
                'active_users': 0,
                'total_transactions': 0,
                'total_volume': 0,
                'pending_alerts': 0,
            }