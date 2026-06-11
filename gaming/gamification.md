# Hapo-Pay Gamification Engine

This document outlines the architecture, data flow, and structural design of the gamification engine for the Hapo-Pay application.

## 1. Overview
The Hapo-Pay gamification engine is designed to incentivize healthy financial habits in children through points, levels, and achievements. It transforms financial literacy and responsible spending into an engaging experience.

## 2. Core Components

### 2.1 Points System
- **Earnable Points:** Reward for saving, staying within limits, or completing educational tasks.
- **Redeemable Points:** Can be exchanged for parent-approved rewards.
- **Lifetime Points:** Determines the user's level.

### 2.2 Leveling Architecture
Levels are calculated based on cumulative lifetime points. Each level can unlock new badges or features.

### 2.3 Achievements & Badges
Milestone-based rewards (e.g., "First $50 Saved", "30-Day Budget Streak").

### 2.4 Streaks
Tracking consecutive days of engagement or adherence to budget limits.

---

## 3. Data Structure

### 3.1 Backend Models (Django/Python)

```python
from django.db import models

class Reward(models.Model):
    child = models.OneToOneField("children.Child", on_delete=models.CASCADE)
    current_points = models.IntegerField(default=0)
    lifetime_points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    
    def add_points(self, amount):
        self.current_points += amount
        self.lifetime_points += amount
        self.check_level_up()
        self.save()

    def check_level_up(self):
        # Example level logic: Level = sqrt(lifetime_points / 100)
        new_level = int((self.lifetime_points / 100) ** 0.5) + 1
        if new_level > self.level:
            self.level = new_level
            # Trigger level-up notification event
```

### 3.2 Performance Critical Logic (Conceptual C Implementation)
For high-frequency event processing (e.g., real-time transaction analysis for streaks), a low-level implementation might be used for efficiency.

```c
typedef struct {
    unsigned int child_id;
    unsigned int lifetime_points;
    unsigned short level;
} PlayerStats;

/**
 * Optimized level calculation using integer math
 */
unsigned short calculate_level(unsigned int lifetime_points) {
    if (lifetime_points < 100) return 1;
    // Fast integer square root approximation or lookup table
    return (unsigned short)(sqrt(lifetime_points / 100.0) + 1);
}

void process_event(PlayerStats *stats, int points_earned) {
    stats->lifetime_points += points_earned;
    unsigned short new_level = calculate_level(stats->lifetime_points);
    if (new_level > stats->level) {
        stats->level = new_level;
        // Signal Level Up
    }
}
```

---

## 4. Data Flow

### 4.1 Triggering an Event
1. **Action:** A child makes a transaction within their limit.
2. **Interceptor:** The Transaction Service detects the "Safe Spend" event.
3. **Signal:** An asynchronous signal is sent to the `GamificationEngine`.

### 4.2 Processing Reward
1. **Validation:** The engine verifies the event metadata.
2. **Point Calculation:** 
   - Base Points: 10
   - Multiplier: 1.5x (if on a 7-day streak)
3. **Database Update:** The `Reward` table is updated atomically.
4. **Achievement Check:** The engine checks if this event completes any `Achievement` criteria.

### 4.3 Level Up Sequence
1. Points threshold reached.
2. `level` field updated in DB.
3. Push notification triggered to Parent and Child.
4. Unlock associated UI assets (badges/themes).

---

## 5. Gamification Logic Flow (Pseudocode)

```python
def handle_transaction_event(child_id, transaction_amount):
    reward_profile = Reward.objects.get(child_id=child_id)
    
    # Logic for rewarding responsible spending
    if transaction_amount < reward_profile.child.weekly_limit:
        reward_profile.add_points(POINTS_CONFIG['SAFE_SPEND'])
        
    # Check for streaks
    update_streak_counter(child_id)
    
    # Check for achievement triggers
    trigger_achievement_check(child_id, "TRANSACTION_COMPLETED")
```

## 6. Future Considerations
- **Leaderboards:** Competitive saving between siblings or friend groups.
- **Parental Modifiers:** Allowing parents to set custom point multipliers for specific goals.
- **Dynamic Level Difficulty:** Scaling point requirements logarithmically to maintain engagement.
