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
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Family Balance Card */}
      <div className="flex-1 rounded-3xl bg-slate-50 border border-slate-200 p-5 shadow-sm transition hover:shadow-md min-w-[240px]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Family Balance</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {currency} {familyBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-rose-100 rounded-2xl p-3">
            <svg className="w-6 h-6 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
        </div>
        <button
          onClick={onAddMoney}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
        >
          + Add money
        </button>
      </div>

      {/* Monthly Spending Card */}
      <div className="flex-1 rounded-3xl bg-slate-50 border border-slate-200 p-5 shadow-sm transition hover:shadow-md min-w-[240px]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">This Month</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {currency} {monthlySpending.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-rose-100 rounded-2xl p-3">
            <svg className="w-6 h-6 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};