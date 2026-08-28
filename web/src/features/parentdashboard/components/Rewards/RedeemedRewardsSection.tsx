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
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Redeemed rewards</p>
        <p className="mt-1 text-sm text-slate-600">Filter by child or time period.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = selectedFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onFilterChange(filter.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
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
          <div key={reward.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{reward.reward}</h3>
                <p className="text-sm text-slate-500">Redeemed by {reward.child}</p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-rose-500">{reward.points} points</p>
                <p className="text-xs text-slate-500">{reward.date}</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm">
            <Gift size={22} />
          </div>

          <h3 className="mt-6 text-xl font-semibold text-slate-950">No Redeemed Rewards Yet</h3>
          <p className="mt-3 text-sm text-slate-600 max-w-xl mx-auto">
            When your children redeem rewards, they will appear here.
          </p>
        </div>
      )}
    </div>
  </div>
);
