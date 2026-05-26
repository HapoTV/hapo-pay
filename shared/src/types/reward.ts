export interface RewardPoints {
  child_id: string;
  total_points: number;
  available_points: number;
  redeemed_points: number;
  level: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points_required: number;
  icon: string;
  unlocked_at?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points_reward: number;
  progress: number;
  target: number;
  expires_at: string;
  completed: boolean;
}

export interface StudentBalance {
  balance: number;
  available_spending: number;
  allowance_remaining: number;
}
