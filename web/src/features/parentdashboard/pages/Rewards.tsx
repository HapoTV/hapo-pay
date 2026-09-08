import React, { useState } from 'react';
import { Gift } from 'lucide-react';
import { AddRewardModal } from '../components/Rewards/AddRewardModal';
import { RedeemedRewardsSection } from '../components/Rewards/RedeemedRewardsSection';
import { RewardCard } from '../components/Rewards/RewardCard';
import {
  redeemedFilters,
  rewardCategories,
  rewardIcons,
} from '../components/Rewards/constants';
import type {
  RedeemedReward,
  Reward,
  RewardFilterId,
} from '../components/Rewards/types';

export const RewardsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [selectedFilter, setSelectedFilter] =
    useState<RewardFilterId>('all');

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
  const [newRewardCategory, setNewRewardCategory] = useState(
    rewardCategories[0]
  );

  const [redeemedRewards] = useState<RedeemedReward[]>([
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
    if (
      !newRewardTitle.trim() ||
      !newRewardDescription.trim() ||
      !newRewardPoints.trim()
    ) {
      return;
    }

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
        reward.id === id
          ? { ...reward, active: !reward.active }
          : reward
      )
    );
  };

  const renderRewardsContent = () => {
    if (activeTab === 'active') {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onToggleStatus={toggleRewardStatus}
            />
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
    <div className="pb-20 md:pb-0 bg-white text-gray-900 dark:bg-[#0D0B1A] dark:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4">

        {/* Page Header */}
        <div className="bg-white dark:bg-[#1A1830] rounded-2xl border border-gray-200 dark:border-[#2A2740] p-4 shadow-sm mb-5 transition-colors duration-200">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6D4AFF] dark:text-[#B39DFF]">
              Rewards Management
            </p>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-2xl leading-snug">
              Create and manage rewards for your children
            </p>
          </div>
        </div>

        {/* Active Rewards Summary */}
        <div className="bg-white dark:bg-[#1A1830] rounded-2xl border border-gray-200 dark:border-[#2A2740] p-4 shadow-sm mb-5 transition-colors duration-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7C5CFC] text-white shadow-sm">
                <Gift size={16} />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-gray-400">
                  Active Rewards
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {activeRewardCount}
                </h2>
              </div>
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-400">
              Manage your reward catalog and approve redemptions.
            </div>
          </div>
        </div>

        {/* Rewards Store */}
        <div className="bg-white dark:bg-[#1A1830] rounded-2xl border border-gray-200 dark:border-[#2A2740] p-4 shadow-sm transition-colors duration-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Manage Rewards Store
              </h2>
            </div>

            <button
              type="button"
              onClick={openAddRewardModal}
              className="inline-flex items-center gap-2 rounded-full bg-[#7C5CFC] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#6A4CE0]"
            >
              + Add Reward
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-[#2A2740] pb-3 mb-4">
            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`pb-2 transition-colors ${
                  activeTab === 'active'
                    ? 'text-[#6D4AFF] dark:text-[#B39DFF] border-b-2 border-[#7C5CFC]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Active Rewards
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('past')}
                className={`pb-2 transition-colors ${
                  activeTab === 'past'
                    ? 'text-[#6D4AFF] dark:text-[#B39DFF] border-b-2 border-[#7C5CFC]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Past Rewards (Redeemed)
              </button>
            </div>
          </div>

          {/* Rewards Content */}
          {renderRewardsContent()}
        </div>
      </div>

      {/* Add Reward Modal */}
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
        disabled={
          !newRewardTitle.trim() ||
          !newRewardDescription.trim() ||
          !newRewardPoints.trim() ||
          Number(newRewardPoints) <= 0
        }
      />
    </div>
  );
};