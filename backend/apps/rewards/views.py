from rest_framework import viewsets, permissions
from .models import Reward, Achievement
from .serializers import RewardSerializer, AchievementSerializer


class RewardViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RewardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reward.objects.filter(child__parent=self.request.user)


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Achievement.objects.filter(child__parent=self.request.user)
