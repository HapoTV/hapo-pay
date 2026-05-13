import uuid
from rest_framework import viewsets, permissions
from .models import Transaction
from .serializers import TransactionSerializer


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Parents see transactions for their children
        return Transaction.objects.filter(sender=self.request.user)

    def perform_create(self, serializer):
        serializer.save(
            sender=self.request.user,
            reference=str(uuid.uuid4()),
        )
