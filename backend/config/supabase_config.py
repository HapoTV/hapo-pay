# config/supabase_config.py
from django.conf import settings
from supabase import create_client

class SupabaseConfig:
    """Supabase configuration and helpers"""
    
    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_KEY
        self.service_key = settings.SUPABASE_SERVICE_KEY
        self.client = create_client(self.url, self.key)
    
    def get_admin_client(self):
        """Get admin client with service role"""
        return create_client(self.url, self.service_key)
    
    def verify_webhook_signature(self, payload, signature):
        """Verify webhook signature for security"""
        # Implementation depends on Supabase webhook configuration
        import hmac
        import hashlib
        
        expected = hmac.new(
            settings.SUPABASE_JWT_SECRET.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected, signature)

supabase_config = SupabaseConfig()