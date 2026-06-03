import React from 'react';

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  category: 'cashback' | 'referral' | 'milestone';
}

export const RewardsPage: React.FC = () => {
  const rewards: Reward[] = [
    {
      id: '1',
      title: 'Cashback Bonus',
      description: 'Earn 1% cashback on all transfers',
      points: 150,
      icon: '💰',
      category: 'cashback',
    },
    {
      id: '2',
      title: 'Referral Reward',
      description: 'Invite a friend and earn R50 bonus',
      points: 2,
      icon: '👥',
      category: 'referral',
    },
    {
      id: '3',
      title: 'Milestone Achievement',
      description: 'Manage 3+ children accounts',
      points: 500,
      icon: '🎯',
      category: 'milestone',
    },
  ];

  const earnedRewards = [
    {
      id: '1',
      name: 'First Transfer',
      amount: 10,
      date: '2024-05-20',
    },
    {
      id: '2',
      name: 'Weekly Bonus',
      amount: 25,
      date: '2024-05-15',
    },
  ];

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-b-3xl mb-6">
        <h1 className="text-2xl font-bold mb-2">Rewards</h1>
        <p className="text-pink-100">Earn points and get exclusive benefits</p>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Points Card */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border-l-4 border-pink-500">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Your Reward Points</p>
              <h2 className="text-4xl font-bold text-gray-900">685</h2>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm mb-2">Equivalent to</p>
              <p className="text-2xl font-bold text-pink-500">R68.50</p>
            </div>
          </div>
        </div>

        {/* Active Rewards */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Active Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="text-4xl mb-3">{reward.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-1">{reward.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <span className="inline-block bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-semibold">
                    +{reward.points} pts
                  </span>
                  <button className="text-pink-500 hover:text-pink-600 font-medium text-sm">
                    Claim →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earned Rewards */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Earned Rewards</h3>
          <div className="space-y-3">
            {earnedRewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm"
              >
                <div>
                  <p className="font-semibold text-gray-900">{reward.name}</p>
                  <p className="text-sm text-gray-600">{reward.date}</p>
                </div>
                <span className="text-lg font-bold text-green-600">+{reward.amount} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How Rewards Work</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Earn 1 point for every R1 spent</li>
            <li>✓ Redeem 10 points = R1 cashback</li>
            <li>✓ Bonus points for referrals</li>
            <li>✓ Special rewards for milestones</li>
          </ul>
        </div>
      </div>
    </div>
  );
};