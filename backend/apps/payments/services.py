# apps/payments/services.py
import logging
import uuid

from django.conf import settings


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
    def purchase_airtime(phone_number, amount, provider, idempotency_key=None):
        """Purchase airtime from provider API.

        `idempotency_key` should be the AirtimePurchase primary key. It is
        forwarded to the provider so a retried or replayed request is
        collapsed upstream instead of dispensing airtime twice, and it is
        required before this call can ever be safely retried.

        Uses getattr rather than direct attribute access: settings.AIRIME_*
        did not exist, so every call raised AttributeError, was swallowed by
        the except below, and surfaced to the user as a provider decline.
        """
        try:
            # This is a mock implementation
            # Replace with actual provider API integration

            api_key = getattr(settings, 'AIRIME_API_KEY', '')
            api_url = getattr(settings, 'AIRIME_PROVIDER_URL', '')

            if not api_key or not api_url:
                logger.error("Airtime provider is not configured (AIRIME_API_KEY/URL missing)")
                return {
                    'success': False,
                    'error': 'airtime_provider_not_configured',
                    'retryable': False,
                }

            # Example API call -- note it must go through core.http_client so
            # it inherits a mandatory timeout, connection pooling and
            # idempotency-key handling:
            #
            # response = http_client.post(
            #     f"{api_url}/purchase",
            #     json={
            #         "phone": phone_number,
            #         "amount": str(amount),
            #         "provider": provider,
            #     },
            #     headers={"Authorization": f"Bearer {api_key}"},
            #     idempotency_key=idempotency_key,
            # )

            # Mock successful response.
            #
            # The transaction_id is derived from a uuid, not from
            # provider+phone+amount as before: AirtimePurchase.transaction_id
            # is unique=True, so the old deterministic value made the second
            # identical purchase fail with IntegrityError.
            return {
                'success': True,
                'transaction_id': f"AIRTIME_{provider}_{uuid.uuid4().hex}"
            }

        except Exception:
            # str(e) was returned to the caller and rendered in the API
            # response, leaking internal detail. The reason is logged; the
            # caller gets a stable machine-readable code.
            logger.exception("Airtime provider call failed for provider=%s", provider)
            return {
                'success': False,
                'error': 'airtime_provider_error',
                'retryable': True,
            }


class TransportAPIService:
    """Integrate with transport providers API"""

    @staticmethod
    def book_ticket(ticket_type, route, departure_time, amount, idempotency_key=None):
        """Book ticket with transport provider"""
        try:
            # This is a mock implementation
            # Replace with actual transport provider API integration

            api_key = getattr(settings, 'TRANSPORT_API_KEY', '')
            api_url = getattr(settings, 'TRANSPORT_API_URL', '')

            if not api_key or not api_url:
                logger.error("Transport provider is not configured (TRANSPORT_API_KEY/URL missing)")
                return {
                    'success': False,
                    'error': 'transport_provider_not_configured',
                    'retryable': False,
                }

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

            # Mock successful response. The reference is uuid-derived because
            # TransportTicket.reference is unique=True and the old
            # type+route+timestamp value collided for two riders booking the
            # same departure.
            return {
                'success': True,
                'reference': f"TICKET_{ticket_type}_{uuid.uuid4().hex}",
                'qr_code': "base64_encoded_qr_code_here"
            }

        except Exception:
            logger.exception("Transport provider call failed for type=%s", ticket_type)
            return {
                'success': False,
                'error': 'transport_provider_error',
                'retryable': True,
            }