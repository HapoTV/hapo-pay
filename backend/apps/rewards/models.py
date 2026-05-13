"""Rewards and gamification models."""
from django.db import models


class Reward(models.Model):
    child = models.OneToOneField(
        "children.Child", on_delete=models.CASCADE, related_name="reward"
    )
    points = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    total_earned = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "rewards"

    def __str__(self):
        return f"{self.child} — {self.points} pts (level {self.level})"


class Achievement(models.Model):
    child = models.ForeignKey(
        "children.Child", on_delete=models.CASCADE, related_name="achievements"
    )
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    badge_url = models.URLField(blank=True)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "achievements"

    def __str__(self):
        return f"{self.child} — {self.title}"
