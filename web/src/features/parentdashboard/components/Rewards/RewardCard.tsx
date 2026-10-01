import React from 'react';
import { Gift } from 'lucide-react';
import type { Reward } from './types';

interface RewardCardProps {
  reward: Reward;
  onToggleStatus: (id: string) => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  onToggleStatus,
}) => (
  <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-white dark:bg-[#1A1830] p-4 shadow-sm transition-colors duration-200">
    <div className="flex items-start justify-between gap-3">
      {/* Reward Icon */}
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#7C5CFC] text-white shadow-sm">
        <Gift size={16} />
      </div>

      {/* Category */}
      <span className="rounded-full border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-gray-400">
        {reward.category || 'Reward'}
      </span>
    </div>

    {/* Reward Title */}
    <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
      {reward.title}
    </h3>

    {/* Description */}
    <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
      {reward.description}
    </p>

    {/* Points */}
    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
      Cost:{' '}
      <span className="font-semibold text-[#0F9F8A] dark:text-[#3ED9C2]">
        {reward.points} points
      </span>
    </p>

    {/* Status Button */}
    <button
      type="button"
      onClick={() => onToggleStatus(reward.id)}
      className="mt-4 inline-flex items-center rounded-full border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-[#2A2740]"
    >
      {reward.active ? 'Mark Inactive' : 'Reactivate'}
    </button>
  </div>
);