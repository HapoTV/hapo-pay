# apps/gamification/serializers.py
from rest_framework import serializers
from .models import Reward, Achievement, Challenge, UserAchievement, UserChallenge


class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = ('points', 'level', 'streak_days', 'total_saved', 'total_spent', 'updated_at')
        read_only_fields = ('points', 'level', 'streak_days', 'updated_at')


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ('id', 'name', 'description', 'points_required', 'badge_icon', 'category')
        read_only_fields = ('id',)


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement_name = serializers.CharField(source='achievement.name', read_only=True)
    achievement_description = serializers.CharField(source='achievement.description', read_only=True)
    badge_icon = serializers.CharField(source='achievement.badge_icon', read_only=True)

    class Meta:
        model = UserAchievement
        fields = ('achievement', 'achievement_name', 'achievement_description', 'badge_icon', 'earned_at')
        read_only_fields = ('earned_at',)


class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = ('id', 'title', 'description', 'challenge_type', 'target_value',
                  'reward_points', 'start_date', 'end_date', 'is_active')
        read_only_fields = ('id',)


class UserChallengeSerializer(serializers.ModelSerializer):
    challenge_title = serializers.CharField(source='challenge.title', read_only=True)
    challenge_description = serializers.CharField(source='challenge.description', read_only=True)
    challenge_reward = serializers.IntegerField(source='challenge.reward_points', read_only=True)

    class Meta:
        model = UserChallenge
        fields = ('id', 'challenge', 'challenge_title', 'challenge_description', 'challenge_reward',
                  'progress', 'status', 'joined_at', 'completed_at')
        read_only_fields = ('id', 'joined_at', 'completed_at')