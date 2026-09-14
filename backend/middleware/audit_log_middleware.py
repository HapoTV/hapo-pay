# middleware/audit_log_middleware.py
from django.utils.deprecation import MiddlewareMixin
from apps.admin_panel.models import AuditLog
from middleware.rate_limit_middleware import get_client_ip
import logging

logger = logging.getLogger(__name__)


class AuditLogMiddleware(MiddlewareMixin):
    """Middleware to log user actions"""

    def process_request(self, request):
        """Store request info for logging"""
        request.audit_data = {
            'ip_address': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'method': request.method,
            'path': request.path
        }

    def process_response(self, request, response):
        """Log action after response"""
        # Only log for authenticated users and specific methods
        if (hasattr(request, 'user') and request.user.is_authenticated
                and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']):

            # Determine action type
            action = self.get_action_type(request.method)

            audit_data = getattr(request, 'audit_data', None)
            if audit_data is None:
                # process_request did not run (e.g. an earlier middleware
                # short-circuited); nothing reliable to record.
                return response

            try:
                AuditLog.objects.create(
                    user=request.user,
                    action=action,
                    resource_type=self.get_resource_type(request.path),
                    # ip_address is NOT NULL, so a missing IP previously raised
                    # IntegrityError and the audit row was silently dropped.
                    ip_address=audit_data['ip_address'] or '0.0.0.0',
                    user_agent=(audit_data['user_agent'] or '')[:1000]
                )
            except Exception:
                logger.exception("Failed to create audit log for %s %s",
                                 request.method, request.path)

        return response

    def get_client_ip(self, request):
        """Get client IP address.

        Delegates to the shared helper, which reads X-Forwarded-For from the
        trusted end. Taking the left-most entry (as this did) records an
        attacker-controlled value in the audit trail, making the trail
        misleading in exactly the investigation it exists for.
        """
        return get_client_ip(request)

    def get_action_type(self, method):
        """Map HTTP method to action type"""
        method_map = {
            'POST': 'create',
            'PUT': 'update',
            'PATCH': 'update',
            'DELETE': 'delete'
        }
        return method_map.get(method, 'update')

    def get_resource_type(self, path):
        """Extract resource type from path"""
        parts = path.strip('/').split('/')
        if len(parts) >= 3:
            return parts[2]  # /api/v1/resource/
        return 'unknown'