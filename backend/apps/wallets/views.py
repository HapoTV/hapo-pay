# apps/wallets/views.py
from rest_framework import viewsets, status
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
    CreateMoneyRequestSerializer, ApproveMoneyRequestSerializer,
    AddChildSerializer, ChildSummarySerializer, FreezeAccountSerializer,
)
from core.permissions import IsParent, IsStudent
from apps.notifications.services import NotificationService
from apps.gamification.services import PointCalculatorService
from apps.accounts.models import User, Profile, StudentProfile, ParentProfile
from .services import WalletService, CategoryService
import logging

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Wallet
# ---------------------------------------------------------------------------

class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /wallet/        — list wallets visible to the authenticated user
    GET /wallet/{id}/   — retrieve a single wallet
    """
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent':
            # Parents see their own wallet and all children's wallets
            children_ids = user.children.values_list('user_id', flat=True)
            return Wallet.objects.filter(user__in=[user.id, *children_ids])
        # Students see only their own wallet
        return Wallet.objects.filter(user=user)


# ---------------------------------------------------------------------------
# Transactions
# ---------------------------------------------------------------------------

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /transactions/        — list transactions
    GET /transactions/{id}/   — retrieve a single transaction
    Supports query params: type, category, start_date, end_date
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent':
            children_ids = user.children.values_list('user_id', flat=True)
            return Transaction.objects.filter(user__in=[user.id, *children_ids])
        return Transaction.objects.filter(user=user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

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


# ---------------------------------------------------------------------------
# Children management (parent only)
# ---------------------------------------------------------------------------

class ChildrenView(APIView):
    """
    GET  /children/  — list all children linked to the parent
    POST /children/  — add a new child (creates User + StudentProfile + Wallet)
    """
    permission_classes = [IsAuthenticated, IsParent]

    def get(self, request):
        children = User.objects.filter(
            student_profile__parent=request.user
        ).select_related('profile', 'student_profile', 'wallet')

        serializer = ChildSummarySerializer(children, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        })

    @transaction.atomic
    def post(self, request):
        serializer = AddChildSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Create child User
        child = User.objects.create_user(
            email=data['email'],
            password=User.objects.make_random_password(),
            role='student',
        )

        # Create shared Profile
        Profile.objects.create(
            user=child,
            full_name=data['full_name'],
        )

        # Create StudentProfile linked to this parent
        StudentProfile.objects.create(
            user=child,
            parent=request.user,
            school_name=data.get('school_name', ''),
            grade=data.get('grade'),
            weekly_allowance=data.get('weekly_allowance', 0),
        )

        # Create Wallet for the child
        Wallet.objects.create(user=child, currency='ZAR')

        return Response({
            'status': 'success',
            'message': 'Child added successfully',
            'data': {
                'id': str(child.id),
                'email': child.email,
                'full_name': data['full_name'],
            }
        }, status=status.HTTP_201_CREATED)


class ChildDetailView(APIView):
    """
    GET    /children/{child_id}/  — get child details
    PUT    /children/{child_id}/  — update child settings
    DELETE /children/{child_id}/  — remove child link
    """
    permission_classes = [IsAuthenticated, IsParent]

    def _get_child(self, child_id, parent):
        try:
            child = User.objects.get(id=child_id, role='student')
            if child.student_profile.parent_id != parent.id:
                return None
            return child
        except (User.DoesNotExist, StudentProfile.DoesNotExist):
            return None

    def get(self, request, child_id):
        child = self._get_child(child_id, request.user)
        if not child:
            return Response({'status': 'error', 'message': 'Child not found'},
                            status=status.HTTP_404_NOT_FOUND)

        serializer = ChildSummarySerializer(child)
        return Response({'status': 'success', 'data': serializer.data})

    def put(self, request, child_id):
        child = self._get_child(child_id, request.user)
        if not child:
            return Response({'status': 'error', 'message': 'Child not found'},
                            status=status.HTTP_404_NOT_FOUND)

        sp = child.student_profile
        sp.school_name = request.data.get('school_name', sp.school_name)
        sp.grade = request.data.get('grade', sp.grade)
        sp.weekly_allowance = request.data.get('weekly_allowance', sp.weekly_allowance)
        sp.save()

        if 'full_name' in request.data:
            child.profile.full_name = request.data['full_name']
            child.profile.save()

        return Response({'status': 'success', 'message': 'Child updated successfully'})

    def delete(self, request, child_id):
        child = self._get_child(child_id, request.user)
        if not child:
            return Response({'status': 'error', 'message': 'Child not found'},
                            status=status.HTTP_404_NOT_FOUND)

        # Unlink from parent rather than deleting the account
        sp = child.student_profile
        sp.parent = None
        sp.save()

        return Response({'status': 'success', 'message': 'Child removed successfully'})


class ChildTransactionsView(APIView):
    """
    GET /children/{child_id}/transactions/  — get child's transaction history
    """
    permission_classes = [IsAuthenticated, IsParent]

    def get(self, request, child_id):
        try:
            child = User.objects.get(id=child_id, role='student')
            if child.student_profile.parent_id != request.user.id:
                return Response({'status': 'error', 'message': 'Not your child'},
                                status=status.HTTP_403_FORBIDDEN)
        except (User.DoesNotExist, StudentProfile.DoesNotExist):
            return Response({'status': 'error', 'message': 'Child not found'},
                            status=status.HTTP_404_NOT_FOUND)

        queryset = Transaction.objects.filter(user=child)

        # Filters
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

        serializer = TransactionSerializer(queryset, many=True)
        return Response({'status': 'success', 'data': serializer.data})


# ---------------------------------------------------------------------------
# Account freeze / unfreeze (parent only)
# ---------------------------------------------------------------------------

class FreezeAccountView(APIView):
    """POST /freeze-account/{child_id}/"""
    permission_classes = [IsAuthenticated, IsParent]

    def post(self, request, child_id):
        serializer = FreezeAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            child = User.objects.get(id=child_id, role='student')
            if child.student_profile.parent_id != request.user.id:
                return Response({'status': 'error', 'message': 'Not your child'},
                                status=status.HTTP_403_FORBIDDEN)
        except (User.DoesNotExist, StudentProfile.DoesNotExist):
            return Response({'status': 'error', 'message': 'Child not found'},
                            status=status.HTTP_404_NOT_FOUND)

        sp = child.student_profile
        sp.is_account_frozen = True
        sp.freeze_reason = serializer.validated_data['freeze_reason']
        sp.save()

        NotificationService.send_notification(
            user=child,
            title="Account Frozen",
            body="Your account has been temporarily frozen. Contact your parent.",
            notification_type='alert'
        )

        return Response({'status': 'success', 'message': 'Account frozen successfully'})


class UnfreezeAccountView(APIView):
    """POST /unfreeze-account/{child_id}/"""
    permission_classes = [IsAuthenticated, IsParent]

    def post(self, request, child_id):
        try:
            child = User.objects.get(id=child_id, role='student')
            if child.student_profile.parent_id != request.user.id:
                return Response({'status': 'error', 'message': 'Not your child'},
                                status=status.HTTP_403_FORBIDDEN)
        except (User.DoesNotExist, StudentProfile.DoesNotExist):
            return Response({'status': 'error', 'message': 'Child not found'},
                            status=status.HTTP_404_NOT_FOUND)

        sp = child.student_profile
        sp.is_account_frozen = False
        sp.freeze_reason = ''
        sp.save()

        NotificationService.send_notification(
            user=child,
            title="Account Unfrozen",
            body="Your account has been reactivated.",
            notification_type='alert'
        )

        return Response({'status': 'success', 'message': 'Account unfrozen successfully'})


# ---------------------------------------------------------------------------
# Fund transfer (parent → child)
# ---------------------------------------------------------------------------

class TransferFundsView(APIView):
    """POST /transfer/"""
    permission_classes = [IsAuthenticated, IsParent]

    @transaction.atomic
    def post(self, request):
        serializer = TransferFundsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        sender = request.user        recipient_id = serializer.validated_data['recipient_id']
        amount = serializer.validated_data['amount']
        description = serializer.validated_data.get('description', 'Fund transfer')

        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
            return Response({'status': 'error', 'message': 'Recipient not found'},
                            status=status.HTTP_404_NOT_FOUND)

        # Verify recipient is a child of this parent
        try:
            if recipient.role != 'student' or recipient.student_profile.parent_id != sender.id:
                return Response(
                    {'status': 'error', 'message': 'You can only transfer to your own children'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except StudentProfile.DoesNotExist:
            return Response({'status': 'error', 'message': 'Recipient has no student profile'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Check account is not frozen
        if recipient.student_profile.is_account_frozen:
            return Response({'status': 'error', 'message': 'Child account is frozen'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Delegate to WalletService — all locking happens there
        try:
            WalletService.transfer(
                sender=sender,
                recipient=recipient,
                amount=amount,
                description=description,
            )
        except ValueError as e:
            return Response({'status': 'error', 'message': str(e)},
                            status=status.HTTP_400_BAD_REQUEST)

        PointCalculatorService.award_points(recipient, 10, 'transfer_received')

        return Response({
            'status': 'success',
            'message': 'Transfer completed successfully',
            'data': {
                'sender_balance': WalletService.get_balance(sender),
                'recipient_balance': WalletService.get_balance(recipient),
            }
        })


# ---------------------------------------------------------------------------
# Spending limits (parent only)
# ---------------------------------------------------------------------------

class SpendingLimitViewSet(viewsets.ModelViewSet):
    """CRUD /children/limits/"""
    serializer_class = SpendingLimitSerializer
    permission_classes = [IsAuthenticated, IsParent]

    def get_queryset(self):
        return SpendingLimit.objects.filter(parent=self.request.user)

    def create(self, request):
        serializer = UpdateSpendingLimitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        child_id = request.data.get('child_id')
        if not child_id:
            return Response({'status': 'error', 'message': 'child_id is required'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            child = User.objects.get(id=child_id, role='student')
            if child.student_profile.parent_id != request.user.id:
                raise ValueError
        except (User.DoesNotExist, ValueError, StudentProfile.DoesNotExist):
            return Response(
                {'status': 'error', 'message': 'Child not found or not associated with you'},
                status=status.HTTP_404_NOT_FOUND
            )

        limit, _ = SpendingLimit.objects.update_or_create(
            child=child,
            parent=request.user,
            category=serializer.validated_data['category'],
            defaults={
                'daily_limit': serializer.validated_data['daily_limit'],
                'weekly_limit': serializer.validated_data['weekly_limit'],
                'monthly_limit': serializer.validated_data['monthly_limit'],
                'is_enabled': serializer.validated_data['is_enabled'],
            }
        )

        return Response({
            'status': 'success',
            'message': 'Spending limit updated successfully',
            'data': SpendingLimitSerializer(limit).data
        })


# ---------------------------------------------------------------------------
# Money requests
# ---------------------------------------------------------------------------

class MoneyRequestViewSet(viewsets.ModelViewSet):
    """CRUD /money-requests/"""
    serializer_class = MoneyRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent':
            return MoneyRequest.objects.filter(parent=user)
        return MoneyRequest.objects.filter(child=user)

    def create(self, request):
        if request.user.role != 'student':
            return Response({'status': 'error', 'message': 'Only students can create money requests'},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = CreateMoneyRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            parent = request.user.student_profile.parent
        except StudentProfile.DoesNotExist:
            return Response({'status': 'error', 'message': 'No parent linked to your account'},
                            status=status.HTTP_400_BAD_REQUEST)

        if not parent:
            return Response({'status': 'error', 'message': 'No parent linked to your account'},
                            status=status.HTTP_400_BAD_REQUEST)

        money_request = MoneyRequest.objects.create(
            child=request.user,
            parent=parent,
            amount=serializer.validated_data['amount'],
            reason=serializer.validated_data['reason'],
        )

        NotificationService.send_notification(
            user=parent,
            title="Money Request",
            body=f"{request.user.profile.full_name} requests R{money_request.amount} for: {money_request.reason}",
            notification_type='money_request',
            metadata={'request_id': str(money_request.id)}
        )

        return Response({
            'status': 'success',
            'message': 'Money request sent successfully',
            'data': MoneyRequestSerializer(money_request).data
        }, status=status.HTTP_201_CREATED)


class ApproveMoneyRequestView(APIView):
    """POST /approve-request/"""
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
            return Response(
                {'status': 'error', 'message': 'Money request not found or already processed'},
                status=status.HTTP_404_NOT_FOUND
            )

        if action == 'approve':
            try:
                WalletService.transfer(
                    sender=request.user,
                    recipient=money_request.child,
                    amount=money_request.amount,
                    description=f"Approved money request: {money_request.reason}",
                )
            except ValueError as e:
                return Response({'status': 'error', 'message': str(e)},
                                status=status.HTTP_400_BAD_REQUEST)

            money_request.status = 'approved'
            message = "Money request approved"

            NotificationService.send_notification(
                user=money_request.child,
                title="Request Approved!",
                body=f"Your request for R{money_request.amount} has been approved",
                notification_type='money_request_approved'
            )
        else:
            money_request.status = 'declined'
            message = "Money request declined"

            NotificationService.send_notification(
                user=money_request.child,
                title="Request Declined",
                body=f"Your request for R{money_request.amount} was declined",
                notification_type='money_request_declined'
            )

        money_request.parent_notes = parent_notes
        money_request.responded_at = timezone.now()
        money_request.save()

        return Response({'status': 'success', 'message': message})


# ---------------------------------------------------------------------------
# Spending analytics (parent only)
# ---------------------------------------------------------------------------

class SpendingAnalyticsView(APIView):
    """GET /analytics/"""
    permission_classes = [IsAuthenticated, IsParent]

    def get(self, request):
        from django.db.models import Sum, Count
        from datetime import timedelta

        child_id = request.query_params.get('child_id')
        period = request.query_params.get('period', 'month')

        if child_id:
            try:
                child = User.objects.get(id=child_id, role='student')
                if child.student_profile.parent_id != request.user.id:
                    return Response({'error': 'Not your child'}, status=403)
                users = [child]
            except (User.DoesNotExist, StudentProfile.DoesNotExist):
                return Response({'error': 'Child not found'}, status=404)
        else:
            # Correctly get User objects from children relation
            children_ids = request.user.children.values_list('user_id', flat=True)
            users = list(User.objects.filter(id__in=children_ids))

        now = timezone.now()
        period_map = {'week': 7, 'month': 30, 'year': 365}
        start_date = now - timedelta(days=period_map.get(period, 30))

        transactions = Transaction.objects.filter(
            user__in=users,
            type='payment',
            status='completed',
            created_at__gte=start_date
        )

        category_breakdown = transactions.values('category').annotate(
            total=Sum('amount'), count=Count('id')
        ).order_by('-total')

        daily_spending = transactions.values('created_at__date').annotate(
            total=Sum('amount')
        ).order_by('created_at__date')

        top_merchants = transactions.values('merchant_name').annotate(
            total=Sum('amount'), count=Count('id')
        ).exclude(merchant_name__isnull=True).order_by('-total')[:10]

        total_spent = transactions.aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            'status': 'success',
            'data': {
                'period': period,
                'total_spent': total_spent,
                'category_breakdown': list(category_breakdown),
                'daily_spending': list(daily_spending),
                'top_merchants': list(top_merchants),
                'transaction_count': transactions.count(),
            }
        })


# ---------------------------------------------------------------------------
# Categories (utility endpoint)
# ---------------------------------------------------------------------------

class TransactionCategoriesView(APIView):
    """
    GET /categories/
    Returns the list of valid transaction categories.
    Frontend uses this to populate dropdowns when creating a payment.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = [
            {'value': cat, 'label': cat.replace('_', ' ').title()}
            for cat in sorted(CategoryService.VALID_CATEGORIES)
        ]
        return Response({'status': 'success', 'data': categories})
