# apps/wallets/student_views.py
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
    """GET /student/wallet/"""
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        try:
            wallet = Wallet.objects.get(user=request.user)
        except Wallet.DoesNotExist:
            return Response({'status': 'error', 'message': 'Wallet not found'},
                            status=status.HTTP_404_NOT_FOUND)

        serializer = WalletSerializer(wallet)
        return Response({'status': 'success', 'data': serializer.data})


class StudentTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /student/transactions/        — list own transactions
    GET /student/transactions/{id}/   — retrieve single transaction
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
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


class StudentMoneyRequestViewSet(viewsets.ModelViewSet):
    """
    GET  /student/money-requests/      — list own requests
    POST /student/money-requests/      — create a new request
    GET  /student/money-requests/{id}/ — retrieve single request
    """
    serializer_class = MoneyRequestSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        return MoneyRequest.objects.filter(child=self.request.user)

    def create(self, request):
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


class StudentSpendingLimitsView(APIView):
    """GET /student/spending-limits/"""
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        limits = SpendingLimit.objects.filter(child=request.user, is_enabled=True)
        serializer = SpendingLimitSerializer(limits, many=True)
        return Response({'status': 'success', 'data': serializer.data})
