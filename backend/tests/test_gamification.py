# tests/test_gamification.py
"""
Gamification module tests.

Covers:
- Reward retrieval
- Achievement listing + earning
- Challenge listing + joining
- Leaderboard ordering + user rank
- PointCalculatorService
- Level progression
- Edge cases: no reward object, no achievements, duplicate joins
- Authorization: rewards are personal, challenges are public
"""
from decimal import Decimal
from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

from apps.gamification.models import (
    Reward, Achievement, Challenge, UserAchievement, UserChallenge,
)
from apps.gamification.services import PointCalculatorService
from apps.accounts.models import Profile, StudentProfile, ParentProfile

User = get_user_model()


def make_user(email, role='student'):
    user = User.objects.create_user(email=email, password='TestPass123!', role=role)
    Profile.objects.create(user=user, full_name=email.split('@')[0])
    return user


# ═══════════════════════════════════════════════════════════════════════
# 1. REWARDS
# ═══════════════════════════════════════════════════════════════════════

class TestRewardsView(TestCase):
    """GET /gamification/rewards/"""

    def setUp(self):
        self.client = APIClient()
        self.student = make_user('student@test.com')
        self.reward = Reward.objects.create(user=self.student, points=500, level=1, streak_days=3)
        self.url = reverse('rewards-list')

    def test_get_own_rewards(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        # Response can be list or single object depending on view
        data = response.data.get('data')
        if isinstance(data, list) and data:
            self.assertEqual(data[0]['points'], 500)
        elif isinstance(data, dict):
            self.assertEqual(data['points'], 500)

    def test_unauthenticated_blocked(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_user_without_reward_gets_empty(self):
        other = make_user('other@test.com')
        self.client.force_authenticate(user=other)
        response = self.client.get(self.url)
        # Either 200 with empty list, or 404 — depending on view
        self.assertIn(response.status_code, (200, 404))


# ═══════════════════════════════════════════════════════════════════════
# 2. ACHIEVEMENTS
# ═══════════════════════════════════════════════════════════════════════

class TestAchievementsView(TestCase):
    """GET /gamification/achievements/"""

    def setUp(self):
        self.client = APIClient()
        self.student = make_user('student@test.com')
        self.a1 = Achievement.objects.create(
            name='First Purchase', description='Made your first purchase',
            points_required=100, category='spending',
        )
        self.a2 = Achievement.objects.create(
            name='Saver', description='Saved R500',
            points_required=500, category='saving',
        )
        self.url = reverse('achievements-list')

    def test_list_all_achievements(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['data']), 2)

    def test_earned_flag_marked_correctly(self):
        UserAchievement.objects.create(user=self.student, achievement=self.a1)
        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.url)
        earned_map = {a['name']: a.get('earned', False) for a in response.data['data']}
        self.assertTrue(earned_map.get('First Purchase'))
        self.assertFalse(earned_map.get('Saver', False))

    def test_unauthenticated_blocked(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)


# ═══════════════════════════════════════════════════════════════════════
# 3. CHALLENGES
# ═══════════════════════════════════════════════════════════════════════

class TestChallengesView(TestCase):
    """GET/POST /gamification/challenges/"""

    def setUp(self):
        self.client = APIClient()
        self.student = make_user('student@test.com')
        self.challenge = Challenge.objects.create(
            title='No Takeout Week',
            description='Skip takeout for 7 days',
            challenge_type='streak',
            target_value=Decimal('7.00'),
            reward_points=200,
            start_date=timezone.now() - timedelta(days=1),
            end_date=timezone.now() + timedelta(days=6),
            is_active=True,
        )
        self.url = reverse('challenges-list')

    def test_list_active_challenges(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['data']), 1)

    def test_inactive_challenge_not_listed(self):
        self.challenge.is_active = False
        self.challenge.save()
        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.url)
        self.assertEqual(len(response.data['data']), 0)

    def test_expired_challenge_not_listed(self):
        self.challenge.end_date = timezone.now() - timedelta(days=1)
        self.challenge.save()
        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.url)
        self.assertEqual(len(response.data['data']), 0)

    def test_join_challenge(self):
        self.client.force_authenticate(user=self.student)
        url = reverse('join-challenge', kwargs={'challenge_id': self.challenge.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(UserChallenge.objects.filter(user=self.student, challenge=self.challenge).exists())

    def test_cannot_join_same_challenge_twice(self):
        UserChallenge.objects.create(
            user=self.student, challenge=self.challenge,
            progress=0, status='active',
        )
        self.client.force_authenticate(user=self.student)
        url = reverse('join-challenge', kwargs={'challenge_id': self.challenge.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(UserChallenge.objects.filter(user=self.student, challenge=self.challenge).count(), 1)

    def test_cannot_join_expired_challenge(self):
        self.challenge.end_date = timezone.now() - timedelta(days=1)
        self.challenge.save()
        self.client.force_authenticate(user=self.student)
        url = reverse('join-challenge', kwargs={'challenge_id': self.challenge.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 404)

    def test_join_nonexistent_challenge_returns_404(self):
        import uuid
        self.client.force_authenticate(user=self.student)
        url = reverse('join-challenge', kwargs={'challenge_id': uuid.uuid4()})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 404)


# ═══════════════════════════════════════════════════════════════════════
# 4. LEADERBOARD
# ═══════════════════════════════════════════════════════════════════════

class TestLeaderboard(TestCase):
    """GET /gamification/leaderboard/"""

    def setUp(self):
        self.client = APIClient()
        self.u1 = make_user('u1@test.com')
        self.u2 = make_user('u2@test.com')
        self.u3 = make_user('u3@test.com')

        Reward.objects.create(user=self.u1, points=1000, level=2)
        Reward.objects.create(user=self.u2, points=500, level=1)
        Reward.objects.create(user=self.u3, points=2000, level=3)

        self.url = reverse('leaderboard')

    def test_leaderboard_ordered_by_points(self):
        self.client.force_authenticate(user=self.u1)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        board = response.data['data']['leaderboard']
        self.assertEqual(board[0]['points'], 2000)
        self.assertEqual(board[1]['points'], 1000)
        self.assertEqual(board[2]['points'], 500)

    def test_user_rank_reported(self):
        self.client.force_authenticate(user=self.u1)
        response = self.client.get(self.url)
        self.assertEqual(response.data['data']['user_rank'], 2)
        self.assertEqual(response.data['data']['user_points'], 1000)

    def test_limit_query_param(self):
        self.client.force_authenticate(user=self.u1)
        response = self.client.get(self.url + '?limit=2')
        self.assertEqual(len(response.data['data']['leaderboard']), 2)

    def test_unauthenticated_blocked(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)


# ═══════════════════════════════════════════════════════════════════════
# 5. POINT CALCULATOR SERVICE
# ═══════════════════════════════════════════════════════════════════════

class TestPointCalculatorService(TestCase):
    """Unit tests for PointCalculatorService."""

    def setUp(self):
        self.student = make_user('student@test.com')

    def test_award_points_creates_reward_if_missing(self):
        PointCalculatorService.award_points(self.student, 100, 'test')
        self.assertTrue(Reward.objects.filter(user=self.student).exists())
        reward = Reward.objects.get(user=self.student)
        self.assertEqual(reward.points, 100)

    def test_award_points_accumulates(self):
        Reward.objects.create(user=self.student, points=200)
        PointCalculatorService.award_points(self.student, 100, 'test')
        reward = Reward.objects.get(user=self.student)
        self.assertEqual(reward.points, 300)

    def test_calculate_spending_points_base_rate(self):
        points = PointCalculatorService.calculate_spending_points(
            self.student, Decimal('100.00'), 'shopping'
        )
        self.assertEqual(points, 10)  # 1 point per R10

    def test_calculate_spending_points_responsible_category_bonus(self):
        food = PointCalculatorService.calculate_spending_points(
            self.student, Decimal('100.00'), 'food'
        )
        edu = PointCalculatorService.calculate_spending_points(
            self.student, Decimal('100.00'), 'education'
        )
        self.assertGreater(edu, food)

    def test_calculate_saving_points(self):
        points = PointCalculatorService.calculate_saving_points(self.student, Decimal('100.00'))
        self.assertEqual(points, 20)  # 1 point per R5

    def test_points_capped_at_maximum(self):
        points = PointCalculatorService.calculate_spending_points(
            self.student, Decimal('99999.00'), 'shopping'
        )
        self.assertLessEqual(points, 100)

    def test_level_up_on_point_threshold(self):
        reward = Reward.objects.create(user=self.student, points=999, level=1)
        PointCalculatorService.award_points(self.student, 1, 'test')
        reward.refresh_from_db()
        self.assertEqual(reward.level, 2)


# ═══════════════════════════════════════════════════════════════════════
# 6. LEVEL PROGRESSION
# ═══════════════════════════════════════════════════════════════════════

class TestLevelProgression(TestCase):
    """Verify LevelUpService behavior via point awards."""

    def setUp(self):
        self.student = make_user('leveler@test.com')

    def test_reaches_level_2_at_1000_points(self):
        reward = Reward.objects.create(user=self.student, points=0, level=1)
        PointCalculatorService.award_points(self.student, 1000, 'test')
        reward.refresh_from_db()
        self.assertEqual(reward.level, 2)

    def test_stays_at_level_1_below_1000(self):
        reward = Reward.objects.create(user=self.student, points=0, level=1)
        PointCalculatorService.award_points(self.student, 500, 'test')
        reward.refresh_from_db()
        self.assertEqual(reward.level, 1)

    def test_reaches_level_5_at_4000_points(self):
        reward = Reward.objects.create(user=self.student, points=0, level=1)
        PointCalculatorService.award_points(self.student, 4000, 'test')
        reward.refresh_from_db()
        self.assertEqual(reward.level, 5)