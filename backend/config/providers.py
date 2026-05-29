# config/providers.py
from django.conf import settings

class AirtimeProviderConfig:
    """Airtime provider configuration"""
    
    PROVIDERS = {
        'vodacom': {
            'api_url': f"{settings.AIRIME_PROVIDER_URL}/vodacom",
            'api_key': settings.AIRIME_API_KEY,
            'min_amount': 5,
            'max_amount': 1000,
            'timeout': 30
        },
        'mtn': {
            'api_url': f"{settings.AIRIME_PROVIDER_URL}/mtn",
            'api_key': settings.AIRIME_API_KEY,
            'min_amount': 5,
            'max_amount': 1000,
            'timeout': 30
        },
        'cellc': {
            'api_url': f"{settings.AIRIME_PROVIDER_URL}/cellc",
            'api_key': settings.AIRIME_API_KEY,
            'min_amount': 5,
            'max_amount': 500,
            'timeout': 30
        },
        'telkom': {
            'api_url': f"{settings.AIRIME_PROVIDER_URL}/telkom",
            'api_key': settings.AIRIME_API_KEY,
            'min_amount': 5,
            'max_amount': 500,
            'timeout': 30
        }
    }

class TransportProviderConfig:
    """Transport provider configuration"""
    
    PROVIDERS = {
        'bus': {
            'api_url': f"{settings.TRANSPORT_API_URL}/bus",
            'api_key': settings.TRANSPORT_API_KEY,
            'timeout': 30,
            'supported_routes': ['JHB-CPT', 'JHB-DBN', 'CPT-DBN']
        },
        'train': {
            'api_url': f"{settings.TRANSPORT_API_URL}/train",
            'api_key': settings.TRANSPORT_API_KEY,
            'timeout': 30,
            'supported_routes': ['PRETORIA-JHB', 'JHB-SOWETO', 'CPT-SIMONSTOWN']
        },
        'uber': {
            'api_url': "https://api.uber.com/v1.2",
            'api_key': settings.TRANSPORT_API_KEY,
            'timeout': 20
        }
    }