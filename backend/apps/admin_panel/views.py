# apps/admin_panel/views.py
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import SystemConfig, AuditLog, FraudAlert
from .serializers import (
    SystemConfigSerializer, AuditLogSerializer, FraudAlertSerializer,
    UserManagementSerializer, PlatformAnalyticsSerializer
)
from core.permissions import IsAdmin
from apps.accounts.models import User
from apps.wallets.models import Transaction, Wallet
from apps.payments.models import Merchant
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
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)

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

    def get(self, request):
        users = User.objects.all()

        # Apply filters
        role = request.query_params.get('role')
        is_active = request.query_params.get('is_active')

        if role:
            users = users.filter(role=role)
        if is_active is not None:
            users = users.filter(is_active=is_active.lower() == 'true')

        serializer = UserManagementSerializer(users, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        })

    def put(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Update user
        if 'role' in request.data:
            user.role = request.data['role']
        if 'is_active' in request.data:
            user.is_active = request.data['is_active']

        user.save()

        # Log action
        AuditLog.objects.create(
            user=request.user,
            action='admin_action',
            resource_type='user',
            resource_id=str(user.id),
            changes=request.data,
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

        # Growth trends
        user_growth = []
        for i in range(12):
            month_date = now - timedelta(days=30 * i)
            month_start = month_date.replace(day=1, hour=0, minute=0, second=0)
            month_end = (month_start + timedelta(days=32)).replace(day=1)
            users_in_month = User.objects.filter(created_at__gte=month_start, created_at__lt=month_end).count()
            user_growth.append({
                'month': month_start.strftime('%Y-%m'),
                'new_users': users_in_month
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

        # Check for large transaction
        if transaction.amount > 10000:
            FraudAlert.objects.create(
                transaction=transaction,
                alert_type='large_transaction',
                severity='high',
                description=f"Large transaction of {transaction.amount} detected"
            )

        return Response({
            'status': 'success',
            'message': 'Fraud check completed'
        })