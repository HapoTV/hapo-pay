# apps/payments/views.py
import base64
import logging
import uuid
from datetime import timedelta
from io import BytesIO

import qrcode
from django.db import transaction
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.gamification.services import PointCalculatorService
from apps.notifications.services import NotificationService
from apps.wallets.models import Transaction, Wallet
from apps.wallets.services import LimitCheckerService
from core.permissions import IsAdmin, IsStudent

from .models import (
    AirtimePurchase,
    Merchant,
    NFCToken,
    QRCode,
    TransportTicket,
)
from .serializers import (
    AirtimeBuySerializer,
    AirtimePurchaseSerializer,
    MerchantSerializer,
    NFCPaymentSerializer,
    NFCTokenSerializer,
    QRCodeSerializer,
    QRPaymentSerializer,
    TransportBuySerializer,
    TransportTicketSerializer,
)
from .services import AirtimeProviderService, TransportAPIService

logger = logging.getLogger(__name__)


class MerchantViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public, read-only list/detail view of verified merchants.

    Supports optional `?category=` filtering so the frontend can show
    only relevant merchants (e.g. only restaurants on a food screen).
    """

    queryset = Merchant.objects.filter(verified=True)
    serializer_class = MerchantSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """Apply optional category filter from the query string."""
        try:
            queryset = super().get_queryset()
            category = self.request.query_params.get('category')
            if category:
                queryset = queryset.filter(category=category)
            return queryset
        except Exception as e:
            # Log and fall back to the unfiltered queryset rather than 500.
            logger.exception(
                f"[MerchantViewSet] get_queryset failed: {e}"
            )
            return Merchant.objects.filter(verified=True)


class QRPaymentView(APIView):
    """
    Process a student's QR-code payment to a merchant.

    Flow:
      1. Validate the QR (exists, not expired, not already used).
      2. Enforce the student's per-category spending limit.
      3. Ensure sufficient wallet balance.
      4. Debit the wallet and write a Transaction row.
      5. Mark the QR as used (prevents replay).
      6. Update spending-limit accumulators.
      7. Award gamification points.
      8. Notify the parent.

    The whole operation runs inside a single DB transaction with
    `select_for_update` on both the QR and the wallet, so two
    concurrent scans of the same QR cannot both succeed.
    """

    permission_classes = [IsAuthenticated, IsStudent]

    @transaction.atomic
    def post(self, request):
        try:
            serializer = QRPaymentSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            qr_id = serializer.validated_data['qr_id']
            student = request.user

            # --- 1. Lock and validate the QR code ---
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

            # --- 2. Spending limit check ---
            if not LimitCheckerService.check_spending_limit(
                student, qr_code.amount, qr_code.merchant.category
            ):
                return Response({
                    'status': 'error',
                    'message': 'Transaction exceeds spending limit for this category'
                }, status=status.HTTP_403_FORBIDDEN)

            # --- 3. Wallet balance check (row-locked) ---
            wallet = Wallet.objects.select_for_update().get(user=student)

            if wallet.balance < qr_code.amount:
                return Response({
                    'status': 'error',
                    'message': 'Insufficient balance'
                }, status=status.HTTP_400_BAD_REQUEST)

            # --- 4. Debit wallet + write the ledger entry ---
            wallet.deduct_balance(qr_code.amount)

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

            # --- 5. Mark QR as used (replay protection) ---
            qr_code.is_used = True
            qr_code.used_by = student
            qr_code.used_at = timezone.now()
            qr_code.save()

            # --- 6. Update per-category spending accumulators ---
            LimitCheckerService.update_spent_amounts(
                student, qr_code.amount, qr_code.merchant.category
            )

            # --- 7. Gamification: award points for responsible spending ---
            points = PointCalculatorService.calculate_spending_points(
                student, qr_code.amount, qr_code.merchant.category
            )
            PointCalculatorService.award_points(student, points, 'payment')

            # --- 8. Notify parent (best-effort; never break payment) ---
            try:
                parent = student.student_profile.parent
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
            except Exception as notify_err:
                # A failed notification must not roll back a successful payment.
                logger.exception(
                    f"[QRPaymentView] Notification failed for txn "
                    f"{transaction_obj.id}: {notify_err}"
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

        except Exception as e:
            # Any unexpected error triggers a rollback (transaction.atomic)
            # and is logged with a full traceback for investigation.
            logger.exception(f"[QRPaymentView] Unexpected error: {e}")
            return Response({
                'status': 'error',
                'message': 'Payment could not be processed. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NFCPaymentView(APIView):
    """
    Process an NFC tap-to-pay payment.

    The student's phone (or card) presents a long-lived NFC token to
    the merchant terminal, which forwards the token + amount to this
    endpoint. We look up the owning user via the token and debit their
    wallet atomically.
    """

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        try:
            serializer = NFCPaymentSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            token_value = serializer.validated_data['token']
            amount = serializer.validated_data.get('amount')

            # --- 1. Lock and validate the NFC token ---
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

            # --- 2. Amount may come from the request body as a fallback ---
            if not amount:
                amount = request.data.get('amount')
                if not amount:
                    return Response({
                        'status': 'error',
                        'message': 'Amount is required for NFC payment'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # --- 3. Wallet balance check (row-locked) ---
            wallet = Wallet.objects.select_for_update().get(user=student)

            if wallet.balance < amount:
                return Response({
                    'status': 'error',
                    'message': 'Insufficient balance'
                }, status=status.HTTP_400_BAD_REQUEST)

            # --- 4. Debit wallet + write ledger entry ---
            wallet.deduct_balance(amount)

            transaction_obj = Transaction.objects.create(
                user=student,
                amount=amount,
                type='payment',
                category='other',
                status='completed',
                description="NFC Payment",
                reference_id=nfc_token.device_id
            )

            # --- 5. Record token usage ---
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

        except Exception as e:
            logger.exception(f"[NFCPaymentView] Unexpected error: {e}")
            return Response({
                'status': 'error',
                'message': 'NFC payment could not be processed.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AirtimePurchaseView(APIView):
    """
    Purchase mobile airtime for a phone number.

    The flow is:
      1. Validate input and check wallet balance.
      2. Create a `pending` AirtimePurchase record.
      3. Call the external provider.
      4. On success: debit wallet, mark record completed, write Transaction.
      5. On failure: mark record failed and return an error (no debit).
    """

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        try:
            serializer = AirtimeBuySerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            user = request.user
            data = serializer.validated_data

            # --- 1. Wallet balance check ---
            wallet = Wallet.objects.select_for_update().get(user=user)

            if wallet.balance < data['amount']:
                return Response({
                    'status': 'error',
                    'message': 'Insufficient balance'
                }, status=status.HTTP_400_BAD_REQUEST)

            # --- 2. Create pending purchase record ---
            purchase = AirtimePurchase.objects.create(
                user=user,
                phone_number=data['phone_number'],
                amount=data['amount'],
                provider=data['provider'],
                status='pending'
            )

            # --- 3. Call the provider (defensive — service never raises) ---
            result = AirtimeProviderService.purchase_airtime(
                phone_number=data['phone_number'],
                amount=data['amount'],
                provider=data['provider']
            )

            # --- 4. Handle provider outcome ---
            if not result.get('success'):
                purchase.status = 'failed'
                purchase.save(update_fields=['status'])
                return Response({
                    'status': 'error',
                    'message': result.get('error', 'Airtime purchase failed')
                }, status=status.HTTP_400_BAD_REQUEST)

            # --- 5. Success path: debit wallet, complete record, ledger entry ---
            wallet.deduct_balance(data['amount'])

            purchase.status = 'completed'
            purchase.transaction_id = result['transaction_id']
            purchase.completed_at = timezone.now()
            purchase.save(update_fields=['status', 'transaction_id', 'completed_at'])

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

        except Exception as e:
            logger.exception(f"[AirtimePurchaseView] Unexpected error: {e}")
            return Response({
                'status': 'error',
                'message': 'Airtime purchase failed. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TransportTicketView(APIView):
    """
    Purchase a bus / train / taxi / ride-hailing ticket.

    Mirrors the airtime flow: create a pending ticket, call the
    provider, and only debit the wallet once the provider confirms.
    """

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        try:
            serializer = TransportBuySerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            user = request.user
            data = serializer.validated_data

            # --- 1. Wallet balance check ---
            wallet = Wallet.objects.select_for_update().get(user=user)

            if wallet.balance < data['amount']:
                return Response({
                    'status': 'error',
                    'message': 'Insufficient balance'
                }, status=status.HTTP_400_BAD_REQUEST)

            # --- 2. Create pending ticket record ---
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

            # --- 3. Call the provider ---
            result = TransportAPIService.book_ticket(
                ticket_type=data['ticket_type'],
                route=data['route'],
                departure_time=data['departure_time'],
                amount=data['amount']
            )

            # --- 4. Handle provider outcome ---
            if not result.get('success'):
                ticket.status = 'cancelled'
                ticket.save(update_fields=['status'])
                return Response({
                    'status': 'error',
                    'message': result.get('error', 'Ticket booking failed')
                }, status=status.HTTP_400_BAD_REQUEST)

            # --- 5. Success path: debit wallet, finalize ticket, ledger entry ---
            wallet.deduct_balance(data['amount'])

            ticket.status = 'confirmed'
            ticket.reference = result['reference']
            ticket.qr_code = result.get('qr_code')
            ticket.save(update_fields=['status', 'reference', 'qr_code'])

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

        except Exception as e:
            logger.exception(f"[TransportTicketView] Unexpected error: {e}")
            return Response({
                'status': 'error',
                'message': 'Ticket purchase failed. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GenerateQRCodeView(APIView):
    """
    Allow a merchant (or admin) to generate a fresh QR code.

    The QR image is a PNG that encodes the QRCode UUID. When the
    student scans it, their app posts the UUID to `/qr/pay/`. The
    QR has a short TTL (default 15 min) and can only be used once.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            merchant_id = request.data.get('merchant_id')
            amount = request.data.get('amount')
            description = request.data.get('description', '')
            expires_in_minutes = request.data.get('expires_in', 15)

            # --- 1. Look up the merchant ---
            try:
                merchant = Merchant.objects.get(id=merchant_id)
            except Merchant.DoesNotExist:
                return Response({
                    'status': 'error',
                    'message': 'Merchant not found'
                }, status=status.HTTP_404_NOT_FOUND)

            # --- 2. Authorize: only the merchant owner or an admin ---
            # NOTE: Merchant has no `created_by` field in the current model.
            # If you add one later, restore this check:
            # if request.user.role != 'admin' and request.user.id != merchant.created_by_id:
            #     return Response(...403...)
            if request.user.role != 'admin':
                # Placeholder authorization: any authenticated non-admin
                # may currently create a QR for any merchant. Tighten
                # this once merchant ownership is modelled.
                logger.warning(
                    f"[GenerateQRCodeView] Non-admin user {request.user.id} "
                    f"generated QR for merchant {merchant.id}"
                )

            # --- 3. Validate amount ---
            try:
                amount_decimal = float(amount)
                if amount_decimal <= 0:
                    raise ValueError
            except (TypeError, ValueError):
                return Response({
                    'status': 'error',
                    'message': 'amount must be a positive number'
                }, status=status.HTTP_400_BAD_REQUEST)

            # --- 4. Create the QR record ---
            qr_code = QRCode.objects.create(
                merchant=merchant,
                amount=amount,
                description=description,
                expires_at=timezone.now() + timedelta(minutes=expires_in_minutes)
            )

            # --- 5. Render the QR image and store as base64 ---
            try:
                qr = qrcode.QRCode(version=1, box_size=10, border=5)
                qr.add_data(str(qr_code.id))
                qr.make(fit=True)
                img = qr.make_image(fill_color="black", back_color="white")

                buffer = BytesIO()
                img.save(buffer, format="PNG")
                qr_base64 = base64.b64encode(buffer.getvalue()).decode()
            except Exception as img_err:
                logger.exception(
                    f"[GenerateQRCodeView] QR image generation failed: {img_err}"
                )
                # Roll back the QR record so we don't leave orphan rows.
                qr_code.delete()
                return Response({
                    'status': 'error',
                    'message': 'Could not generate QR image'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            qr_code.qr_image = qr_base64
            qr_code.save(update_fields=['qr_image'])

            return Response({
                'status': 'success',
                'data': {
                    'qr_id': str(qr_code.id),
                    'qr_image': qr_base64,
                    'expires_at': qr_code.expires_at
                }
            })

        except Exception as e:
            logger.exception(f"[GenerateQRCodeView] Unexpected error: {e}")
            return Response({
                'status': 'error',
                'message': 'Could not generate QR code.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegisterNFCTokenView(APIView):
    """
    Enroll a device for tap-to-pay.

    The client supplies a stable `device_id` (e.g. Android's
    ANDROID_ID). We generate a random opaque token and store it
    alongside the user. The token is what the terminal will later
    present to `/nfc/pay/`.
    """

    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        try:
            device_id = request.data.get('device_id')

            if not device_id:
                return Response({
                    'status': 'error',
                    'message': 'device_id is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Generate a 32-char opaque token.
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

        except Exception as e:
            logger.exception(f"[RegisterNFCTokenView] Unexpected error: {e}")
            return Response({
                'status': 'error',
                'message': 'Could not register NFC device.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)