# apps/gamification/serializers.py
from rest_framework import serializers
from .models import Reward, Achievement, Challenge, UserAchievement, UserChallenge
import logging

logger = logging.getLogger(__name__)


class RewardSerializer(serializers.ModelSerializer):
    """
    Serializer for the Reward model.

    Exposes points, level, streak, and financial totals. Most fields are
    read-only as they are updated by the backend based on user activity.
    """

    class Meta:
        model = Reward
        fields = ('points', 'level', 'streak_days', 'total_saved', 'total_spent', 'updated_at')
        read_only_fields = ('points', 'level', 'streak_days', 'updated_at')


class AchievementSerializer(serializers.ModelSerializer):
    """
    Serializer for the Achievement model.

    Exposes the achievement metadata including name, description, and
    the points threshold required to unlock it.
    """

    class Meta:
        model = Achievement
        fields = ('id', 'name', 'description', 'points_required', 'badge_icon', 'category')
        read_only_fields = ('id',)


class UserAchievementSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserAchievement model.

    Flattens the related Achievement data into the response so the frontend
    can display the achievement details without a separate API call.
    """

    achievement_name = serializers.CharField(source='achievement.name', read_only=True)
    achievement_description = serializers.CharField(source='achievement.description', read_only=True)
    badge_icon = serializers.CharField(source='achievement.badge_icon', read_only=True)

    class Meta:
        model = UserAchievement
        fields = ('achievement', 'achievement_name', 'achievement_description', 'badge_icon', 'earned_at')
        read_only_fields = ('earned_at',)


class ChallengeSerializer(serializers.ModelSerializer):
    """
    Serializer for the Challenge model.

    Exposes all challenge details including type, target value, and
    the date range during which the challenge is active.
    """

    class Meta:
        model = Challenge
        fields = ('id', 'title', 'description', 'challenge_type', 'target_value',
                  'reward_points', 'start_date', 'end_date', 'is_active')
        read_only_fields = ('id',)


class UserChallengeSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserChallenge model.

    Includes denormalized challenge details (title, description, reward)
    to allow the frontend to display challenge info alongside progress.
    """

    challenge_title = serializers.CharField(source='challenge.title', read_only=True)
    challenge_description = serializers.CharField(source='challenge.description', read_only=True)
    challenge_reward = serializers.IntegerField(source='challenge.reward_points', read_only=True)

    class Meta:
        model = UserChallenge
        fields = ('id', 'challenge', 'challenge_title', 'challenge_description', 'challenge_reward',
                  'progress', 'status', 'joined_at', 'completed_at')
        read_only_fields = ('id', 'joined_at', 'completed_at')