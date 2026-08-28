import React, { useState } from 'react';
import { Gift } from 'lucide-react';
import { AddRewardModal } from '../components/Rewards/AddRewardModal';
import { RedeemedRewardsSection } from '../components/Rewards/RedeemedRewardsSection';
import { RewardCard } from '../components/Rewards/RewardCard';
import { redeemedFilters, rewardCategories, rewardIcons } from '../components/Rewards/constants';
import type { RedeemedReward, Reward, RewardFilterId } from '../components/Rewards/types';

export const RewardsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [selectedFilter, setSelectedFilter] = useState<RewardFilterId>('all');
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: '1',
      title: 'Extra R5 Allowance',
      description: 'Earn an extra R5 allowance.',
      points: 500,
      active: true,
      icon: 'Gift',
      category: 'Entertainment',
    },
  ]);

  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardDescription, setNewRewardDescription] = useState('');
  const [newRewardPoints, setNewRewardPoints] = useState('');
  const [newRewardIcon, setNewRewardIcon] = useState(rewardIcons[0].value);
  const [newRewardCategory, setNewRewardCategory] = useState(rewardCategories[0]);

  const [redeemedRewards] = useState<RedeemedReward[]>([
    {
      id: '1',
      child: 'Sarah',
      reward: 'Movie Night',
      points: 300,
      date: '2 days ago',
    },
  ]);

  const activeRewardCount = rewards.filter((reward) => reward.active).length;

  const openAddRewardModal = () => setShowAddRewardModal(true);
  const closeAddRewardModal = () => setShowAddRewardModal(false);

  const resetAddRewardForm = () => {
    setNewRewardTitle('');
    setNewRewardDescription('');
    setNewRewardPoints('');
    setNewRewardIcon(rewardIcons[0].value);
    setNewRewardCategory(rewardCategories[0]);
  };

  const handleSaveReward = () => {
    if (!newRewardTitle.trim() || !newRewardDescription.trim() || !newRewardPoints.trim()) return;

    const points = Number(newRewardPoints);
    if (!points || points <= 0) return;

    const newReward: Reward = {
      id: Date.now().toString(),
      title: newRewardTitle.trim(),
      description: newRewardDescription.trim(),
      points,
      active: true,
      icon: newRewardIcon,
      category: newRewardCategory,
    };

    setRewards((prev) => [newReward, ...prev]);
    closeAddRewardModal();
    resetAddRewardForm();
  };

  const toggleRewardStatus = (id: string) => {
    setRewards((prev) =>
      prev.map((reward) =>
        reward.id === id ? { ...reward, active: !reward.active } : reward
      )
    );
  };

  const renderRewardsContent = () => {
    if (activeTab === 'active') {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} onToggleStatus={toggleRewardStatus} />
          ))}
        </div>
      );
    }

    return (
      <RedeemedRewardsSection
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        redeemedRewards={redeemedRewards}
        filters={redeemedFilters}
      />
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
              onClick={openAddRewardModal}
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

      <AddRewardModal
        open={showAddRewardModal}
        onClose={closeAddRewardModal}
        title={newRewardTitle}
        description={newRewardDescription}
        points={newRewardPoints}
        icon={newRewardIcon}
        category={newRewardCategory}
        rewardIcons={rewardIcons}
        rewardCategories={rewardCategories}
        onChangeTitle={setNewRewardTitle}
        onChangeDescription={setNewRewardDescription}
        onChangePoints={setNewRewardPoints}
        onChangeIcon={setNewRewardIcon}
        onChangeCategory={setNewRewardCategory}
        onSave={handleSaveReward}
        disabled={!newRewardTitle.trim() || !newRewardDescription.trim() || !newRewardPoints.trim() || Number(newRewardPoints) <= 0}
      />
    </div>
  );
};
