# tests/factories/wallet_factory.py
"""Factory for creating test wallets."""
import factory
from apps.wallets.models import Wallet
from .user_factory import ParentUserFactory


class WalletFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Wallet

    user = factory.SubFactory(ParentUserFactory)
    balance = 1000.00
    currency = 'ZAR'
    is_active = True