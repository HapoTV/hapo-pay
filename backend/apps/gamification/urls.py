# apps/gamification/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'rewards', views.RewardViewSet, basename='rewards')
router.register(r'achievements', views.AchievementViewSet, basename='achievements')
router.register(r'challenges', views.ChallengeViewSet, basename='challenges')

urlpatterns = [
    path('', include(router.urls)),
    path('challenges/<uuid:challenge_id>/join/', views.JoinChallengeView.as_view(), name='join-challenge'),
    path('leaderboard/', views.LeaderboardView.as_view(), name='leaderboard'),
]