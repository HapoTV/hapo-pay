# apps/gamification/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class Reward(models.Model):
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
        return f"{self.user.email} - Level {self.level} - {self.points} points"

    def add_points(self, points):
        self.points += points
        self.check_level_up()
        self.save()

    def check_level_up(self):
        new_level = (self.points // 1000) + 1
        if new_level > self.level:
            self.level = new_level


class Achievement(models.Model):
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
        return self.name


class Challenge(models.Model):
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
        return f"{self.title} - {self.reward_points} points"


class UserAchievement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name='users')
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_achievements'
        unique_together = ['user', 'achievement']

    def __str__(self):
        return f"{self.user.email} - {self.achievement.name}"


class UserChallenge(models.Model):
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
        return f"{self.user.email} - {self.challenge.title}"
