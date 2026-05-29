# middleware/audit_log_middleware.py
from django.utils.deprecation import MiddlewareMixin
from apps.admin_panel.models import AuditLog
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

            # Create audit log (async to avoid blocking)
            try:
                AuditLog.objects.create(
                    user=request.user,
                    action=action,
                    resource_type=self.get_resource_type(request.path),
                    ip_address=request.audit_data['ip_address'],
                    user_agent=request.audit_data['user_agent']
                )
            except Exception as e:
                logger.error(f"Failed to create audit log: {str(e)}")

        return response

    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

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