# apps/gamification/admin.py
from django.contrib import admin
from .models import Reward, Achievement, Challenge, UserAchievement, UserChallenge

@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Reward model.

    Provides list display, search, and filter options for managing
    user reward profiles.
    """
    list_display = ('user', 'points', 'level', 'streak_days')
    list_filter = ('level',)
    search_fields = ('user__email',)
    readonly_fields = ('updated_at',)


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Achievement model.

    Allows admins to create and manage achievement definitions.
    """
    list_display = ('name', 'points_required', 'category', 'badge_icon')
    list_filter = ('category',)
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)


@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Challenge model.

    Provides filtering by active status and date range for managing
    available challenges.
    """
    list_display = ('title', 'challenge_type', 'reward_points', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active', 'challenge_type', 'start_date', 'end_date')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at',)


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    """
    Admin configuration for the UserAchievement model.

    Read-only admin view for tracking which users have earned which
    achievements.
    """
    list_display = ('user', 'achievement', 'earned_at')
    list_filter = ('earned_at', 'achievement')
    search_fields = ('user__email', 'achievement__name')
    readonly_fields = ('earned_at',)


@admin.register(UserChallenge)
class UserChallengeAdmin(admin.ModelAdmin):
    """
    Admin configuration for the UserChallenge model.

    Allows admins to view and manage user participation in challenges.
    """
    list_display = ('user', 'challenge', 'progress', 'status', 'joined_at')
    list_filter = ('status', 'joined_at')
    search_fields = ('user__email', 'challenge__title')
    readonly_fields = ('joined_at', 'completed_at')