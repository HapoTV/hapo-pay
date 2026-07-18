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
from apps.payments.serializers import MerchantSerializer
from core.permissions import IsAdmin
from apps.accounts.models import User
from apps.wallets.models import Transaction, Wallet
from apps.payments.models import Merchant
from apps.payments.fraud_detection import check_transaction, freeze_and_alert
import logging

logger = logging.getLogger(__name__)


class SystemConfigViewSet(viewsets.ModelViewSet):
    """Manage system configuration"""
    queryset = SystemConfig.objects.all()
    serializer_class = SystemConfigSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """View audit logs"""
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        queryset = super().get_queryset()
        user_id   = self.request.query_params.get('user')
        action    = self.request.query_params.get('action')
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


class FraudAlertViewSet(viewsets.ModelViewSet):
    """Manage fraud alerts — list, filter, and action"""
    queryset = FraudAlert.objects.all()
    serializer_class = FraudAlertSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
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

    def update(self, request, *args, **kwargs):
        partial  = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)

        new_status = request.data.get('status')
        if new_status and new_status != instance.status:
            instance.reviewed_by = request.user
            instance.reviewed_at = timezone.now()

            # Unfreeze transaction if cleared as false positive
            if new_status == 'false_positive':
                txn = instance.transaction
                txn.status    = 'completed'
                txn.is_flagged = False
                txn.save(update_fields=['status', 'is_flagged', 'updated_at'])

        self.perform_update(serializer)
        instance.save(update_fields=['reviewed_by', 'reviewed_at'])
        return Response(serializer.data)


class UserManagementView(APIView):
    """
    GET  /admin/users/              — list all users with filters
    PUT  /admin/users/<id>/         — update role or is_active
    POST /admin/users/<id>/suspend/ — suspend user
    POST /admin/users/<id>/activate/— activate user
    DELETE /admin/users/<id>/       — delete user
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
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

    def put(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if 'role' in request.data:
            user.role = request.data['role']
        if 'is_active' in request.data:
            user.is_active = request.data['is_active']
        user.save()

        self._log_action(request, 'update_user', user)
        return Response({'status': 'success', 'message': 'User updated successfully'})

    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        self._log_action(request, 'delete_user', user)
        user.delete()
        return Response(
            {'status': 'success', 'message': 'User deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )

    def _log_action(self, request, action, user):
        AuditLog.objects.create(
            user=request.user,
            action=action,
            resource_type='user',
            resource_id=str(user.id),
            changes=request.data,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )


class UserSuspendView(APIView):
    """POST /admin/users/<id>/suspend/"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        user.is_active = False
        user.save(update_fields=['is_active'])

        AuditLog.objects.create(
            user=request.user,
            action='suspend_user',
            resource_type='user',
            resource_id=str(user.id),
            changes={'reason': request.data.get('reason', '')},
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        return Response({'status': 'success', 'message': 'User suspended successfully'})


class UserActivateView(APIView):
    """POST /admin/users/<id>/activate/"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        user.is_active = True
        user.save(update_fields=['is_active'])

        AuditLog.objects.create(
            user=request.user,
            action='activate_user',
            resource_type='user',
            resource_id=str(user.id),
            changes={},
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        return Response({'status': 'success', 'message': 'User activated successfully'})


class MerchantVerificationView(APIView):
    """
    GET  /admin/merchants/pending/          — list unverified merchants
    POST /admin/merchants/<id>/verify/      — verify a merchant
    POST /admin/merchants/<id>/reject/      — reject a merchant
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        merchants = Merchant.objects.filter(verified=False).order_by('-created_at')
        serializer = MerchantSerializer(merchants, many=True)
        return Response({'status': 'success', 'data': serializer.data})

    def post(self, request, merchant_id):
        try:
            merchant = Merchant.objects.get(id=merchant_id)
        except Merchant.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'Merchant not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        action = request.data.get('action', 'verify')  # verify | reject

        if action == 'verify':
            merchant.verified    = True
            merchant.verified_by = request.user
            merchant.verified_at = timezone.now()
            merchant.save(update_fields=['verified', 'verified_by', 'verified_at'])
            message = 'Merchant verified successfully'
        else:
            merchant.verified = False
            merchant.save(update_fields=['verified'])
            message = 'Merchant rejected'

        AuditLog.objects.create(
            user=request.user,
            action=f'{action}_merchant',
            resource_type='merchant',
            resource_id=str(merchant.id),
            changes={'action': action},
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        return Response({'status': 'success', 'message': message})


class MerchantSettlementRunView(APIView):
    """
    POST /admin/merchants/<id>/settlements/run/
    Body: {"period_start": ISO datetime, "period_end": ISO datetime}
    Creates a Settlement covering the merchant's completed, not-yet-settled
    transactions in that window. Does not itself move money — this records
    what's owed; the actual payout/bank transfer is a separate, manual step
    until a payment-provider payout integration exists.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, merchant_id):
        try:
            merchant = Merchant.objects.get(id=merchant_id)
        except Merchant.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'Merchant not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        period_start = request.data.get('period_start')
        period_end = request.data.get('period_end')
        if not period_start or not period_end:
            return Response(
                {'status': 'error', 'message': 'period_start and period_end are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from apps.payments.serializers import SettlementSerializer
        from apps.payments.services import SettlementService

        settlement = SettlementService.run_settlement(
            merchant=merchant,
            period_start=period_start,
            period_end=period_end,
            initiated_by=request.user,
        )

        AuditLog.objects.create(
            user=request.user,
            action='run_merchant_settlement',
            resource_type='settlement',
            resource_id=str(settlement.id),
            changes={
                'merchant_id': str(merchant.id),
                'net_amount': str(settlement.net_amount),
                'transaction_count': settlement.transaction_count,
            },
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        return Response({
            'status': 'success',
            'message': 'Settlement created',
            'data': SettlementSerializer(settlement).data
        }, status=status.HTTP_201_CREATED)


class PlatformAnalyticsView(APIView):
    """GET /admin/analytics/ — platform-wide stats"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        period = request.query_params.get('period', 'month')
        now = timezone.now()

        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'year':
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=30)

        total_users       = User.objects.count()
        active_users      = User.objects.filter(
            last_login__gte=start_date, is_active=True
        ).count()

        transactions      = Transaction.objects.filter(created_at__gte=start_date)
        total_transactions = transactions.count()
        total_volume      = transactions.aggregate(
            total=Sum('amount')
        )['total'] or 0
        pending_alerts    = FraudAlert.objects.filter(status='pending').count()

        # Monthly user growth (last 12 months)
        user_growth = []
        for i in range(12):
            month_date  = now - timedelta(days=30 * i)
            month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_end   = (month_start + timedelta(days=32)).replace(day=1)
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
                type='payment', created_at__gte=start_date
            ).values('category').annotate(total=Sum('amount')).order_by('-total')
        )

        return Response({
            'status': 'success',
            'data': {
                'period':               period,
                'total_users':          total_users,
                'active_users':         active_users,
                'total_transactions':   total_transactions,
                'total_volume':         total_volume,
                'pending_alerts':       pending_alerts,
                'user_growth':          user_growth,
                'revenue_by_category':  revenue_by_category,
            }
        })


class FraudMonitoringView(APIView):
    """
    GET  /admin/fraud-monitoring/ — high risk pending alerts
    POST /admin/fraud-monitoring/ — manually re-run fraud engine on a transaction
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
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

    def post(self, request):
        """Manually re-run the fraud engine on an existing transaction"""
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