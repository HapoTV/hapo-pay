import React, { useState } from 'react';
import type { Child } from '../types';
 
export const PayPage: React.FC = () => {
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
 
  const children: Child[] = [
    {
      id: '1',
      name: 'Thabo Madubela',
      email: 'thabo@hapo.com',
      spendLimit: 500,
      currentSpending: 250,
    },
    {
      id: '2',
      name: 'Nomsa Madubela',
      email: 'nomsa@hapo.com',
      spendLimit: 450,
      currentSpending: 180,
    },
  ];
 
  const handleSendMoney = () => {
    if (!selectedChild || !amount) {
      alert('Please select a child and enter an amount');
      return;
    }
    alert(`Sending R${amount} to ${children.find(c => c.id === selectedChild)?.name}`);
  };
 
  return (
    <div className="pb-20 md:pb-0 bg-[#0D0B1A] min-h-screen">
      {/* Header */}
      <div
        className="text-white p-6 rounded-b-3xl mb-6"
        style={{ background: 'linear-gradient(135deg, #7C5CFC 0%, #3ED9C2 100%)' }}
      >
        <h1 className="text-2xl font-bold mb-2">Send Money</h1>
        <p className="text-white/80">Transfer funds to your children</p>
      </div>
 
      <div className="max-w-2xl mx-auto px-4">
        {/* Send Money Form */}
        <div className="bg-[#1A1830] border border-[#2A2740] rounded-2xl p-6 shadow-sm">
          {/* Select Child */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              Select Child
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child.id)}
                  className={`p-4 rounded-lg border-2 transition text-left ${
                    selectedChild === child.id
                      ? 'border-[#7C5CFC] bg-[#7C5CFC]/10'
                      : 'border-[#2A2740] hover:border-[#7C5CFC]/50'
                  }`}
                >
                  <p className="font-semibold text-white">{child.name}</p>
                  <p className="text-sm text-gray-400">{child.email}</p>
                </button>
              ))}
            </div>
          </div>
 
          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Amount (R)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold">
                R
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-[#0D0B1A] border-2 border-[#2A2740] text-white placeholder-gray-500 rounded-lg focus:outline-none focus:border-[#7C5CFC]"
              />
            </div>
          </div>
 
          {/* Quick Amount Buttons */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-400 mb-2">Quick amounts:</p>
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 200, 500].map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  className="py-2 px-3 bg-[#0D0B1A] hover:bg-[#7C5CFC]/15 text-white rounded-lg text-sm font-medium transition border border-[#2A2740]"
                >
                  R{quickAmount}
                </button>
              ))}
            </div>
          </div>
 
          {/* Send Button */}
          <button
            onClick={handleSendMoney}
            className="w-full bg-[#7C5CFC] hover:bg-[#6A4CE0] text-white py-3 rounded-lg font-semibold transition"
          >
            Send Money
          </button>
 
          {/* Info Box */}
          <div className="mt-6 bg-[#151F35] border border-[#3ED9C2]/30 rounded-lg p-4">
            <p className="text-sm text-[#7DD3FC]">
              💡 <strong>Tip:</strong> You can set daily spending limits for each child in their account settings.
            </p>
          </div>
        </div>
 
        {/* Recent Transfers */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-white mb-4">Recent Transfers</h3>
          <div className="bg-[#1A1830] border border-[#2A2740] rounded-2xl p-6 shadow-sm text-center">
            <p className="text-gray-400">No recent transfers</p>
          </div>
        </div>
      </div>
    </div>
  );
};
 