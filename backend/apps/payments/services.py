# apps/payments/services.py
import requests
from decimal import Decimal
from django.conf import settings
from django.db import transaction
from django.db.models import Sum, Count
import logging

logger = logging.getLogger(__name__)


class PaymentProcessorService:
    """Process various types of payments"""

    @staticmethod
    def process_qr_payment(qr_code, student):
        """Process QR code payment"""
        # Implementation will be in views with transaction atomic
        pass


class AirtimeProviderService:
    """Integrate with airtime providers"""

    @staticmethod
    def purchase_airtime(phone_number, amount, provider):
        """Purchase airtime from provider API"""
        try:
            # This is a mock implementation
            # Replace with actual provider API integration

            api_key = settings.AIRIME_API_KEY
            api_url = settings.AIRIME_PROVIDER_URL

            # Example API call
            # response = requests.post(
            #     f"{api_url}/purchase",
            #     json={
            #         "phone": phone_number,
            #         "amount": str(amount),
            #         "provider": provider
            #     },
            #     headers={"Authorization": f"Bearer {api_key}"}
            # )

            # Mock successful response
            return {
                'success': True,
                'transaction_id': f"AIRTIME_{provider}_{phone_number}_{amount}"
            }

        except Exception as e:
            logger.error(f"Airtime provider error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }


class TransportAPIService:
    """Integrate with transport providers API"""

    @staticmethod
    def book_ticket(ticket_type, route, departure_time, amount):
        """Book ticket with transport provider"""
        try:
            # This is a mock implementation
            # Replace with actual transport provider API integration

            api_key = settings.TRANSPORT_API_KEY
            api_url = settings.TRANSPORT_API_URL

            # Example API call
            # response = requests.post(
            #     f"{api_url}/book",
            #     json={
            #         "type": ticket_type,
            #         "route": route,
            #         "departure": departure_time.isoformat(),
            #         "amount": str(amount)
            #     },
            #     headers={"Authorization": f"Bearer {api_key}"}
            # )

            # Mock successful response
            return {
                'success': True,
                'reference': f"TICKET_{ticket_type}_{route}_{departure_time.timestamp()}",
                'qr_code': "base64_encoded_qr_code_here"
            }

        except Exception as e:
            logger.error(f"Transport API error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }


class SettlementService:
    """Calculate and record merchant payout batches."""

    # No product/finance-confirmed fee schedule exists yet — defaults to 0%
    # (full pass-through) unless MERCHANT_SETTLEMENT_FEE_PERCENT is set.
    # Treat this as a placeholder, not a real business decision.
    DEFAULT_FEE_PERCENT = Decimal('0')

    @staticmethod
    @transaction.atomic
    def run_settlement(merchant, period_start, period_end, initiated_by):
        """
        Create a Settlement covering the merchant's completed, not-yet-settled
        transactions in [period_start, period_end). Transactions already
        attached to a prior Settlement (via the M2M) are excluded so nothing
        is ever paid out twice.
        """
        from apps.wallets.models import Transaction
        from .models import Settlement

        eligible_transactions = Transaction.objects.select_for_update().filter(
            merchant_id=merchant.id,
            type='payment',
            status='completed',
            created_at__gte=period_start,
            created_at__lt=period_end,
            settlements__isnull=True,
        )

        aggregates = eligible_transactions.aggregate(total=Sum('amount'), count=Count('id'))
        gross_amount = aggregates['total'] or Decimal('0')
        transaction_count = aggregates['count'] or 0

        fee_percent = getattr(settings, 'MERCHANT_SETTLEMENT_FEE_PERCENT', SettlementService.DEFAULT_FEE_PERCENT)
        fee_amount = (gross_amount * Decimal(str(fee_percent)) / Decimal('100')).quantize(Decimal('0.01'))
        net_amount = gross_amount - fee_amount

        settlement = Settlement.objects.create(
            merchant=merchant,
            period_start=period_start,
            period_end=period_end,
            transaction_count=transaction_count,
            gross_amount=gross_amount,
            fee_amount=fee_amount,
            net_amount=net_amount,
            status='pending',
            initiated_by=initiated_by,
        )
        settlement.transactions.set(eligible_transactions)

        logger.info(
            f"Settlement created | merchant={merchant.id} | "
            f"txns={transaction_count} | net={net_amount}"
        )
        return settlement