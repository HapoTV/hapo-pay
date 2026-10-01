export type RewardFilterId = 'all' | 'week' | 'month';

export interface RewardIconOption {
  value: string;
  label: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  active: boolean;
  icon?: string;
  category?: string;
}

export interface RedeemedReward {
  id: string;
  child: string;
  reward: string;
  points: number;
  date: string;
}
