# apps/admin_panel/views.py
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from .models import SystemConfig, AuditLog, FraudAlert
from .serializers import (
    SystemConfigSerializer, AuditLogSerializer, FraudAlertSerializer,
    UserManagementSerializer, PlatformAnalyticsSerializer
)
from core.permissions import IsAdmin
from core.utils import parse_date_param
from apps.accounts.models import User
from apps.wallets.models import Transaction, Wallet
from apps.payments.models import Merchant
from apps.payments.serializers import MerchantSerializer
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

        # Apply filters
        user_id = self.request.query_params.get('user')
        action = self.request.query_params.get('action')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if action:
            queryset = queryset.filter(action=action)
        # Invalid values are ignored rather than 500-ing the endpoint.
        try:
            if start_date:
                queryset = queryset.filter(created_at__gte=parse_date_param(start_date))
            if end_date:
                queryset = queryset.filter(created_at__lte=parse_date_param(end_date))
        except ValueError:
            logger.warning("Ignoring invalid date filter on audit log query")

        return queryset


class FraudAlertViewSet(viewsets.ModelViewSet):
    """Manage fraud alerts"""
    queryset = FraudAlert.objects.all()
    serializer_class = FraudAlertSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # If status is being changed to resolved or confirmed
        if 'status' in request.data:
            instance.resolved_by = request.user
            instance.resolved_at = timezone.now()

        self.perform_update(serializer)
        return Response(serializer.data)


class UserManagementView(APIView):
    """Admin user management"""
    permission_classes = [IsAuthenticated, IsAdmin]

    # Cap the page size so this endpoint cannot be used to dump the whole
    # user table (and all its PII) in a single response.
    DEFAULT_PAGE_SIZE = 50
    MAX_PAGE_SIZE = 200

    def get(self, request):
        # select_related('profile'): UserManagementSerializer reads
        # profile.full_name, which issued one extra query per user (N+1).
        users = User.objects.select_related('profile').all()

        # Apply filters
        role = request.query_params.get('role')
        is_active = request.query_params.get('is_active')

        if role:
            valid_roles = {choice[0] for choice in User.ROLE_CHOICES}
            if role not in valid_roles:
                return Response({
                    'status': 'error',
                    'message': f"role must be one of: {', '.join(sorted(valid_roles))}"
                }, status=status.HTTP_400_BAD_REQUEST)
            users = users.filter(role=role)
        if is_active is not None:
            users = users.filter(is_active=is_active.lower() == 'true')

        # The response was previously unbounded.
        try:
            limit = int(request.query_params.get('limit', self.DEFAULT_PAGE_SIZE))
            offset = int(request.query_params.get('offset', 0))
        except (TypeError, ValueError):
            return Response({
                'status': 'error',
                'message': 'limit and offset must be integers'
            }, status=status.HTTP_400_BAD_REQUEST)

        limit = max(1, min(limit, self.MAX_PAGE_SIZE))
        offset = max(0, offset)

        total = users.count()
        serializer = UserManagementSerializer(users[offset:offset + limit], many=True)
        return Response({
            'status': 'success',
            'data': serializer.data,
            'pagination': {'total': total, 'limit': limit, 'offset': offset},
        })

    def put(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Update user. `role` is validated against ROLE_CHOICES: Django does
        # not enforce choices on .save(), so any arbitrary string (e.g.
        # "superadmin") was previously written straight to the column, silently
        # locking the account out of every role-based permission check.
        if 'role' in request.data:
            new_role = request.data['role']
            valid_roles = {choice[0] for choice in User.ROLE_CHOICES}
            if new_role not in valid_roles:
                return Response({
                    'status': 'error',
                    'message': f"role must be one of: {', '.join(sorted(valid_roles))}"
                }, status=status.HTTP_400_BAD_REQUEST)
            user.role = new_role

        if 'is_active' in request.data:
            is_active = request.data['is_active']
            if not isinstance(is_active, bool):
                return Response({
                    'status': 'error',
                    'message': 'is_active must be a boolean'
                }, status=status.HTTP_400_BAD_REQUEST)
            # Stop an admin from locking themselves out mid-session.
            if user.id == request.user.id and not is_active:
                return Response({
                    'status': 'error',
                    'message': 'You cannot deactivate your own account'
                }, status=status.HTTP_400_BAD_REQUEST)
            user.is_active = is_active

        user.save()

        # Log action. Only the fields this endpoint actually acts on are
        # recorded: `changes=request.data` persisted the entire request body
        # verbatim into the audit trail, so any credential or PII a caller
        # included (a password, a token) was written to durable storage in
        # cleartext and then exposed through AuditLogSerializer.
        AuditLog.objects.create(
            user=request.user,
            action='admin_action',
            resource_type='user',
            resource_id=str(user.id),
            changes={
                field: request.data[field]
                for field in ('role', 'is_active')
                if field in request.data
            },
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        return Response({
            'status': 'success',
            'message': 'User updated successfully'
        })


class MerchantVerificationView(APIView):
    """Admin merchant verification"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        merchants = Merchant.objects.filter(verified=False)
        serializer = MerchantSerializer(merchants, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        })

    def post(self, request, merchant_id):
        try:
            merchant = Merchant.objects.get(id=merchant_id)
        except Merchant.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Merchant not found'
            }, status=status.HTTP_404_NOT_FOUND)

        merchant.verified = True
        merchant.verified_by = request.user
        merchant.verified_at = timezone.now()
        merchant.save()

        return Response({
            'status': 'success',
            'message': 'Merchant verified successfully'
        })


class PlatformAnalyticsView(APIView):
    """Platform-wide analytics for admin"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        period = request.query_params.get('period', 'month')

        # Determine date range
        now = timezone.now()
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'month':
            start_date = now - timedelta(days=30)
        elif period == 'year':
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=30)

        # User statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(
            last_login__gte=start_date,
            is_active=True
        ).count()

        # Transaction statistics
        transactions = Transaction.objects.filter(created_at__gte=start_date)
        total_transactions = transactions.count()
        total_volume = transactions.aggregate(total=Sum('amount'))['total'] or 0

        # Pending alerts
        pending_alerts = FraudAlert.objects.filter(status='pending').count()

        # Growth trends: one grouped aggregate instead of 12 sequential COUNT
        # round-trips. The old loop also built month boundaries with
        # .replace(day=1, hour=0, minute=0, second=0), which left microseconds
        # intact and double-counted across bucket edges.
        twelve_months_ago = (now - timedelta(days=365)).replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        monthly_counts = {
            row['month']: row['new_users']
            for row in User.objects
                           .filter(created_at__gte=twelve_months_ago)
                           .annotate(month=TruncMonth('created_at'))
                           .values('month')
                           .annotate(new_users=Count('id'))
        }
        user_growth = []
        for i in range(11, -1, -1):
            bucket = (now - timedelta(days=30 * i)).replace(
                day=1, hour=0, minute=0, second=0, microsecond=0
            )
            user_growth.append({
                'month': bucket.strftime('%Y-%m'),
                'new_users': monthly_counts.get(bucket, 0),
            })

        # Revenue by category
        revenue_by_category = Transaction.objects.filter(
            type='payment',
            created_at__gte=start_date
        ).values('category').annotate(
            total=Sum('amount')
        ).order_by('-total')

        return Response({
            'status': 'success',
            'data': {
                'period': period,
                'total_users': total_users,
                'active_users': active_users,
                'total_transactions': total_transactions,
                'total_volume': total_volume,
                'pending_alerts': pending_alerts,
                'user_growth': user_growth,
                'revenue_by_category': list(revenue_by_category)
            }
        })


class FraudMonitoringView(APIView):
    """Monitor and detect fraud"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        # Get recent high-risk transactions
        high_risk_alerts = FraudAlert.objects.filter(
            severity__in=['high', 'critical'],
            status='pending'
        ).order_by('-created_at')[:20]

        serializer = FraudAlertSerializer(high_risk_alerts, many=True)

        return Response({
            'status': 'success',
            'data': {
                'high_risk_alerts': serializer.data,
                'total_pending': FraudAlert.objects.filter(status='pending').count()
            }
        })

    def post(self, request):
        """Manually trigger fraud check for transaction"""
        transaction_id = request.data.get('transaction_id')

        try:
            transaction = Transaction.objects.get(id=transaction_id)
        except Transaction.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Transaction not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Check for large transaction. get_or_create keeps a repeated manual
        # trigger from stacking duplicate alerts for the same transaction, and
        # the threshold is configurable rather than a literal in the view.
        threshold = getattr(settings, 'FRAUD_LARGE_TRANSACTION_THRESHOLD', Decimal('10000'))
        if transaction.amount > threshold:
            FraudAlert.objects.get_or_create(
                transaction=transaction,
                alert_type='large_transaction',
                defaults={
                    'severity': 'high',
                    'description': f"Large transaction of {transaction.amount} detected",
                },
            )

        return Response({
            'status': 'success',
            'message': 'Fraud check completed'
        })