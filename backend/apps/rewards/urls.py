from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RewardViewSet, AchievementViewSet

router = DefaultRouter()
router.register(r"points", RewardViewSet, basename="reward")
router.register(r"achievements", AchievementViewSet, basename="achievement")

urlpatterns = [path("", include(router.urls))]
