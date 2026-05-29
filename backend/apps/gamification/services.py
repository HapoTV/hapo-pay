# apps/gamification/services.py
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from .models import Reward, UserAchievement, Achievement
import logging

logger = logging.getLogger(__name__)


class PointCalculatorService:
    """Calculate and award points for activities"""

    @staticmethod
    @transaction.atomic
    def award_points(user, points, activity_type):
        """Award points to user"""
        reward, created = Reward.objects.get_or_create(user=user)
        reward.add_points(points)

        # Check for achievements
        PointCalculatorService.check_achievements(user, reward.points)

        logger.info(f"Awarded {points} points to {user.email} for {activity_type}")
        return reward.points

    @staticmethod
    def calculate_spending_points(student, amount, category):
        """Calculate points for spending (encourages responsible spending)"""
        base_points = int(amount / 10)  # 1 point per R10 spent

        # Bonus for responsible categories
        responsible_categories = ['education', 'savings', 'health']
        if category in responsible_categories:
            base_points *= 2

        # Limit points per transaction
        return min(base_points, 100)

    @staticmethod
    def calculate_saving_points(student, amount):
        """Calculate points for saving money"""
        points = int(amount / 5)  # 1 point per R5 saved
        return min(points, 200)

    @staticmethod
    def update_streak(user):
        """Update daily streak"""
        reward = Reward.objects.get(user=user)

        # Check if last update was yesterday
        from datetime import timedelta
        if reward.updated_at.date() == timezone.now().date() - timedelta(days=1):
            reward.streak_days += 1
            reward.save()

            # Bonus for streak milestones
            if reward.streak_days in [7, 30, 100, 365]:
                PointCalculatorService.award_points(user, reward.streak_days * 10, 'streak_bonus')
        elif reward.updated_at.date() < timezone.now().date() - timedelta(days=1):
            # Streak broken
            reward.streak_days = 0
            reward.save()

    @staticmethod
    def check_achievements(user, total_points):
        """Check and award achievements based on points"""
        achievements = Achievement.objects.filter(points_required__lte=total_points)

        for achievement in achievements:
            if not UserAchievement.objects.filter(user=user, achievement=achievement).exists():
                UserAchievement.objects.create(user=user, achievement=achievement)
                # Award bonus points for achievement
                PointCalculatorService.award_points(user, 50, 'achievement_unlocked')
                logger.info(f"User {user.email} unlocked achievement: {achievement.name}")