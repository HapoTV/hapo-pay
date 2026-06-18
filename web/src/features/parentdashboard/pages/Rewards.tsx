import React, { useState } from 'react';
import { Gift } from 'lucide-react';

const redeemedFilters = [
  { id: 'all', label: 'All children' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
];

export const RewardsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'week' | 'month'>('all');
  const [rewards, setRewards] = useState([
  {
    id: '1',
    title: 'Extra R5 Allowance',
    description: 'Earn an extra R5 allowance.',
    points: 500,
    active: true,
  },
]);

const [redeemedRewards] = useState([
  {
    id: '1',
    child: 'Sarah',
    reward: 'Movie Night',
    points: 300,
    date: '2 days ago',
  },
]);

const activeRewardCount = rewards.filter(
  (reward) => reward.active
).length;

  const handleAddReward = () => {
  const title = prompt('Reward title');

  if (!title) return;

  const points = Number(prompt('Points required'));

  if (!points) return;

  const newReward = {
    id: Date.now().toString(),
    title,
    description: 'Custom reward',
    points,
    active: true,
  };

  setRewards((prev) => [newReward, ...prev]);
};
const toggleRewardStatus = (id: string) => {
  setRewards((prev) =>
    prev.map((reward) =>
      reward.id === id
        ? { ...reward, active: !reward.active }
        : reward
    )
  );
};

  const renderRewardsContent = () => {
    if (activeTab === 'active') {
      return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm">
                <Gift size={18} />
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Example</span>
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-950">Example: Extra R5 Allowance</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">This is a sample to show how rewards will look.</p>
            <p className="mt-4 text-sm text-slate-600">
              Cost: <span className="font-semibold text-sky-600">500 points</span>
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Redeemed rewards</p>
            <p className="mt-1 text-sm text-slate-600">Filter by child or time period.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {redeemedFilters.map((filter) => {
              const isActive = selectedFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setSelectedFilter(filter.id as 'all' | 'week' | 'month')}
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
      <div
        key={reward.id}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">
              {reward.reward}
            </h3>

            <p className="text-sm text-slate-500">
              Redeemed by {reward.child}
            </p>
          </div>

          <div className="text-right">
            <p className="font-semibold text-rose-500">
              {reward.points} points
            </p>

            <p className="text-xs text-slate-500">
              {reward.date}
            </p>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm">
        <Gift size={22} />
      </div>

      <h3 className="mt-6 text-xl font-semibold text-slate-950">
        No Redeemed Rewards Yet
      </h3>

      <p className="mt-3 text-sm text-slate-600 max-w-xl mx-auto">
        When your children redeem rewards, they will appear here.
      </p>
    </div>
  )}
</div>
      </div>
    );
  };

  return (
    <div className="pb-20 md:pb-0 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-500">Rewards Management</p>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-snug">Create and manage rewards for your children</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm">
                <Gift size={16} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Active Rewards</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">{activeRewardCount}</h2>
              </div>
            </div>
            <div className="text-xs text-slate-500">Manage your reward catalog and approve redemptions.</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Manage Rewards Store</h2>
            </div>
            <button
              type="button"
              onClick={handleAddReward}
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-600"
            >
              + Add Reward
            </button>
          </div>

          <div className="border-b border-slate-200 pb-3 mb-4">
            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`pb-2 ${activeTab === 'active' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Active Rewards
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('past')}
                className={`pb-2 ${activeTab === 'past' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Past Rewards (Redeemed)
              </button>
            </div>
          </div>

          {renderRewardsContent()}
        </div>
      </div>
    </div>
  );
};
