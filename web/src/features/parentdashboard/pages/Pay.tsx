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
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-b-3xl mb-6">
        <h1 className="text-2xl font-bold mb-2">Send Money</h1>
        <p className="text-pink-100">Transfer funds to your children</p>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Send Money Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* Select Child */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Select Child
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child.id)}
                  className={`p-4 rounded-lg border-2 transition text-left ${
                    selectedChild === child.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{child.name}</p>
                  <p className="text-sm text-gray-600">{child.email}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Amount (R)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold">
                R
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-600 mb-2">Quick amounts:</p>
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 200, 500].map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  className="py-2 px-3 bg-gray-100 hover:bg-pink-100 text-gray-900 rounded-lg text-sm font-medium transition"
                >
                  R{quickAmount}
                </button>
              ))}
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMoney}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg font-semibold transition"
          >
            Send Money
          </button>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              💡 <strong>Tip:</strong> You can set daily spending limits for each child in their account settings.
            </p>
          </div>
        </div>

        {/* Recent Transfers */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Transfers</h3>
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <p className="text-gray-600">No recent transfers</p>
          </div>
        </div>
      </div>
    </div>
  );
};