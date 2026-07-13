# apps/wallets/views.py
<<<<<<< HEAD
from rest_framework import viewsets, status
=======
from rest_framework import viewsets, generics, status
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
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
<<<<<<< HEAD
    CreateMoneyRequestSerializer, ApproveMoneyRequestSerializer,
    AddChildSerializer, ChildSummarySerializer, FreezeAccountSerializer,
)
from core.permissions import IsParent, IsStudent
from apps.notifications.services import NotificationService
from apps.gamification.services import PointCalculatorService
from apps.accounts.models import User, Profile, StudentProfile, ParentProfile
from .services import WalletService, CategoryService
=======
    CreateMoneyRequestSerializer, ApproveMoneyRequestSerializer
)
from core.permissions import IsParent, IsStudent, IsOwnAccount
from core.supabase_client import supabase
from apps.notifications.services import NotificationService
from apps.gamification.services import PointCalculatorService
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
import logging

logger = logging.getLogger(__name__)


<<<<<<< HEAD
# ---------------------------------------------------------------------------
# Wallet
# ---------------------------------------------------------------------------

class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /wallet/        — list wallets visible to the authenticated user
    GET /wallet/{id}/   — retrieve a single wallet
    """
=======
class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing wallet information"""
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent':
<<<<<<< HEAD
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
=======
            # Parents can see their own wallet and children's wallets
            children_ids = user.children.values_list('id', flat=True)
            return Wallet.objects.filter(user__in=[user.id] + list(children_ids))
        else:
            # Students see only their own wallet
            return Wallet.objects.filter(user=user)


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing transactions"""
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent':
<<<<<<< HEAD
            children_ids = user.children.values_list('user_id', flat=True)
            return Transaction.objects.filter(user__in=[user.id, *children_ids])
        return Transaction.objects.filter(user=user)
=======
            # Parents can see their own transactions and children's transactions
            children_ids = user.children.values_list('id', flat=True)
            return Transaction.objects.filter(user__in=[user.id] + list(children_ids))
        else:
            # Students see only their own transactions
            return Transaction.objects.filter(user=user)
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

<<<<<<< HEAD
=======
        # Apply filters
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
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


<<<<<<< HEAD
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
=======
class TransferFundsView(APIView):
    """Handle fund transfers between parent and child"""
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
    permission_classes = [IsAuthenticated, IsParent]

    @transaction.atomic
    def post(self, request):
        serializer = TransferFundsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

<<<<<<< HEAD
        sender = request.user        recipient_id = serializer.validated_data['recipient_id']
=======
        sender = request.user
        recipient_id = serializer.validated_data['recipient_id']
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
        amount = serializer.validated_data['amount']
        description = serializer.validated_data.get('description', 'Fund transfer')

        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
<<<<<<< HEAD
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

=======
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
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
        PointCalculatorService.award_points(recipient, 10, 'transfer_received')

        return Response({
            'status': 'success',
            'message': 'Transfer completed successfully',
            'data': {
<<<<<<< HEAD
                'sender_balance': WalletService.get_balance(sender),
                'recipient_balance': WalletService.get_balance(recipient),
=======
                'sender_balance': sender_wallet.balance,
                'recipient_balance': recipient_wallet.balance
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
            }
        })


<<<<<<< HEAD
# ---------------------------------------------------------------------------
# Spending limits (parent only)
# ---------------------------------------------------------------------------

class SpendingLimitViewSet(viewsets.ModelViewSet):
    """CRUD /children/limits/"""
=======
class SpendingLimitViewSet(viewsets.ModelViewSet):
    """Manage spending limits for children"""
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
    serializer_class = SpendingLimitSerializer
    permission_classes = [IsAuthenticated, IsParent]

    def get_queryset(self):
        return SpendingLimit.objects.filter(parent=self.request.user)

    def create(self, request):
        serializer = UpdateSpendingLimitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        child_id = request.data.get('child_id')
        if not child_id:
<<<<<<< HEAD
            return Response({'status': 'error', 'message': 'child_id is required'},
                            status=status.HTTP_400_BAD_REQUEST)
=======
            return Response({
                'status': 'error',
                'message': 'child_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a

        try:
            child = User.objects.get(id=child_id, role='student')
            if child.student_profile.parent_id != request.user.id:
                raise ValueError
<<<<<<< HEAD
        except (User.DoesNotExist, ValueError, StudentProfile.DoesNotExist):
            return Response(
                {'status': 'error', 'message': 'Child not found or not associated with you'},
                status=status.HTTP_404_NOT_FOUND
            )

        limit, _ = SpendingLimit.objects.update_or_create(
=======
        except (User.DoesNotExist, ValueError):
            return Response({
                'status': 'error',
                'message': 'Child not found or not associated with you'
            }, status=status.HTTP_404_NOT_FOUND)

        limit, created = SpendingLimit.objects.update_or_create(
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
            child=child,
            parent=request.user,
            category=serializer.validated_data['category'],
            defaults={
                'daily_limit': serializer.validated_data['daily_limit'],
                'weekly_limit': serializer.validated_data['weekly_limit'],
                'monthly_limit': serializer.validated_data['monthly_limit'],
<<<<<<< HEAD
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
=======
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
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
    serializer_class = MoneyRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent':
            return MoneyRequest.objects.filter(parent=user)
<<<<<<< HEAD
        return MoneyRequest.objects.filter(child=user)

    def create(self, request):
        if request.user.role != 'student':
            return Response({'status': 'error', 'message': 'Only students can create money requests'},
                            status=status.HTTP_403_FORBIDDEN)
=======
        else:
            return MoneyRequest.objects.filter(child=user)

    def create(self, request):
        if request.user.role != 'student':
            return Response({
                'status': 'error',
                'message': 'Only students can create money requests'
            }, status=status.HTTP_403_FORBIDDEN)
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a

        serializer = CreateMoneyRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

<<<<<<< HEAD
        try:
            parent = request.user.student_profile.parent
        except StudentProfile.DoesNotExist:
            return Response({'status': 'error', 'message': 'No parent linked to your account'},
                            status=status.HTTP_400_BAD_REQUEST)

        if not parent:
            return Response({'status': 'error', 'message': 'No parent linked to your account'},
                            status=status.HTTP_400_BAD_REQUEST)
=======
        parent = request.user.student_profile.parent
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a

        money_request = MoneyRequest.objects.create(
            child=request.user,
            parent=parent,
            amount=serializer.validated_data['amount'],
<<<<<<< HEAD
            reason=serializer.validated_data['reason'],
        )

        NotificationService.send_notification(
            user=parent,
            title="Money Request",
            body=f"{request.user.profile.full_name} requests R{money_request.amount} for: {money_request.reason}",
=======
            reason=serializer.validated_data['reason']
        )

        # Send notification to parent
        NotificationService.send_notification(
            user=parent,
            title="Money Request",
            body=f"{request.user.profile.full_name} requests {money_request.amount} for: {money_request.reason}",
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
            notification_type='money_request',
            metadata={'request_id': str(money_request.id)}
        )

<<<<<<< HEAD
        return Response({
            'status': 'success',
            'message': 'Money request sent successfully',
            'data': MoneyRequestSerializer(money_request).data
=======
        response_serializer = MoneyRequestSerializer(money_request)
        return Response({
            'status': 'success',
            'message': 'Money request sent successfully',
            'data': response_serializer.data
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
        }, status=status.HTTP_201_CREATED)


class ApproveMoneyRequestView(APIView):
<<<<<<< HEAD
    """POST /approve-request/"""
=======
    """Approve or decline money requests"""
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a

            money_request.status = 'approved'
            message = "Money request approved"

<<<<<<< HEAD
            NotificationService.send_notification(
                user=money_request.child,
                title="Request Approved!",
                body=f"Your request for R{money_request.amount} has been approved",
                notification_type='money_request_approved'
            )
=======
            # Send notification to child
            NotificationService.send_notification(
                user=money_request.child,
                title="Request Approved!",
                body=f"Your request for {money_request.amount} has been approved",
                notification_type='money_request_approved'
            )

>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
        else:
            money_request.status = 'declined'
            message = "Money request declined"

<<<<<<< HEAD
            NotificationService.send_notification(
                user=money_request.child,
                title="Request Declined",
                body=f"Your request for R{money_request.amount} was declined",
=======
            # Send notification to child
            NotificationService.send_notification(
                user=money_request.child,
                title="Request Declined",
                body=f"Your request for {money_request.amount} was declined",
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
                notification_type='money_request_declined'
            )

        money_request.parent_notes = parent_notes
        money_request.responded_at = timezone.now()
        money_request.save()

<<<<<<< HEAD
        return Response({'status': 'success', 'message': message})


# ---------------------------------------------------------------------------
# Spending analytics (parent only)
# ---------------------------------------------------------------------------

class SpendingAnalyticsView(APIView):
    """GET /analytics/"""
=======
        return Response({
            'status': 'success',
            'message': message
        })


class SpendingAnalyticsView(APIView):
    """Get spending analytics for parent dashboard"""
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
    permission_classes = [IsAuthenticated, IsParent]

    def get(self, request):
        from django.db.models import Sum, Count
        from datetime import timedelta

        child_id = request.query_params.get('child_id')
<<<<<<< HEAD
        period = request.query_params.get('period', 'month')
=======
        period = request.query_params.get('period', 'month')  # week, month, year
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a

        if child_id:
            try:
                child = User.objects.get(id=child_id, role='student')
                if child.student_profile.parent_id != request.user.id:
                    return Response({'error': 'Not your child'}, status=403)
                users = [child]
<<<<<<< HEAD
            except (User.DoesNotExist, StudentProfile.DoesNotExist):
                return Response({'error': 'Child not found'}, status=404)
        else:
            # Correctly get User objects from children relation
            children_ids = request.user.children.values_list('user_id', flat=True)
            users = list(User.objects.filter(id__in=children_ids))

        now = timezone.now()
        period_map = {'week': 7, 'month': 30, 'year': 365}
        start_date = now - timedelta(days=period_map.get(period, 30))

=======
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
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
        transactions = Transaction.objects.filter(
            user__in=users,
            type='payment',
            status='completed',
            created_at__gte=start_date
        )

<<<<<<< HEAD
        category_breakdown = transactions.values('category').annotate(
            total=Sum('amount'), count=Count('id')
        ).order_by('-total')

=======
        # Category breakdown
        category_breakdown = transactions.values('category').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')

        # Daily spending
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
        daily_spending = transactions.values('created_at__date').annotate(
            total=Sum('amount')
        ).order_by('created_at__date')

<<<<<<< HEAD
        top_merchants = transactions.values('merchant_name').annotate(
            total=Sum('amount'), count=Count('id')
        ).exclude(merchant_name__isnull=True).order_by('-total')[:10]

=======
        # Top merchants
        top_merchants = transactions.values('merchant_name').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).exclude(merchant_name__isnull=True).order_by('-total')[:10]

        # Total spent
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
        total_spent = transactions.aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            'status': 'success',
            'data': {
                'period': period,
                'total_spent': total_spent,
                'category_breakdown': list(category_breakdown),
                'daily_spending': list(daily_spending),
                'top_merchants': list(top_merchants),
<<<<<<< HEAD
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
=======
                'transaction_count': transactions.count()
            }
        })
>>>>>>> 709515cb3e489a1bb965b0fc271ee6100075da4a
