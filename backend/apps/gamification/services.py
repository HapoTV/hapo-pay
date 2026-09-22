# apps/gamification/services.py
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from .models import Reward, UserAchievement, Achievement
import logging

logger = logging.getLogger(__name__)


class PointCalculatorService:
    """
    Service for calculating and awarding points based on user activities.

    This service encapsulates all point-related business logic including:
    - Awarding points for various activities
    - Calculating points for spending and saving
    - Managing daily streaks
    - Automatically unlocking achievements
    """

    @staticmethod
    @transaction.atomic
    def award_points(user, points, activity_type):
        """
        Award points to a user for a specific activity.

        This method is atomic - if any part fails (e.g., achievement unlock),
        the entire transaction rolls back to keep data consistent.

        Args:
            user: The User instance to award points to
            points (int): Number of points to award
            activity_type (str): Description of the activity (for logging)

        Returns:
            int: The user's new total points

        Raises:
            ValueError: If user is None or points is invalid
            Exception: For database errors during the transaction
        """
        try:
            if user is None:
                raise ValueError("User cannot be None")
            if not isinstance(points, int) or points < 0:
                raise ValueError(f"Points must be a non-negative integer, got {points}")

            reward, created = Reward.objects.get_or_create(user=user)

            if created:
                logger.info(f"Created new Reward profile for {user.email}")

            reward.add_points(points)

            # Check for newly unlocked achievements
            PointCalculatorService.check_achievements(user, reward.points)

            logger.info(f"Awarded {points} points to {user.email} for {activity_type}")
            return reward.points

        except Exception as e:
            logger.error(f"Failed to award points to {user}: {str(e)}")
            raise

    @staticmethod
    def calculate_spending_points(student, amount, category):
        """
        Calculate points earned from a spending transaction.

        Points are awarded at 1 point per R10 spent, with a 2x multiplier
        for responsible categories (education, savings, health).

        Args:
            student: The User making the purchase
            amount: Decimal or float amount spent
            category (str): Transaction category

        Returns:
            int: Points earned (capped at 100 per transaction)

        Raises:
            ValueError: If amount is negative or invalid
        """
        try:
            if amount is None or float(amount) < 0:
                raise ValueError(f"Amount must be non-negative, got {amount}")

            base_points = int(float(amount) / 10)  # 1 point per R10 spent

            # Bonus for responsible categories
            responsible_categories = ['education', 'savings', 'health']
            if category in responsible_categories:
                base_points *= 2

            # Limit points per transaction
            return min(base_points, 100)

        except Exception as e:
            logger.error(f"Failed to calculate spending points: {str(e)}")
            return 0

    @staticmethod
    def calculate_saving_points(student, amount):
        """
        Calculate points earned from saving money.

        Points are awarded at 1 point per R5 saved, capped at 200 points.

        Args:
            student: The User saving money
            amount: Decimal or float amount saved

        Returns:
            int: Points earned (capped at 200)

        Raises:
            ValueError: If amount is negative or invalid
        """
        try:
            if amount is None or float(amount) < 0:
                raise ValueError(f"Amount must be non-negative, got {amount}")

            points = int(float(amount) / 5)  # 1 point per R5 saved
            return min(points, 200)

        except Exception as e:
            logger.error(f"Failed to calculate saving points: {str(e)}")
            return 0

    @staticmethod
    @transaction.atomic
    def update_streak(user):
        """
        Update the user's daily activity streak.

        Increments the streak if the user was last active yesterday.
        Resets the streak to 0 if the user missed a day.
        Awards bonus points for streak milestones (7, 30, 100, 365 days).

        Args:
            user: The User whose streak to update

        Returns:
            int: The user's current streak count

        Raises:
            Reward.DoesNotExist: If the user has no Reward profile
        """
        try:
            reward = Reward.objects.select_for_update().get(user=user)

            from datetime import timedelta
            today = timezone.now().date()
            last_update = reward.updated_at.date()

            if last_update == today - timedelta(days=1):
                # Consecutive day - increment streak
                reward.streak_days += 1
                reward.save(update_fields=['streak_days', 'updated_at'])

                logger.info(f"Streak updated for {user.email}: {reward.streak_days} days")

                # Bonus for streak milestones
                if reward.streak_days in [7, 30, 100, 365]:
                    PointCalculatorService.award_points(
                        user,
                        reward.streak_days * 10,
                        f'streak_milestone_{reward.streak_days}'
                    )

            elif last_update < today - timedelta(days=1):
                # Streak broken - reset
                old_streak = reward.streak_days
                reward.streak_days = 0
                reward.save(update_fields=['streak_days', 'updated_at'])
                logger.info(
                    f"Streak reset for {user.email} (was {old_streak} days)"
                )

            return reward.streak_days

        except Reward.DoesNotExist:
            logger.warning(f"No reward profile found for {user.email}")
            raise
        except Exception as e:
            logger.error(f"Failed to update streak for {user.email}: {str(e)}")
            raise

    @staticmethod
    def check_achievements(user, total_points):
        """
        Check and unlock any achievements the user now qualifies for.

        Iterates through all achievements whose points_required is less than
        or equal to the user's total points. Awards each new achievement
        and gives bonus points for unlocking.

        Args:
            user: The User to check achievements for
            total_points (int): The user's current total points

        Returns:
            list: List of newly unlocked Achievement instances

        Raises:
            Exception: For database errors during the check
        """
        try:
            if total_points is None or total_points < 0:
                raise ValueError(f"Invalid total_points: {total_points}")

            newly_unlocked = []
            eligible_achievements = Achievement.objects.filter(
                points_required__lte=total_points
            )

            for achievement in eligible_achievements:
                already_earned = UserAchievement.objects.filter(
                    user=user,
                    achievement=achievement
                ).exists()

                if not already_earned:
                    UserAchievement.objects.create(user=user, achievement=achievement)
                    newly_unlocked.append(achievement)

                    logger.info(
                        f"User {user.email} unlocked achievement: {achievement.name}"
                    )

                    # Award bonus points for the achievement
                    try:
                        reward = Reward.objects.get(user=user)
                        reward.points += 50
                        reward.check_level_up()
                        reward.save(update_fields=['points', 'level', 'updated_at'])
                    except Reward.DoesNotExist:
                        logger.warning(f"Cannot award achievement bonus: no reward for {user.email}")

            if newly_unlocked:
                logger.info(
                    f"User {user.email} unlocked {len(newly_unlocked)} achievement(s)"
                )

            return newly_unlocked

        except Exception as e:
            logger.error(f"Failed to check achievements for {user}: {str(e)}")
            return []