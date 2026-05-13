from rest_framework import serializers
from .models import Reward, Achievement


class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = ["id", "child", "points", "level", "total_earned", "updated_at"]
        read_only_fields = ["id", "points", "level", "total_earned", "updated_at"]


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ["id", "child", "title", "description", "badge_url", "earned_at"]
        read_only_fields = ["id", "earned_at"]
