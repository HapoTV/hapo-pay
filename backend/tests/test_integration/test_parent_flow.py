# tests/test_integration/test_parent_flow.py
"""End-to-end tests for parent workflows."""
import pytest
from django.urls import reverse


@pytest.mark.django_db
class TestParentFlow:
    """Full parent journey: add child → transfer → view transactions."""

    def test_full_parent_flow(self, authenticated_parent, parent_user):
        # 1. Add a child
        url = reverse('children-list')
        response = authenticated_parent.post(url, {
            'email': 'newchild@test.com',
            'full_name': 'New Child',
            'grade': 9,
        }, format='json')
        assert response.status_code == 201
        child_id = response.data['data']['id']

        # 2. Transfer to child
        url = reverse('transfer-funds')
        response = authenticated_parent.post(url, {
            'recipient_id': child_id,
            'amount': '100.00',
            'description': 'Weekly allowance',
        }, format='json')
        assert response.status_code == 200

        # 3. View child transactions
        url = reverse('child-transactions', kwargs={'child_id': child_id})
        response = authenticated_parent.get(url)
        assert response.status_code == 200
        assert len(response.data['data']) >= 1