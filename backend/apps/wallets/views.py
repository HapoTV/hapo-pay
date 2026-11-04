# apps/wallets/views.py
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db import transaction
from django.utils import timezone
from django.core.cache import cache
from .models import Wallet, Transaction, SpendingLimit, MoneyRequest
from .serializers import (
    WalletSerializer, TransactionSerializer, SpendingLimitSerializer,
    MoneyRequestSerializer, TransferFundsSerializer, UpdateSpendingLimitSerializer,
    CreateMoneyRequestSerializer, ApproveMoneyRequestSerializer
)
from core.permissions import IsParent, IsStudent, IsOwnAccount
from core.supabase_client import supabase
from apps.notifications.services import NotificationService
from apps.gamification.services import PointCalculatorService
import logging

logger = logging.getLogger(__name__)


class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing wallet information"""
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent':
            # Parents can see their own wallet and children's wallets
            children_ids = user.children.values_list('id', flat=True)
            return Wallet.objects.filter(user__in=[user.id] + list(children_ids))
        else:
            # Students see only their own wallet
            return Wallet.objects.filter(user=user)


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing transactions"""
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent':
            # Parents can see their own transactions and children's transactions
            children_ids = user.children.values_list('id', flat=True)
            return Transaction.objects.filter(user__in=[user.id] + list(children_ids))
        else:
            # Students see only their own transactions
            return Transaction.objects.filter(user=user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Apply filters
        transaction_type = request.query_params.get('type')
        category = request.query_params.get('category')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if transaction_type:
            queryset = queryset.filter(type=transaction_type)
        if category:
            queryset = queryset.filter(category=category)
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TransferFundsView(APIView):
    """Handle fund transfers between parent and child"""
    permission_classes = [IsAuthenticated, IsParent]

    @transaction.atomic
    def post(self, request):
        serializer = TransferFundsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        sender = request.user
        recipient_id = serializer.validated_data['recipient_id']
        amount = serializer.validated_data['amount']
        description = serializer.validated_data.get('description', 'Fund transfer')

        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Recipient not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Check if recipient is a child of the parent
        if recipient.role != 'student' or recipient.student_profile.parent_id != sender.id:
            return Response({
                'status': 'error',
                'message': 'You can only transfer to your own children'
            }, status=status.HTTP_403_FORBIDDEN)

        # Get wallets
        sender_wallet = Wallet.objects.select_for_update().get(user=sender)
        recipient_wallet = Wallet.objects.select_for_update().get(user=recipient)

        # Check sufficient balance
        if sender_wallet.balance < amount:
            return Response({
                'status': 'error',
                'message': 'Insufficient balance'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Perform transfer
        sender_wallet.deduct_balance(amount)
        recipient_wallet.add_balance(amount)

        # Create transaction records
        Transaction.objects.create(
            user=sender,
            amount=amount,
            type='transfer',
            category='other',
            status='completed',
            description=f"Transfer to {recipient.email}: {description}",
            reference_id=str(recipient.id)
        )

        Transaction.objects.create(
            user=recipient,
            amount=amount,
            type='transfer',
            category='other',
            status='completed',
            description=f"Transfer from {sender.email}: {description}",
            reference_id=str(sender.id)
        )

        # Send notification
        NotificationService.send_notification(
            user=recipient,
            title="Money Received!",
            body=f"You've received {amount} {sender_wallet.currency} from your parent",
            notification_type='transfer'
        )

        # Award points for receiving allowance (gamification)
        PointCalculatorService.award_points(recipient, 10, 'transfer_received')

        return Response({
            'status': 'success',
            'message': 'Transfer completed successfully',
            'data': {
                'sender_balance': sender_wallet.balance,
                'recipient_balance': recipient_wallet.balance
            }
        })


class SpendingLimitViewSet(viewsets.ModelViewSet):
    """Manage spending limits for children"""
    serializer_class = SpendingLimitSerializer
    permission_classes = [IsAuthenticated, IsParent]

    def get_queryset(self):
        return SpendingLimit.objects.filter(parent=self.request.user)

    def create(self, request):
        serializer = UpdateSpendingLimitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        child_id = request.data.get('child_id')
        if not child_id:
            return Response({
                'status': 'error',
                'message': 'child_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            child = User.objects.get(id=child_id, role='student')
            if child.student_profile.parent_id != request.user.id:
                raise ValueError
        except (User.DoesNotExist, ValueError):
            return Response({
                'status': 'error',
                'message': 'Child not found or not associated with you'
            }, status=status.HTTP_404_NOT_FOUND)

        limit, created = SpendingLimit.objects.update_or_create(
            child=child,
            parent=request.user,
            category=serializer.validated_data['category'],
            defaults={
                'daily_limit': serializer.validated_data['daily_limit'],
                'weekly_limit': serializer.validated_data['weekly_limit'],
                'monthly_limit': serializer.validated_data['monthly_limit'],
                'is_enabled': serializer.validated_data['is_enabled']
            }
        )

        response_serializer = SpendingLimitSerializer(limit)
        return Response({
            'status': 'success',
            'message': 'Spending limit updated successfully',
            'data': response_serializer.data
        })


class MoneyRequestViewSet(viewsets.ModelViewSet):
    """Handle money requests from students to parents"""
    serializer_class = MoneyRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent':
            return MoneyRequest.objects.filter(parent=user)
        else:
            return MoneyRequest.objects.filter(child=user)

    def create(self, request):
        if request.user.role != 'student':
            return Response({
                'status': 'error',
                'message': 'Only students can create money requests'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = CreateMoneyRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        parent = request.user.student_profile.parent

        money_request = MoneyRequest.objects.create(
            child=request.user,
            parent=parent,
            amount=serializer.validated_data['amount'],
            reason=serializer.validated_data['reason']
        )

        # Send notification to parent
        NotificationService.send_notification(
            user=parent,
            title="Money Request",
            body=f"{request.user.profile.full_name} requests {money_request.amount} for: {money_request.reason}",
            notification_type='money_request',
            metadata={'request_id': str(money_request.id)}
        )

        response_serializer = MoneyRequestSerializer(money_request)
        return Response({
            'status': 'success',
            'message': 'Money request sent successfully',
            'data': response_serializer.data
        }, status=status.HTTP_201_CREATED)


class ApproveMoneyRequestView(APIView):
    """Approve or decline money requests"""
    permission_classes = [IsAuthenticated, IsParent]

    @transaction.atomic
    def post(self, request):
        serializer = ApproveMoneyRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        request_id = serializer.validated_data['request_id']
        action = serializer.validated_data['action']
        parent_notes = serializer.validated_data.get('parent_notes', '')

        try:
            money_request = MoneyRequest.objects.select_for_update().get(
                id=request_id,
                parent=request.user,
                status='pending'
            )
        except MoneyRequest.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Money request not found or already processed'
            }, status=status.HTTP_404_NOT_FOUND)

        if action == 'approve':
            # Check parent balance
            parent_wallet = Wallet.objects.select_for_update().get(user=request.user)

            if parent_wallet.balance < money_request.amount:
                return Response({
                    'status': 'error',
                    'message': 'Insufficient balance to approve this request'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Transfer funds
            parent_wallet.deduct_balance(money_request.amount)
            child_wallet = Wallet.objects.get(user=money_request.child)
            child_wallet.add_balance(money_request.amount)

            # Create transactions
            Transaction.objects.create(
                user=request.user,
                amount=money_request.amount,
                type='transfer',
                category='other',
                status='completed',
                description=f"Approved money request: {money_request.reason}",
                reference_id=str(money_request.id)
            )

            Transaction.objects.create(
                user=money_request.child,
                amount=money_request.amount,
                type='transfer',
                category='other',
                status='completed',
                description=f"Request approved: {money_request.reason}",
                reference_id=str(money_request.id)
            )

            money_request.status = 'approved'
            message = "Money request approved"

            # Send notification to child
            NotificationService.send_notification(
                user=money_request.child,
                title="Request Approved!",
                body=f"Your request for {money_request.amount} has been approved",
                notification_type='money_request_approved'
            )

        else:
            money_request.status = 'declined'
            message = "Money request declined"

            # Send notification to child
            NotificationService.send_notification(
                user=money_request.child,
                title="Request Declined",
                body=f"Your request for {money_request.amount} was declined",
                notification_type='money_request_declined'
            )

        money_request.parent_notes = parent_notes
        money_request.responded_at = timezone.now()
        money_request.save()

        return Response({
            'status': 'success',
            'message': message
        })


class SpendingAnalyticsView(APIView):
    """Get spending analytics for parent dashboard"""
    permission_classes = [IsAuthenticated, IsParent]

    def get(self, request):
        from django.db.models import Sum, Count
        from datetime import timedelta

        child_id = request.query_params.get('child_id')
        period = request.query_params.get('period', 'month')  # week, month, year

        if child_id:
            try:
                child = User.objects.get(id=child_id, role='student')
                if child.student_profile.parent_id != request.user.id:
                    return Response({'error': 'Not your child'}, status=403)
                users = [child]
            except User.DoesNotExist:
                return Response({'error': 'Child not found'}, status=404)
        else:
            users = list(request.user.children.all())

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

        # Get transactions
        transactions = Transaction.objects.filter(
            user__in=users,
            type='payment',
            status='completed',
            created_at__gte=start_date
        )

        # Category breakdown
        category_breakdown = transactions.values('category').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')

        # Daily spending
        daily_spending = transactions.values('created_at__date').annotate(
            total=Sum('amount')
        ).order_by('created_at__date')

        # Top merchants
        top_merchants = transactions.values('merchant_name').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).exclude(merchant_name__isnull=True).order_by('-total')[:10]

        # Total spent
        total_spent = transactions.aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            'status': 'success',
            'data': {
                'period': period,
                'total_spent': total_spent,
                'category_breakdown': list(category_breakdown),
                'daily_spending': list(daily_spending),
                'top_merchants': list(top_merchants),
                'transaction_count': transactions.count()
            }
        })