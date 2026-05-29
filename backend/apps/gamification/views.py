# apps/gamification/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db import transaction
from django.utils import timezone
from .models import Reward, Achievement, Challenge, UserAchievement, UserChallenge
from .serializers import (
    RewardSerializer, AchievementSerializer, ChallengeSerializer,
    UserAchievementSerializer, UserChallengeSerializer
)
from core.permissions import IsStudent
from .services import PointCalculatorService
import logging

logger = logging.getLogger(__name__)


class RewardViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for user rewards"""
    serializer_class = RewardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reward.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        reward = Reward.objects.get(user=request.user)
        serializer = self.get_serializer(reward)

        # Get recent achievements
        recent_achievements = UserAchievement.objects.filter(
            user=request.user
        ).order_by('-earned_at')[:5]

        return Response({
            'status': 'success',
            'data': {
                'reward': serializer.data,
                'recent_achievements': UserAchievementSerializer(recent_achievements, many=True).data
            }
        })


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for achievements"""
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Get user's earned achievements
        earned_ids = UserAchievement.objects.filter(
            user=request.user
        ).values_list('achievement_id', flat=True)

        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data

        # Mark which achievements are earned
        for achievement in data:
            achievement['earned'] = achievement['id'] in earned_ids

        return Response({
            'status': 'success',
            'data': data
        })


class ChallengeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for challenges"""
    queryset = Challenge.objects.filter(is_active=True, end_date__gt=timezone.now())
    serializer_class = ChallengeSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Get user's active challenges
        user_challenges = UserChallenge.objects.filter(
            user=request.user,
            status='active'
        ).values_list('challenge_id', flat=True)

        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data

        # Mark which challenges are joined
        for challenge in data:
            challenge['joined'] = challenge['id'] in user_challenges

        return Response({
            'status': 'success',
            'data': data
        })


class JoinChallengeView(APIView):
    """Join a challenge"""
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, challenge_id):
        try:
            challenge = Challenge.objects.get(
                id=challenge_id,
                is_active=True,
                end_date__gt=timezone.now()
            )
        except Challenge.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Challenge not found or expired'
            }, status=status.HTTP_404_NOT_FOUND)

        # Check if already joined
        if UserChallenge.objects.filter(user=request.user, challenge=challenge).exists():
            return Response({
                'status': 'error',
                'message': 'Already joined this challenge'
            }, status=status.HTTP_400_BAD_REQUEST)

        user_challenge = UserChallenge.objects.create(
            user=request.user,
            challenge=challenge,
            progress=0,
            status='active'
        )

        return Response({
            'status': 'success',
            'message': 'Joined challenge successfully',
            'data': UserChallengeSerializer(user_challenge).data
        })


class LeaderboardView(APIView):
    """View leaderboard for top users"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get('limit', 50))

        # Get top users by points
        top_users = Reward.objects.select_related('user__profile').order_by('-points')[:limit]

        leaderboard = []
        for idx, reward in enumerate(top_users, 1):
            leaderboard.append({
                'rank': idx,
                'user_name': reward.user.profile.full_name,
                'points': reward.points,
                'level': reward.level,
                'avatar': reward.user.profile.avatar_url
            })

        # Get current user's rank
        user_reward = Reward.objects.get(user=request.user)
        user_rank = Reward.objects.filter(points__gt=user_reward.points).count() + 1

        return Response({
            'status': 'success',
            'data': {
                'leaderboard': leaderboard,
                'user_rank': user_rank,
                'user_points': user_reward.points
            }
        })