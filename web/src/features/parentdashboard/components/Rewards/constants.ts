import type { RewardFilterId, RewardIconOption } from './types';

export const redeemedFilters: Array<{ id: RewardFilterId; label: string }> = [
  { id: 'all', label: 'All children' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
];

export const rewardIcons: RewardIconOption[] = [
  { value: 'Gift', label: 'Gift' },
  { value: 'Game', label: 'Game' },
  { value: 'Book', label: 'Book' },
  { value: 'Money', label: 'Money' },
  { value: 'Movie', label: 'Movie' },
];

export const rewardCategories = ['Entertainment', 'Food & Treats', 'Learning', 'Toys', 'Money & Allowance', 'Other'];
