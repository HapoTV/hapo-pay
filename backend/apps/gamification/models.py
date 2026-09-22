# apps/gamification/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
import logging

logger = logging.getLogger(__name__)


class Reward(models.Model):
    """
    Represents a user's gamification profile including points, level, and streaks.

    Each user has exactly one Reward record that tracks their progress through
    the gamification system. Points accumulate through various activities like
    responsible spending, saving money, and completing challenges.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reward')
    points = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    level = models.IntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(100)])
    streak_days = models.IntegerField(default=0)
    total_saved = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rewards'

    def __str__(self):
        """Return a readable representation of the user's reward status."""
        return f"{self.user.email} - Level {self.level} - {self.points} points"

    def add_points(self, points):
        """
        Add points to the user's reward balance and check for level up.

        Args:
            points (int): Number of points to add (can be positive or negative)

        Returns:
            int: The new total points value

        Raises:
            ValueError: If points would result in a negative balance
        """
        try:
            if not isinstance(points, int):
                raise ValueError(f"Points must be an integer, got {type(points).__name__}")

            new_total = self.points + points
            if new_total < 0:
                raise ValueError(f"Cannot add {points} points: balance would become negative ({new_total})")

            self.points = new_total
            self.check_level_up()
            self.save(update_fields=['points', 'level', 'updated_at'])

            logger.info(f"Added {points} points to {self.user.email}. New total: {self.points}")
            return self.points

        except Exception as e:
            logger.error(f"Failed to add points for {self.user.email}: {str(e)}")
            raise

    def check_level_up(self):
        """
        Check if the user has earned enough points to reach the next level.

        Level formula: level = floor(points / 1000) + 1
        A user needs 1000 points per level increment.

        Returns:
            bool: True if the user leveled up, False otherwise
        """
        try:
            new_level = (self.points // 1000) + 1
            if new_level > self.level:
                old_level = self.level
                self.level = new_level
                logger.info(
                    f"User {self.user.email} leveled up from {old_level} to {self.level}"
                )
                return True
            return False

        except Exception as e:
            logger.error(f"Failed to check level up for {self.user.email}: {str(e)}")
            return False


class Achievement(models.Model):
    """
    Represents a milestone that users can unlock by earning points.

    Achievements are predefined badges that are automatically awarded
    when a user reaches the required points threshold.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField()
    points_required = models.IntegerField(validators=[MinValueValidator(0)])
    badge_icon = models.CharField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=50, default='general')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'achievements'

    def __str__(self):
        """Return the achievement name."""
        return self.name


class Challenge(models.Model):
    """
    Represents a time-limited challenge that users can join and complete.

    Challenges encourage specific behaviors like saving money, maintaining
    streaks, or responsible spending. Users earn reward points upon completion.
    """

    CHALLENGE_TYPES = [
        ('spending', 'Spending Challenge'),
        ('saving', 'Saving Challenge'),
        ('streak', 'Streak Challenge'),
        ('achievement', 'Achievement Challenge'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    challenge_type = models.CharField(max_length=20, choices=CHALLENGE_TYPES)
    target_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    reward_points = models.IntegerField(validators=[MinValueValidator(0)])
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'challenges'

    def __str__(self):
        """Return a readable representation of the challenge."""
        return f"{self.title} - {self.reward_points} points"


class UserAchievement(models.Model):
    """
    Tracks which achievements a user has earned.

    This is a join table between User and Achievement with the earned_at
    timestamp indicating when the user unlocked the achievement.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name='users')
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_achievements'
        unique_together = ['user', 'achievement']

    def __str__(self):
        """Return a readable representation of the user achievement."""
        return f"{self.user.email} - {self.achievement.name}"


class UserChallenge(models.Model):
    """
    Tracks a user's participation in a specific challenge.

    Stores the user's progress toward the challenge target and the
    current status (active, completed, or failed).
    """

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='challenges')
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='participants')
    progress = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    joined_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'user_challenges'
        unique_together = ['user', 'challenge']

    def __str__(self):
        """Return a readable representation of the user challenge."""
        return f"{self.user.email} - {self.challenge.title}"