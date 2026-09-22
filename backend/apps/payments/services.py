# apps/payments/services.py
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class PaymentProcessorService:
    """
    Coordinates payment processing across different payment rails.

    Currently a thin facade — most of the work lives in the views
    because the operations need to be wrapped in a DB transaction. This
    class exists as a natural extension point for future payment
    methods (card, bank transfer, etc.).
    """

    @staticmethod
    def process_qr_payment(qr_code, student):
        """
        Placeholder for QR payment processing.

        NOTE: The actual implementation lives in `QRPaymentView.post`
        because it needs `transaction.atomic()` and row-level locking.
        This method is kept for API symmetry and future refactors.
        """
        try:
            # Intentionally a no-op — see QRPaymentView for the real flow.
            logger.info(
                f"[PaymentProcessorService] process_qr_payment called | "
                f"qr={qr_code.id if qr_code else None} | student={getattr(student, 'id', None)}"
            )
            return None
        except Exception as e:
            # Never let logging/refactor scaffolding crash a payment path.
            logger.exception(
                f"[PaymentProcessorService] Unexpected error in "
                f"process_qr_payment: {e}"
            )
            raise


class AirtimeProviderService:
    """
    Integrates with external airtime providers (Vodacom, MTN, etc.).

    All provider calls are wrapped in try/except so a network failure,
    timeout, or malformed provider response never bubbles up as a 500
    error. On failure we return a structured dict that the view can
    translate into an appropriate API response and, if needed, a
    refund.
    """

    # Sensible default timeout for all provider calls.
    REQUEST_TIMEOUT_SECONDS = 30

    @staticmethod
    def purchase_airtime(phone_number, amount, provider):
        """
        Purchase airtime from the configured provider API.

        Returns:
            dict: `{'success': True, 'transaction_id': '...'}` on success
                  `{'success': False, 'error': '...'}` on failure

        The method never raises — callers should always check `success`.
        """
        try:
            api_key = getattr(settings, 'AIRIME_API_KEY', None)
            api_url = getattr(settings, 'AIRIME_PROVIDER_URL', None)

            if not api_key or not api_url:
                logger.error(
                    "[AirtimeProviderService] Missing AIRIME_API_KEY or "
                    "AIRIME_PROVIDER_URL in settings."
                )
                return {
                    'success': False,
                    'error': 'Airtime provider is not configured.'
                }

            # --- Real provider call (commented out until we have a live API) ---
            # try:
            #     response = requests.post(
            #         f"{api_url}/purchase",
            #         json={
            #             "phone": phone_number,
            #             "amount": str(amount),
            #             "provider": provider,
            #         },
            #         headers={"Authorization": f"Bearer {api_key}"},
            #         timeout=AirtimeProviderService.REQUEST_TIMEOUT_SECONDS,
            #     )
            #     response.raise_for_status()
            #     payload = response.json()
            #     return {'success': True, 'transaction_id': payload['id']}
            # except requests.RequestException as e:
            #     logger.error(f"[AirtimeProviderService] HTTP error: {e}")
            #     return {'success': False, 'error': 'Provider unreachable.'}

            # --- Mock success response for development ---
            logger.info(
                f"[AirtimeProviderService] (mock) purchase "
                f"phone={phone_number} amount={amount} provider={provider}"
            )
            return {
                'success': True,
                'transaction_id': f"AIRTIME_{provider}_{phone_number}_{amount}",
            }

        except Exception as e:
            # Catch-all: log with traceback so we can diagnose, but never crash.
            logger.exception(
                f"[AirtimeProviderService] Unexpected error during "
                f"purchase_airtime: {e}"
            )
            return {
                'success': False,
                'error': 'Airtime purchase failed due to an internal error.'
            }


class TransportAPIService:
    """
    Integrates with external transport providers (bus, train, ride-hail).

    Same defensive pattern as `AirtimeProviderService`: never raise,
    always return a structured result the view can act on.
    """

    REQUEST_TIMEOUT_SECONDS = 30

    @staticmethod
    def book_ticket(ticket_type, route, departure_time, amount):
        """
        Book a ticket with the configured transport provider.

        Returns:
            dict: `{'success': True, 'reference': '...', 'qr_code': '...'}`
                  or `{'success': False, 'error': '...'}`
        """
        try:
            api_key = getattr(settings, 'TRANSPORT_API_KEY', None)
            api_url = getattr(settings, 'TRANSPORT_API_URL', None)

            if not api_key or not api_url:
                logger.error(
                    "[TransportAPIService] Missing TRANSPORT_API_KEY or "
                    "TRANSPORT_API_URL in settings."
                )
                return {
                    'success': False,
                    'error': 'Transport provider is not configured.'
                }

            # --- Real provider call (commented out until we have a live API) ---
            # try:
            #     response = requests.post(
            #         f"{api_url}/book",
            #         json={
            #             "type": ticket_type,
            #             "route": route,
            #             "departure": departure_time.isoformat(),
            #             "amount": str(amount),
            #         },
            #         headers={"Authorization": f"Bearer {api_key}"},
            #         timeout=TransportAPIService.REQUEST_TIMEOUT_SECONDS,
            #     )
            #     response.raise_for_status()
            #     payload = response.json()
            #     return {
            #         'success': True,
            #         'reference': payload['reference'],
            #         'qr_code': payload['qr_code'],
            #     }
            # except requests.RequestException as e:
            #     logger.error(f"[TransportAPIService] HTTP error: {e}")
            #     return {'success': False, 'error': 'Provider unreachable.'}

            # --- Mock success response for development ---
            logger.info(
                f"[TransportAPIService] (mock) book "
                f"type={ticket_type} route={route} amount={amount}"
            )
            return {
                'success': True,
                'reference': f"TICKET_{ticket_type}_{route}_{departure_time.timestamp()}",
                'qr_code': "base64_encoded_qr_code_here",
            }

        except Exception as e:
            logger.exception(
                f"[TransportAPIService] Unexpected error during "
                f"book_ticket: {e}"
            )
            return {
                'success': False,
                'error': 'Ticket booking failed due to an internal error.'
            }