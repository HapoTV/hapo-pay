import React from 'react';

interface BalanceCardProps {
  familyBalance: number;
  monthlySpending: number;
  currency: string;
  onAddMoney?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  familyBalance,
  monthlySpending,
  currency,
  onAddMoney,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Family Balance Card */}
      <div className="bg-white rounded-2xl p-6 border-l-4 border-pink-500 shadow-sm hover:shadow-md transition">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-2">Family Balance</p>
            <h2 className="text-3xl font-bold text-gray-900">
              {currency} {familyBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="bg-pink-100 rounded-lg p-3">
            <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
        </div>
        <button
          onClick={onAddMoney}
          className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium transition"
        >
          + Add money
        </button>
      </div>

      {/* Monthly Spending Card */}
      <div className="bg-white rounded-2xl p-6 border-l-4 border-pink-500 shadow-sm hover:shadow-md transition">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-2">This Month</p>
            <h2 className="text-3xl font-bold text-gray-900">
              {currency} {monthlySpending.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="bg-pink-100 rounded-lg p-3">
            <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};