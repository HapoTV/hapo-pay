# tests/test_gamification.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.gamification.models import Reward, Achievement

User = get_user_model()


class GamificationTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            email='test@test.com',
            password='TestPass123!',
            role='student'
        )

        self.reward = Reward.objects.create(user=self.user, points=500, level=1)

        self.achievement = Achievement.objects.create(
            name='First Purchase',
            description='Make your first purchase',
            points_required=100,
            category='spending'
        )

        self.rewards_url = reverse('rewards-list')
        self.achievements_url = reverse('achievements-list')

    def test_get_rewards(self):
        """Test getting user rewards"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.rewards_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['reward']['points'], 500)

    def test_get_achievements(self):
        """Test getting achievements"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.achievements_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['data']), 1)

    def test_leaderboard(self):
        """Test leaderboard functionality"""
        self.client.force_authenticate(user=self.user)

        url = reverse('leaderboard')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['user_points'], 500)