# apps/gamification/services.py
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from .models import Reward, UserAchievement, Achievement
import logging

logger = logging.getLogger(__name__)


class PointCalculatorService:
    """Calculate and award points for activities"""

    ACHIEVEMENT_BONUS_POINTS = 50
    STREAK_MILESTONES = frozenset({7, 30, 100, 365})

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
        """Record activity for today and maintain the consecutive-day streak.

        Idempotent per day: calling it repeatedly on the same date is a no-op,
        so it can safely be invoked from any activity path.

        This used to compare `Reward.updated_at.date()` against yesterday.
        `updated_at` is auto_now, so awarding points -- or any other save --
        moved it, meaning the streak was measuring "last time this row changed"
        rather than "last day the user was active". It now reads a dedicated
        last_streak_date column that only this method writes.
        """
        today = timezone.localdate()

        with transaction.atomic():
            Reward.objects.get_or_create(user=user)
            reward = Reward.objects.select_for_update().get(user=user)

            last = reward.last_streak_date

            if last == today:
                # Already counted today.
                return reward.streak_days

            if last == today - timedelta(days=1):
                reward.streak_days += 1
            else:
                # First ever activity, or the chain was broken. Today counts
                # as day one rather than zero -- the user *is* active now.
                reward.streak_days = 1

            reward.last_streak_date = today
            reward.save(update_fields=['streak_days', 'last_streak_date', 'updated_at'])

            milestone_reached = reward.streak_days in PointCalculatorService.STREAK_MILESTONES

        # Awarded outside the block above so the bonus (which opens its own
        # atomic block and takes the same row lock) cannot nest inside it.
        if milestone_reached:
            PointCalculatorService.award_points(
                user, reward.streak_days * 10, 'streak_bonus'
            )

        return reward.streak_days

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