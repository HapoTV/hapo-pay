# Gamification Data Structure

This document details the data entities and relationships within the Hapo-Pay gamification module.

## 1. Entity Relationship Diagram (Conceptual)

- **Child** (1) <---> (1) **Reward**
- **Child** (1) <---> (N) **Achievement**
- **Child** (1) <---> (N) **Streak**
- **Achievement** (N) <---> (1) **Badge**

## 2. Model Definitions

### 2.1 Reward Profile
Stores the primary metrics for a child's gamification status.
- `id`: UUID (Primary Key)
- `child_id`: ForeignKey (to Child)
- `total_points`: Integer (Cumulative lifetime points)
- `available_points`: Integer (Points available for redemption)
- `level`: Integer (Current progress tier)
- `last_activity_at`: DateTime

### 2.2 Achievements
Stores individual milestones reached by the child.
- `id`: UUID
- `child_id`: ForeignKey
- `type`: String (e.g., 'SAVINGS_GOAL', 'STREAK_7_DAYS')
- `metadata`: JSON (Specific details about the achievement)
- `earned_at`: DateTime

### 2.3 Streaks
Tracks consecutive performance metrics.
- `id`: UUID
- `child_id`: ForeignKey
- `streak_type`: String ('LOGIN', 'BUDGET_ADHERENCE')
- `current_count`: Integer
- `highest_count`: Integer
- `last_increment_at`: DateTime

## 3. Python Implementation Strategy

Using Django signals or a dedicated service layer to decouple gamification from core financial logic.

```python
# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.transactions.models import Transaction
from .services import GamificationService

@receiver(post_save, sender=Transaction)
def analyze_transaction_for_rewards(sender, instance, created, **kwargs):
    if created:
        GamificationService.process_transaction(instance)
```

## 4. C-Level Memory Layout (Conceptual)

For high-performance analytical nodes or embedded caching layers.

```c
struct RewardPacket {
    uint32_t child_id;
    uint32_t transaction_id;
    float amount;
    uint8_t transaction_type; // 0: Spend, 1: Save, 2: Transfer
};

struct GamingState {
    uint32_t points;
    uint16_t level;
    uint16_t streak_days;
};
```
