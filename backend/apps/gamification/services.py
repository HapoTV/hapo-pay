# apps/gamification/services.py
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from .models import Reward, UserAchievement, Achievement
import logging

logger = logging.getLogger(__name__)


class PointCalculatorService:
    """Calculate and award points for activities"""

    ACHIEVEMENT_BONUS_POINTS = 50

    @staticmethod
    @transaction.atomic
    def award_points(user, points, activity_type):
        """Award points to user and unlock any achievements now reached.

        The Reward row is locked for the read-modify-write so two concurrent
        awards cannot overwrite each other's total (previously a lost update).
        """
        Reward.objects.get_or_create(user=user)
        reward = Reward.objects.select_for_update().get(user=user)
        reward.add_points(points)

        # Check for achievements
        PointCalculatorService.check_achievements(user, reward)

        logger.info("Awarded %s points to %s for %s", points, user.email, activity_type)
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
        """Update daily streak.

        NOTE: this is still keyed off Reward.updated_at, which is auto_now and
        therefore bumped by *every* save (including add_points), so the streak
        cannot be computed correctly. Tracking a dedicated last_streak_date
        column is proposed in the audit; this function has no callers today.
        """
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
    def check_achievements(user, reward):
        """Unlock every achievement the user's point total now reaches.

        Iterative, not recursive. The previous version called award_points()
        for each unlock, which called check_achievements() again -- and because
        the bonus points could cross the next threshold, the pair recursed once
        per achievement tier, each level opening a nested atomic block. With
        densely spaced achievements this hit RecursionError, and because the
        stack unwound inside the caller's transaction it rolled back the
        payment that triggered it.

        Here the bonus is folded into the same locked Reward row and the loop
        simply re-runs until no further threshold is crossed.
        """
        already_earned = set(
            UserAchievement.objects
            .filter(user=user)
            .values_list('achievement_id', flat=True)
        )

        # Bounded by the number of achievement rows: each pass must unlock at
        # least one previously-unearned achievement or the loop stops.
        while True:
            newly_reached = list(
                Achievement.objects
                .filter(points_required__lte=reward.points)
                .exclude(id__in=already_earned)
            )
            if not newly_reached:
                break

            UserAchievement.objects.bulk_create(
                [UserAchievement(user=user, achievement=a) for a in newly_reached],
                ignore_conflicts=True,
            )

            for achievement in newly_reached:
                already_earned.add(achievement.id)
                logger.info("User %s unlocked achievement: %s", user.email, achievement.name)

            bonus = PointCalculatorService.ACHIEVEMENT_BONUS_POINTS * len(newly_reached)
            reward.add_points(bonus)