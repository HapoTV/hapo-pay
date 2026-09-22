# apps/wallets/student_views.py
"""
Wallets App — Student Views
===========================
Endpoints scoped to the authenticated student:
- View own wallet
- List own transactions
- Create / list money requests
- View own spending limits
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import Wallet, Transaction, SpendingLimit, MoneyRequest
from .serializers import (
    WalletSerializer, TransactionSerializer, SpendingLimitSerializer,
    MoneyRequestSerializer, CreateMoneyRequestSerializer,
)
from core.permissions import IsStudent
from apps.notifications.services import NotificationService
from apps.accounts.models import StudentProfile
import logging

logger = logging.getLogger(__name__)


class StudentWalletView(APIView):
    """
    GET /student/wallet/
    Returns the authenticated student's wallet.
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        try:
            wallet = Wallet.objects.get(user=request.user)
        except Wallet.DoesNotExist:
            logger.warning(f"Wallet missing for student {request.user.email}")
            return Response(
                {'status': 'error', 'message': 'Wallet not found'},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            logger.exception(f"StudentWalletView error: {e}")
            return Response(
                {'status': 'error', 'message': 'Could not fetch wallet'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            serializer = WalletSerializer(wallet)
            return Response({'status': 'success', 'data': serializer.data})
        except Exception as e:
            logger.exception(f"StudentWalletView serialization error: {e}")
            return Response(
                {'status': 'error', 'message': 'Serialization error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class StudentTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /student/transactions/        — list own transactions
    GET /student/transactions/{id}/   — retrieve single transaction

    Supports query params: type, category, start_date, end_date
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        """Return the student's transactions, filtered by query params."""
        try:
            queryset = Transaction.objects.filter(user=self.request.user)

            transaction_type = self.request.query_params.get('type')
            category = self.request.query_params.get('category')
            start_date = self.request.query_params.get('start_date')
            end_date = self.request.query_params.get('end_date')

            if transaction_type:
                queryset = queryset.filter(type=transaction_type)
            if category:
                queryset = queryset.filter(category=category)
            if start_date:
                queryset = queryset.filter(created_at__gte=start_date)
            if end_date:
                queryset = queryset.filter(created_at__lte=end_date)

            return queryset
        except Exception as e:
            logger.exception(f"StudentTransactionViewSet.get_queryset error: {e}")
            # Return empty queryset on failure
            return Transaction.objects.none()


class StudentMoneyRequestViewSet(viewsets.ModelViewSet):
    """
    GET  /student/money-requests/      — list own requests
    POST /student/money-requests/      — create a new request
    GET  /student/money-requests/{id}/ — retrieve single request
    """
    serializer_class = MoneyRequestSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        """Only return requests created by the current student."""
        try:
            return MoneyRequest.objects.filter(child=self.request.user)
        except Exception as e:
            logger.exception(f"StudentMoneyRequestViewSet.get_queryset error: {e}")
            return MoneyRequest.objects.none()

    def create(self, request):
        """Create a new money request and notify the parent."""
        try:
            serializer = CreateMoneyRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            try:
                parent = request.user.student_profile.parent
            except StudentProfile.DoesNotExist:
                return Response(
                    {'status': 'error', 'message': 'No parent linked to your account'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not parent:
                return Response(
                    {'status': 'error', 'message': 'No parent linked to your account'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            money_request = MoneyRequest.objects.create(
                child=request.user,
                parent=parent,
                amount=serializer.validated_data['amount'],
                reason=serializer.validated_data['reason'],
            )

            # Notify parent (best-effort)
            try:
                NotificationService.send_notification(
                    user=parent,
                    title="Money Request",
                    body=(
                        f"{request.user.profile.full_name} requests "
                        f"R{money_request.amount} for: {money_request.reason}"
                    ),
                    notification_type='money_request',
                    metadata={'request_id': str(money_request.id)},
                )
            except Exception as e:
                logger.warning(f"Money request notification failed: {e}")

            return Response(
                {
                    'status': 'success',
                    'message': 'Money request sent successfully',
                    'data': MoneyRequestSerializer(money_request).data,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            logger.exception(f"StudentMoneyRequestViewSet.create error: {e}")
            return Response(
                {'status': 'error', 'message': 'Could not create money request'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class StudentSpendingLimitsView(APIView):
    """
    GET /student/spending-limits/
    Returns the student's currently enabled spending limits.
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        try:
            limits = SpendingLimit.objects.filter(child=request.user, is_enabled=True)
            serializer = SpendingLimitSerializer(limits, many=True)
            return Response({'status': 'success', 'data': serializer.data})
        except Exception as e:
            logger.exception(f"StudentSpendingLimitsView error: {e}")
            return Response(
                {'status': 'error', 'message': 'Could not fetch spending limits'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )