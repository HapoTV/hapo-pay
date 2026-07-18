# apps/wallets/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from .models import Wallet


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_wallet_for_new_user(sender, instance, created, **kwargs):
    """
    Provision a Wallet the moment a User is created.

    Nothing in the codebase previously called Wallet.objects.create()
    anywhere — not in RegisterView, not via a signal — so every user ever
    created had no wallet at all, and every wallet-touching endpoint
    (TransferService, QRPaymentView, ApproveMoneyRequestView, etc.) would
    fail with Wallet.DoesNotExist for any real account. This covers every
    creation path (RegisterView, Django admin, shell, management commands,
    fixtures) rather than relying on each one to remember to create a wallet.

    Scoped to parent/student — merchants and admins don't hold a spending
    wallet in this model; merchant payouts go through Settlement instead.
    """
    if created and instance.role in ('parent', 'student'):
        Wallet.objects.get_or_create(user=instance)
