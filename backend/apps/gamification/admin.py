# apps/gamification/admin.py
from django.contrib import admin
from .models import Reward, Achievement, Challenge, UserAchievement, UserChallenge

@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ('user', 'points', 'level', 'streak_days')
    search_fields = ('user__email',)

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('name', 'points_required', 'badge_icon')
    search_fields = ('name',)

@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ('title', 'reward_points', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active', 'start_date', 'end_date')

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'earned_at')
    list_filter = ('earned_at',)

@admin.register(UserChallenge)
class UserChallengeAdmin(admin.ModelAdmin):
    list_display = ('user', 'challenge', 'progress', 'status', 'joined_at')
    list_filter = ('status',)