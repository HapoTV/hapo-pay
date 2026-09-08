import React from 'react';
import { Gift } from 'lucide-react';
import type { RedeemedReward, RewardFilterId } from './types';

interface RedeemedRewardsSectionProps {
  selectedFilter: RewardFilterId;
  onFilterChange: (id: RewardFilterId) => void;
  redeemedRewards: RedeemedReward[];
  filters: Array<{ id: RewardFilterId; label: string }>;
}

export const RedeemedRewardsSection: React.FC<RedeemedRewardsSectionProps> = ({
  selectedFilter,
  onFilterChange,
  redeemedRewards,
  filters,
}) => (
  <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-gray-400">
          Redeemed rewards
        </p>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Filter by child or time period.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = selectedFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onFilterChange(filter.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                isActive
                  ? 'bg-[#7C5CFC] text-white'
                  : 'bg-gray-100 dark:bg-[#0D0B1A] text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2A2740]'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>

    <div className="space-y-4">
      {redeemedRewards.length > 0 ? (
        redeemedRewards.map((reward) => (
          <div
            key={reward.id}
            className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-white dark:bg-[#1A1830] p-5 shadow-sm transition-colors duration-200"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {reward.reward}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Redeemed by {reward.child}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-semibold text-[#6D4AFF] dark:text-[#B39DFF]">
                  {reward.points} points
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {reward.date}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-[2rem] border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-8 sm:p-12 text-center transition-colors duration-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#7C5CFC] text-white shadow-sm">
            <Gift size={22} />
          </div>

          <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
            No Redeemed Rewards Yet
          </h3>

          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 dark:text-gray-400">
            When your children redeem rewards, they will appear here.
          </p>
        </div>
      )}
    </div>
  </div>
);