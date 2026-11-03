# apps/payments/views.py
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from django.db import transaction
from django.utils import timezone
from django.core.cache import cache
from datetime import timedelta
import qrcode
import base64
from io import BytesIO
import uuid
from .models import Merchant, QRCode, NFCToken, AirtimePurchase, TransportTicket
from .serializers import (
    MerchantSerializer, QRCodeSerializer, NFCTokenSerializer,
    AirtimePurchaseSerializer, TransportTicketSerializer,
    QRPaymentSerializer, NFCPaymentSerializer, AirtimeBuySerializer, TransportBuySerializer,
    GenerateQRCodeSerializer
)
from core.permissions import IsParent, IsStudent, IsAdmin
from apps.wallets.models import Wallet, Transaction
from apps.wallets.services import (
    LimitCheckerService, TransferService, AccountStatusService, AccountFrozen
)
from apps.notifications.services import NotificationService
from apps.gamification.services import PointCalculatorService
from .services import PaymentProcessorService, AirtimeProviderService, TransportAPIService
import logging

logger = logging.getLogger(__name__)


class MerchantViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for merchants"""
    queryset = Merchant.objects.filter(verified=True)
    serializer_class = MerchantSerializer
    # Was AllowAny: the merchant directory (names, categories, physical
    # addresses) was readable by anyone on the internet and usable to
    # fingerprint the platform. No client flow needs it pre-login.
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        return queryset


class QRPaymentView(APIView):
    """Handle QR code payments"""
    permission_classes = [IsAuthenticated, IsStudent]
    # 'payment' scope = 30/min per user: bounds automated abuse of a
    # money-moving endpoint without affecting normal use.
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'payment'

    @transaction.atomic
    def post(self, request):
        serializer = QRPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        qr_id = serializer.validated_data['qr_id']
        student = request.user

        # A frozen account must not be able to spend. Previously nothing
        # consulted is_account_frozen, so the safety control was inert.
        try:
            AccountStatusService.assert_can_spend(student)
        except AccountFrozen as exc:
            return Response({
                'status': 'error',
                'message': str(exc)
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            qr_code = QRCode.objects.select_for_update().get(
                id=qr_id,
                is_used=False,
                expires_at__gt=timezone.now()
            )
        except QRCode.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Invalid or expired QR code'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Merchant verification was never checked here, so a QR code belonging
        # to an unverified (potentially fraudulent) merchant was payable.
        if not qr_code.merchant.verified:
            return Response({
                'status': 'error',
                'message': 'Merchant is not verified'
            }, status=status.HTTP_403_FORBIDDEN)

        # Check spending limit
        if not LimitCheckerService.check_spending_limit(student, qr_code.amount, qr_code.merchant.category):
            return Response({
                'status': 'error',
                'message': 'Transaction exceeds spending limit for this category'
            }, status=status.HTTP_403_FORBIDDEN)

        # Check wallet balance
        wallet = Wallet.objects.select_for_update().get(user=student)

        if wallet.balance < qr_code.amount:
            return Response({
                'status': 'error',
                'message': 'Insufficient balance'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Process payment
        if not wallet.deduct_balance(qr_code.amount):
            return Response({
                'status': 'error',
                'message': 'Insufficient balance'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create transaction
        transaction_obj = Transaction.objects.create(
            user=student,
            amount=qr_code.amount,
            type='payment',
            category=qr_code.merchant.category,
            status='completed',
            description=f"Payment to {qr_code.merchant.name}: {qr_code.description or 'Purchase'}",
            merchant_name=qr_code.merchant.name,
            merchant_id=str(qr_code.merchant.id),
            reference_id=str(qr_code.id)
        )

        # Mark QR as used
        qr_code.is_used = True
        qr_code.used_by = student
        qr_code.used_at = timezone.now()
        qr_code.save()

        # Update spending limits
        LimitCheckerService.update_spent_amounts(student, qr_code.amount, qr_code.merchant.category)

        # Award points for spending (based on responsible spending)
        points = PointCalculatorService.calculate_spending_points(student, qr_code.amount, qr_code.merchant.category)
        PointCalculatorService.award_points(student, points, 'payment')

        # Notify parent, if one is linked. This previously passed parent=None
        # into send_notification for an unlinked student, which raised
        # IntegrityError inside the atomic block and rolled back the whole
        # payment -- an unlinked student could never pay at all.
        student_profile = getattr(student, 'student_profile', None)
        parent = student_profile.parent if student_profile else None
        if parent is not None:
            NotificationService.send_notification(
                user=parent,
                title="Purchase Alert",
                body=f"{student.profile.full_name} spent {qr_code.amount} at {qr_code.merchant.name}",
                notification_type='purchase',
                metadata={
                    'student_id': str(student.id),
                    'amount': str(qr_code.amount),
                    'merchant': qr_code.merchant.name
                }
            )

        return Response({
            'status': 'success',
            'message': 'Payment successful',
            'data': {
                'transaction_id': str(transaction_obj.id),
                'amount': qr_code.amount,
                'merchant': qr_code.merchant.name,
                'balance': wallet.balance,
                'points_earned': points
            }
        })


class NFCPaymentView(APIView):
    """Handle NFC tap-to-pay payments"""
    permission_classes = [IsAuthenticated]
    # 'payment' scope = 30/min per user: bounds automated abuse of a
    # money-moving endpoint without affecting normal use.
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'payment'

    @transaction.atomic
    def post(self, request):
        serializer = NFCPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token_value = serializer.validated_data['token']
        amount = serializer.validated_data.get('amount')

        try:
            nfc_token = NFCToken.objects.select_for_update().get(
                token=token_value,
                is_active=True,
                expires_at__gt=timezone.now()
            )
        except NFCToken.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Invalid or expired NFC token'
            }, status=status.HTTP_400_BAD_REQUEST)

        student = nfc_token.user

        # A frozen account must not be able to spend. Previously nothing
        # consulted is_account_frozen, so the safety control was inert.
        try:
            AccountStatusService.assert_can_spend(student)
        except AccountFrozen as exc:
            return Response({
                'status': 'error',
                'message': str(exc)
            }, status=status.HTTP_403_FORBIDDEN)

        # `amount` is now a validated, strictly-positive Decimal from the
        # serializer. The previous fallback to request.data.get('amount') took
        # the raw body, so a negative or non-numeric amount bypassed every
        # check below.

        # Check wallet balance
        wallet = Wallet.objects.select_for_update().get(user=student)

        if wallet.balance < amount:
            return Response({
                'status': 'error',
                'message': 'Insufficient balance'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Process payment
        if not wallet.deduct_balance(amount):
            return Response({
                'status': 'error',
                'message': 'Insufficient balance'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create transaction
        transaction_obj = Transaction.objects.create(
            user=student,
            amount=amount,
            type='payment',
            category='other',
            status='completed',
            description="NFC Payment",
            reference_id=nfc_token.device_id
        )

        # Update last used
        nfc_token.last_used_at = timezone.now()
        nfc_token.save()

        return Response({
            'status': 'success',
            'message': 'NFC payment successful',
            'data': {
                'transaction_id': str(transaction_obj.id),
                'amount': amount,
                'balance': wallet.balance
            }
        })


class AirtimePurchaseView(APIView):
    """Purchase airtime"""
    permission_classes = [IsAuthenticated]
    # 'payment' scope = 30/min per user: bounds automated abuse of a
    # money-moving endpoint without affecting normal use.
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'payment'

    @transaction.atomic
    def post(self, request):
        serializer = AirtimeBuySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        data = serializer.validated_data

        # A frozen account must not be able to spend. Previously nothing
        # consulted is_account_frozen, so the safety control was inert.
        try:
            AccountStatusService.assert_can_spend(user)
        except AccountFrozen as exc:
            return Response({
                'status': 'error',
                'message': str(exc)
            }, status=status.HTTP_403_FORBIDDEN)

        # Check wallet balance
        wallet = Wallet.objects.select_for_update().get(user=user)

        if wallet.balance < data['amount']:
            return Response({
                'status': 'error',
                'message': 'Insufficient balance'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create airtime purchase record
        purchase = AirtimePurchase.objects.create(
            user=user,
            phone_number=data['phone_number'],
            amount=data['amount'],
            provider=data['provider'],
            status='pending'
        )

        # Process airtime purchase via provider API
        try:
            result = AirtimeProviderService.purchase_airtime(
                phone_number=data['phone_number'],
                amount=data['amount'],
                provider=data['provider'],
                # The purchase row's own id is the idempotency key, so a retry
                # of this exact purchase is collapsed by the provider rather
                # than dispensing airtime (and charging) twice.
                idempotency_key=purchase.id,
            )

            if result['success']:
                # Deduct balance
                if not wallet.deduct_balance(data['amount']):
                    return Response({
                        'status': 'error',
                        'message': 'Insufficient balance'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Update purchase record
                purchase.status = 'completed'
                purchase.transaction_id = result['transaction_id']
                purchase.completed_at = timezone.now()
                purchase.save()

                # Create transaction record
                Transaction.objects.create(
                    user=user,
                    amount=data['amount'],
                    type='payment',
                    category='airtime',
                    status='completed',
                    description=f"Airtime purchase for {data['phone_number']} ({data['provider']})",
                    merchant_name="Airtime Purchase"
                )

                return Response({
                    'status': 'success',
                    'message': 'Airtime purchased successfully',
                    'data': {
                        'purchase_id': str(purchase.id),
                        'transaction_id': result['transaction_id']
                    }
                })
            else:
                purchase.status = 'failed'
                purchase.save()
                # result['error'] carried raw upstream/internal text (e.g.
                # "'Settings' object has no attribute 'AIRIME_API_KEY'") to the
                # client. Log it; return a generic message.
                logger.error("Airtime provider declined purchase %s: %s",
                             purchase.id, result.get('error'))
                return Response({
                    'status': 'error',
                    'message': 'Airtime purchase was declined by the provider.'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Airtime purchase failed: {str(e)}")
            purchase.status = 'failed'
            purchase.save()
            return Response({
                'status': 'error',
                'message': 'Airtime purchase failed. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TransportTicketView(APIView):
    """Purchase transport tickets"""
    permission_classes = [IsAuthenticated]
    # 'payment' scope = 30/min per user: bounds automated abuse of a
    # money-moving endpoint without affecting normal use.
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'payment'

    @transaction.atomic
    def post(self, request):
        serializer = TransportBuySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        data = serializer.validated_data

        # A frozen account must not be able to spend. Previously nothing
        # consulted is_account_frozen, so the safety control was inert.
        try:
            AccountStatusService.assert_can_spend(user)
        except AccountFrozen as exc:
            return Response({
                'status': 'error',
                'message': str(exc)
            }, status=status.HTTP_403_FORBIDDEN)

        # Check wallet balance
        wallet = Wallet.objects.select_for_update().get(user=user)

        if wallet.balance < data['amount']:
            return Response({
                'status': 'error',
                'message': 'Insufficient balance'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create ticket record
        ticket = TransportTicket.objects.create(
            user=user,
            ticket_type=data['ticket_type'],
            route=data['route'],
            departure_time=data['departure_time'],
            arrival_time=data['arrival_time'],
            amount=data['amount'],
            seat_number=data.get('seat_number'),
            status='pending'
        )

        # Process ticket purchase via transport API
        try:
            result = TransportAPIService.book_ticket(
                ticket_type=data['ticket_type'],
                route=data['route'],
                departure_time=data['departure_time'],
                amount=data['amount'],
                idempotency_key=ticket.id,
            )

            if result['success']:
                # Deduct balance
                if not wallet.deduct_balance(data['amount']):
                    return Response({
                        'status': 'error',
                        'message': 'Insufficient balance'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Update ticket record
                ticket.status = 'confirmed'
                ticket.reference = result['reference']
                ticket.qr_code = result.get('qr_code')
                ticket.save()

                # Create transaction record
                Transaction.objects.create(
                    user=user,
                    amount=data['amount'],
                    type='payment',
                    category='transport',
                    status='completed',
                    description=f"{data['ticket_type']} ticket for {data['route']}",
                    merchant_name=f"{data['ticket_type'].title()} Transport"
                )

                return Response({
                    'status': 'success',
                    'message': 'Ticket purchased successfully',
                    'data': {
                        'ticket_id': str(ticket.id),
                        'reference': result['reference'],
                        'qr_code': result.get('qr_code')
                    }
                })
            else:
                ticket.status = 'cancelled'
                ticket.save()
                logger.error("Transport provider declined ticket %s: %s",
                             ticket.id, result.get('error'))
                return Response({
                    'status': 'error',
                    'message': 'Ticket booking was declined by the provider.'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Ticket purchase failed: {str(e)}")
            ticket.status = 'cancelled'
            ticket.save()
            return Response({
                'status': 'error',
                'message': 'Ticket purchase failed. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GenerateQRCodeView(APIView):
    """Generate QR code for merchant payments"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GenerateQRCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        merchant_id = data['merchant_id']
        amount = data['amount']
        description = data.get('description', '')
        expires_in_minutes = data['expires_in']

        try:
            merchant = Merchant.objects.get(id=merchant_id)

            # The Merchant model has no `created_by` field, so the previous
            # ownership check (`merchant.created_by_id`) raised AttributeError
            # and returned HTTP 500 for every non-admin caller. Until merchant
            # ownership is modelled, restrict issuing to admins -- the only
            # path that actually worked before.
            if request.user.role != 'admin':
                return Response({
                    'status': 'error',
                    'message': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)

            # Create QR code
            qr_code = QRCode.objects.create(
                merchant=merchant,
                amount=amount,
                description=description,
                expires_at=timezone.now() + timedelta(minutes=expires_in_minutes)
            )

            # Generate QR image
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(str(qr_code.id))
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")

            # Convert to base64
            buffer = BytesIO()
            img.save(buffer, format="PNG")
            qr_base64 = base64.b64encode(buffer.getvalue()).decode()

            qr_code.qr_image = qr_base64
            qr_code.save()

            return Response({
                'status': 'success',
                'data': {
                    'qr_id': str(qr_code.id),
                    'qr_image': qr_base64,
                    'expires_at': qr_code.expires_at
                }
            })

        except Merchant.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Merchant not found'
            }, status=status.HTTP_404_NOT_FOUND)


class RegisterNFCTokenView(APIView):
    """Register NFC device for tap-to-pay"""
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        device_id = request.data.get('device_id')

        if not device_id:
            return Response({
                'status': 'error',
                'message': 'device_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Generate unique token
        token = str(uuid.uuid4()).replace('-', '')[:32]

        nfc_token = NFCToken.objects.create(
            user=request.user,
            device_id=device_id,
            token=token,
            expires_at=timezone.now() + timedelta(days=365)
        )

        return Response({
            'status': 'success',
            'data': {
                'token': token,
                'expires_at': nfc_token.expires_at
            }
        })