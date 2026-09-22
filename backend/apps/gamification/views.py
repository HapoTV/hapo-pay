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
    """
    ViewSet for retrieving the authenticated user's reward profile.

    Endpoints:
        GET /rewards/         - List (returns own reward)
        GET /rewards/{id}/    - Retrieve (returns own reward with achievements)
    """

    serializer_class = RewardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Return only the authenticated user's reward profile.

        Users cannot view other users' rewards through this endpoint.
        """
        try:
            return Reward.objects.filter(user=self.request.user)
        except Exception as e:
            logger.error(f"Error fetching rewards for {self.request.user}: {str(e)}")
            return Reward.objects.none()

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve the user's reward profile with recent achievements.

        Returns a combined response containing both the reward data
        and the user's 5 most recent achievements.

        Raises:
            404: If the user has no Reward profile
        """
        try:
            reward = Reward.objects.get(user=request.user)
            serializer = self.get_serializer(reward)

            recent_achievements = UserAchievement.objects.filter(
                user=request.user
            ).order_by('-earned_at')[:5]

            return Response({
                'status': 'success',
                'data': {
                    'reward': serializer.data,
                    'recent_achievements': UserAchievementSerializer(
                        recent_achievements, many=True
                    ).data
                }
            })

        except Reward.DoesNotExist:
            logger.warning(f"No reward found for {request.user.email}")
            return Response({
                'status': 'error',
                'message': 'Reward profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error retrieving reward for {request.user}: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to retrieve reward profile'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing all available achievements.

    Endpoints:
        GET /achievements/         - List all achievements with earned status
        GET /achievements/{id}/    - Retrieve a specific achievement
    """

    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        """
        List all achievements, marking which ones the user has earned.

        Returns a list of achievements with an 'earned' boolean flag
        and the 'earned_at' timestamp for earned achievements.
        """
        try:
            queryset = self.get_queryset()

            # Get user's earned achievements
            earned_achievements = UserAchievement.objects.filter(
                user=request.user
            ).values('achievement_id', 'earned_at')

            earned_map = {
                str(ua['achievement_id']): ua['earned_at']
                for ua in earned_achievements
            }

            serializer = self.get_serializer(queryset, many=True)
            data = serializer.data

            # Mark which achievements are earned
            for achievement in data:
                achievement_id = str(achievement['id'])
                achievement['earned'] = achievement_id in earned_map
                achievement['earned_at'] = earned_map.get(achievement_id)

            return Response({
                'status': 'success',
                'data': data
            })

        except Exception as e:
            logger.error(f"Error listing achievements for {request.user}: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to retrieve achievements'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChallengeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing active challenges available to students.

    Endpoints:
        GET /challenges/         - List all active challenges
        GET /challenges/{id}/    - Retrieve a specific challenge
    """

    queryset = Challenge.objects.filter(is_active=True, end_date__gt=timezone.now())
    serializer_class = ChallengeSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def list(self, request, *args, **kwargs):
        """
        List active challenges, marking which ones the user has joined.

        Returns a list of challenges with a 'joined' boolean flag
        and the user's 'progress' for challenges they have joined.
        """
        try:
            queryset = self.get_queryset()

            # Get user's joined challenges with progress
            user_challenges = UserChallenge.objects.filter(
                user=request.user
            ).values('challenge_id', 'status', 'progress')

            joined_map = {
                str(uc['challenge_id']): {
                    'status': uc['status'],
                    'progress': float(uc['progress'])
                }
                for uc in user_challenges
            }

            serializer = self.get_serializer(queryset, many=True)
            data = serializer.data

            # Mark which challenges are joined
            for challenge in data:
                challenge_id = str(challenge['id'])
                if challenge_id in joined_map:
                    challenge['joined'] = True
                    challenge['user_status'] = joined_map[challenge_id]['status']
                    challenge['user_progress'] = joined_map[challenge_id]['progress']
                else:
                    challenge['joined'] = False

            return Response({
                'status': 'success',
                'data': data
            })

        except Exception as e:
            logger.error(f"Error listing challenges for {request.user}: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to retrieve challenges'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JoinChallengeView(APIView):
    """
    API endpoint for joining a challenge.

    Endpoints:
        POST /challenges/{challenge_id}/join/

    Validates that the challenge exists, is active, not expired, and
    that the user hasn't already joined it.
    """

    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, challenge_id):
        """
        Join a specific challenge.

        Args:
            challenge_id (UUID): The ID of the challenge to join

        Returns:
            200: Challenge joined successfully with the UserChallenge data
            400: Challenge already joined
            404: Challenge not found or expired
            500: Server error during join
        """
        try:
            challenge = Challenge.objects.get(
                id=challenge_id,
                is_active=True,
                end_date__gt=timezone.now()
            )

        except Challenge.DoesNotExist:
            logger.warning(f"Challenge {challenge_id} not found for user {request.user}")
            return Response({
                'status': 'error',
                'message': 'Challenge not found or expired'
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error looking up challenge {challenge_id}: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to lookup challenge'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            # Check if already joined
            if UserChallenge.objects.filter(user=request.user, challenge=challenge).exists():
                return Response({
                    'status': 'error',
                    'message': 'Already joined this challenge'
                }, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                user_challenge = UserChallenge.objects.create(
                    user=request.user,
                    challenge=challenge,
                    progress=0,
                    status='active'
                )

            logger.info(f"User {request.user.email} joined challenge: {challenge.title}")

            return Response({
                'status': 'success',
                'message': 'Joined challenge successfully',
                'data': UserChallengeSerializer(user_challenge).data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Failed to join challenge for {request.user}: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to join challenge'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LeaderboardView(APIView):
    """
    API endpoint for retrieving the global leaderboard.

    Endpoints:
        GET /leaderboard/?limit=50

    Returns the top N users by points along with the current user's rank.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve the leaderboard with top users and current user's rank.

        Query Parameters:
            limit (int): Number of top users to return (default: 50, max: 100)

        Returns:
            200: Leaderboard data with top users and current user's position
            500: Server error during retrieval
        """
        try:
            # Validate and cap the limit parameter
            try:
                limit = int(request.query_params.get('limit', 50))
                limit = max(1, min(limit, 100))
            except (ValueError, TypeError):
                limit = 50

            # Get top users by points
            top_users = Reward.objects.select_related('user__profile').order_by('-points')[:limit]

            leaderboard = []
            for idx, reward in enumerate(top_users, 1):
                try:
                    full_name = reward.user.profile.full_name
                    avatar_url = reward.user.profile.avatar_url
                except Exception:
                    full_name = reward.user.email
                    avatar_url = None

                leaderboard.append({
                    'rank': idx,
                    'user_name': full_name,
                    'points': reward.points,
                    'level': reward.level,
                    'avatar': avatar_url
                })

            # Get current user's rank
            try:
                user_reward = Reward.objects.get(user=request.user)
                user_rank = Reward.objects.filter(points__gt=user_reward.points).count() + 1
                user_points = user_reward.points
            except Reward.DoesNotExist:
                user_rank = None
                user_points = 0

            return Response({
                'status': 'success',
                'data': {
                    'leaderboard': leaderboard,
                    'user_rank': user_rank,
                    'user_points': user_points,
                    'total_participants': Reward.objects.count()
                }
            })

        except Exception as e:
            logger.error(f"Failed to retrieve leaderboard for {request.user}: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to retrieve leaderboard'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)