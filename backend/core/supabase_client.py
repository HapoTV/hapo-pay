# core/supabase_client.py
from supabase import create_client, Client
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class SupabaseClient:
    """Singleton Supabase client instance"""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            try:
                # Check if Supabase is configured
                if hasattr(settings, 'SUPABASE_URL') and hasattr(settings, 'SUPABASE_KEY'):
                    if settings.SUPABASE_URL and settings.SUPABASE_KEY:
                        cls._instance = create_client(
                            settings.SUPABASE_URL,
                            settings.SUPABASE_KEY
                        )
                        logger.info("Supabase client initialized successfully")
                    else:
                        logger.warning("Supabase URL or KEY is empty. Supabase features disabled.")
                        cls._instance = None
                else:
                    logger.warning("Supabase settings not found. Supabase features disabled.")
                    cls._instance = None
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {str(e)}")
                cls._instance = None
        return cls._instance


# Global supabase client instance (may be None if not configured)
supabase = SupabaseClient()


class SupabaseStorage:
    """Handle Supabase storage operations"""

    @staticmethod
    def upload_file(bucket, file_path, file_content, content_type=None):
        """Upload file to Supabase storage"""
        if not supabase:
            logger.warning("Supabase not configured. File upload skipped.")
            return None
        try:
            supabase.storage.from_(bucket).upload(
                file_path,
                file_content,
                {"content-type": content_type} if content_type else {}
            )
            public_url = supabase.storage.from_(bucket).get_public_url(file_path)
            return public_url
        except Exception as e:
            logger.error(f"Failed to upload file to Supabase: {str(e)}")
            raise

    @staticmethod
    def download_file(bucket, file_path):
        """Download file from Supabase storage"""
        if not supabase:
            logger.warning("Supabase not configured. File download skipped.")
            return None
        try:
            response = supabase.storage.from_(bucket).download(file_path)
            return response
        except Exception as e:
            logger.error(f"Failed to download file from Supabase: {str(e)}")
            raise

    @staticmethod
    def delete_file(bucket, file_path):
        """Delete file from Supabase storage"""
        if not supabase:
            logger.warning("Supabase not configured. File deletion skipped.")
            return False
        try:
            supabase.storage.from_(bucket).remove([file_path])
            return True
        except Exception as e:
            logger.error(f"Failed to delete file from Supabase: {str(e)}")
            raise