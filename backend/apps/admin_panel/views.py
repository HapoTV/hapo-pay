# apps/admin_panel/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
from .models import SystemConfig, AuditLog
from apps.payments.models import FraudAlert
from .serializers import (
    SystemConfigSerializer, AuditLogSerializer, FraudAlertSerializer,
    UserManagementSerializer, PlatformAnalyticsSerializer
)
from .services import (
    AuditLogService, UserManagementService, MerchantVerificationService,
    FraudAlertService, AnalyticsService
)
from apps.payments.serializers import MerchantSerializer
from core.permissions import IsAdmin
from apps.accounts.models import User
from apps.wallets.models import Transaction, Wallet
from apps.payments.models import Merchant
from apps.payments.fraud_detection import check_transaction, freeze_and_alert
import logging

logger = logging.getLogger(__name__)


class SystemConfigViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for system configuration.
    Admin only.

    GET    /admin/config/          — list all config entries
    POST   /admin/config/          — create a new config entry
    GET    /admin/config/<key>/    — retrieve config by key
    PUT    /admin/config/<key>/    — update a config entry
    DELETE /admin/config/<key>/    — delete a config entry
    """
    queryset = SystemConfig.objects.all()
    serializer_class = SystemConfigSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def list(self, request, *args, **kwargs):
        """List all system configs. Wrapped for error handling."""
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.exception("SystemConfig list failed")
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only endpoint for audit logs with filtering.
    Admin only.

    GET /admin/audit-logs/                — list all logs
    GET /admin/audit-logs/?user=<id>      — filter by user
    GET /admin/audit-logs/?action=login   — filter by action
    GET /admin/audit-logs/?start_date=... — filter by date range
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        """
        Apply optional query-parameter filters to the audit log queryset.
        Wrapped in try/except so a malformed filter doesn't 500 the endpoint.
        """
        try:
            queryset = super().get_queryset()
            user_id    = self.request.query_params.get('user')
            action     = self.request.query_params.get('action')
            start_date = self.request.query_params.get('start_date')
            end_date   = self.request.query_params.get('end_date')

            if user_id:
                queryset = queryset.filter(user_id=user_id)
            if action:
                queryset = queryset.filter(action=action)
            if start_date:
                queryset = queryset.filter(created_at__gte=start_date)
            if end_date:
                queryset = queryset.filter(created_at__lte=end_date)
            return queryset
        except Exception as e:
            logger.error(f"Audit log filtering failed: {e}")
            return AuditLog.objects.none()


class FraudAlertViewSet(viewsets.ModelViewSet):
    """
    Admin endpoint for managing fraud alerts.

    GET    /admin/fraud-alerts/              — list alerts
    GET    /admin/fraud-alerts/?status=...   — filter by status
    GET    /admin/fraud-alerts/?severity=... — filter by severity
    PUT    /admin/fraud-alerts/<id>/         — update an alert (review)
    """
    queryset = FraudAlert.objects.all()
    serializer_class = FraudAlertSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        """
        Filter fraud alerts by status/severity and prefetch related objects.
        """
        try:
            queryset = super().get_queryset().select_related(
                'transaction', 'user', 'reviewed_by'
            )
            status_filter   = self.request.query_params.get('status')
            severity_filter = self.request.query_params.get('severity')

            if status_filter:
                queryset = queryset.filter(status=status_filter)
            if severity_filter:
                queryset = queryset.filter(severity=severity_filter)
            return queryset
        except Exception as e:
            logger.error(f"Fraud alert filtering failed: {e}")
            return FraudAlert.objects.none()

    def update(self, request, *args, **kwargs):
        """
        Review a fraud alert. Delegates all status-changing logic and
        transaction-unfreezing to FraudAlertService.
        """
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()

            new_status = request.data.get('status')
            review_notes = request.data.get('review_notes', '')

            if new_status and new_status != instance.status:
                FraudAlertService.update_alert(
                    alert=instance,
                    new_status=new_status,
                    reviewer=request.user,
                    review_notes=review_notes,
                    request=request,
                )
                # Refresh instance from DB to get latest state
                instance.refresh_from_db()

            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            logger.exception("Failed to update fraud alert")
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserManagementView(APIView):
    """
    Admin user management endpoints.

    GET    /admin/users/                 — list all users with filters
    PUT    /admin/users/<id>/            — update role or is_active
    DELETE /admin/users/<id>/            — delete user
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        """
        List users with optional role, active status, and search filters.
        """
        try:
            users = User.objects.all()

            role      = request.query_params.get('role')
            is_active = request.query_params.get('is_active')
            search    = request.query_params.get('search')

            if role:
                users = users.filter(role=role)
            if is_active is not None:
                users = users.filter(is_active=is_active.lower() == 'true')
            if search:
                users = users.filter(email__icontains=search)

            serializer = UserManagementSerializer(users, many=True)
            return Response({'status': 'success', 'data': serializer.data})
        except Exception as e:
            logger.exception("User list failed")
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, user_id):
        """
        Update a user's role and/or active status via UserManagementService.
        """
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.exception("User lookup failed")
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            UserManagementService.update_user(
                user=user,
                data=request.data,
                actor=request.user,
                request=request,
            )
            return Response({'status': 'success', 'message': 'User updated successfully'})
        except ValueError as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception("User update failed")
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, user_id):
        """
        Delete a user via UserManagementService (logs the action).
        """
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.exception("User lookup failed")
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            UserManagementService.delete_user(user, request=request)
            return Response(
                {'status': 'success', 'message': 'User deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )
        except ValueError as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception("User delete failed")
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserSuspendView(APIView):
    """
    POST /admin/users/<id>/suspend/
    Deactivate a user account.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            reason = request.data.get('reason', '')
            UserManagementService.suspend_user(user, reason, request=request)
            return Response({'status': 'success', 'message': 'User suspended successfully'})
        except ValueError as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception("User suspend failed")
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserActivateView(APIView):
    """
    POST /admin/users/<id>/activate/
    Reactivate a user account.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            UserManagementService.activate_user(user, request=request)
            return Response({'status': 'success', 'message': 'User activated successfully'})
        except ValueError as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception("User activate failed")
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MerchantVerificationView(APIView):
    """
    Admin merchant verification endpoints.

    GET  /admin/merchants/pending/        — list unverified merchants
    POST /admin/merchants/<id>/verify/    — verify or reject a merchant
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        """List all merchants awaiting verification."""
        try:
            merchants = Merchant.objects.filter(verified=False).order_by('-created_at')
            serializer = MerchantSerializer(merchants, many=True)
            return Response({'status': 'success', 'data': serializer.data})
        except Exception as e:
            logger.exception("Merchant list failed")
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request, merchant_id):
        """
        Verify or reject a merchant.
        The `action` field in the body determines which path to take.
        """
        try:
            merchant = Merchant.objects.get(id=merchant_id)
        except Merchant.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'Merchant not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            action = request.data.get('action', 'verify')
            if action == 'verify':
                MerchantVerificationService.verify_merchant(
                    merchant, request.user, request=request
                )
                message = 'Merchant verified successfully'
            else:
                MerchantVerificationService.reject_merchant(merchant, request=request)
                message = 'Merchant rejected'

            return Response({'status': 'success', 'message': message})
        except ValueError as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception("Merchant action failed")
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PlatformAnalyticsView(APIView):
    """
    GET /admin/analytics/
    Platform-wide statistics for the admin dashboard.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        try:
            period = request.query_params.get('period', 'month')
            data = AnalyticsService.get_platform_analytics(period=period)

            # Add 12-month growth + revenue breakdown (only in view; service
            # could be extended later but keeps primary metrics focused)
            now = timezone.now()
            user_growth = []
            for i in range(12):
                month_date = now - timedelta(days=30 * i)
                month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                month_end = (month_start + timedelta(days=32)).replace(day=1)
                count = User.objects.filter(
                    created_at__gte=month_start,
                    created_at__lt=month_end
                ).count()
                user_growth.append({
                    'month': month_start.strftime('%Y-%m'),
                    'new_users': count
                })

            revenue_by_category = list(
                Transaction.objects.filter(
                    type='payment',
                    created_at__gte=now - timedelta(days=30)
                ).values('category').annotate(total=Sum('amount')).order_by('-total')
            )

            data['user_growth'] = user_growth
            data['revenue_by_category'] = revenue_by_category

            return Response({'status': 'success', 'data': data})
        except Exception as e:
            logger.exception("Analytics failed")
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FraudMonitoringView(APIView):
    """
    GET  /admin/fraud-monitoring/ — high-risk pending alerts
    POST /admin/fraud-monitoring/ — manually re-run fraud engine on a transaction
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        """Return top high/critical pending fraud alerts."""
        try:
            high_risk_alerts = FraudAlert.objects.filter(
                severity__in=['high', 'critical'],
                status='pending'
            ).select_related('transaction', 'user').order_by('-created_at')[:20]

            serializer = FraudAlertSerializer(high_risk_alerts, many=True)
            return Response({
                'status': 'success',
                'data': {
                    'high_risk_alerts': serializer.data,
                    'total_pending': FraudAlert.objects.filter(status='pending').count(),
                }
            })
        except Exception as e:
            logger.exception("Fraud monitoring GET failed")
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """
        Re-run the fraud engine on an existing transaction.
        Useful when rules have changed or admin suspects something was missed.
        """
        try:
            transaction_id = request.data.get('transaction_id')

            try:
                txn = Transaction.objects.get(id=transaction_id)
            except Transaction.DoesNotExist:
                return Response(
                    {'status': 'error', 'message': 'Transaction not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            if txn.status == 'frozen':
                return Response(
                    {'status': 'error', 'message': 'Transaction is already frozen'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            is_suspicious, reasons, severity, alert_type = check_transaction(txn, txn.user)

            if is_suspicious:
                freeze_and_alert(txn, reasons, severity, alert_type)
                return Response({
                    'status': 'success',
                    'message': 'Transaction flagged and frozen',
                    'data': {'reasons': reasons, 'severity': severity}
                })

            return Response({
                'status': 'success',
                'message': 'No fraud indicators found',
                'data': {'reasons': []}
            })
        except Exception as e:
            logger.exception("Fraud monitoring POST failed")
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )