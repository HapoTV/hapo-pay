import React, { useState } from 'react';
import {
  Wallet,
  Receipt,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const WalletPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('month');
  const [showSmartReports, setShowSmartReports] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-500">Wallet</p>
              <p className="mt-3 text-slate-600 max-w-2xl leading-relaxed">Manage your children finances here</p>
            </div>
            <button
              type="button"
              onClick={() => setShowSmartReports((current) => !current)}
              className="inline-flex items-center justify-center rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              {showSmartReports ? 'Hide Smart Reports' : 'View Smart Reports'}
            </button>
          </div>
        </div>

        {showSmartReports && (
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Smart Reports</h2>
                <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Get a quick snapshot of your wallet performance and recent spending trends.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Family balance</p>
                <p className="mt-3 text-2xl font-medium text-slate-950">R0.00</p>
              </div>
              <div className="rounded-[1.75rem] bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Savings outlook</p>
                <p className="mt-3 text-2xl font-medium text-slate-950">Stable</p>
              </div>
              <div className="rounded-[1.75rem] bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Next review</p>
                <p className="mt-3 text-2xl font-medium text-slate-950">In 7 days</p>
              </div>
            </div>
          </div>
        )}

      {/* Main Wallet Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 mb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white">
            <Wallet size={20} />
           </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                This Month
              </p>

              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                R0.00
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white">
            <Wallet size={18} />
          </div>
        <div>
  <h3 className="text-xl font-semibold text-slate-950">0</h3>
  <p className="mt-1 text-sm text-slate-500">
    Total Transactions
  </p>
</div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white">
  <AlertCircle size={18} />
</div>

<div>
  <h3 className="text-xl font-semibold text-slate-950">
    R0.00
  </h3>
  <p className="mt-1 text-sm text-slate-500">
    This Month
  </p>
</div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white">
  <Calendar size={18} />
</div>

<div>
  <h3 className="text-xl font-semibold text-slate-950">
    R0.00
  </h3>
  <p className="mt-1 text-sm text-slate-500">
    This Week
  </p>
</div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm min-h-[420px]">
        <h2 className="text-2xl font-bold text-slate-950 mb-8">
         Detailed Transaction History
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-16">
          <button
            onClick={() => setActiveFilter('all')}
            className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
              activeFilter === 'all'
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            All
          </button>

          <button
            onClick={() => setActiveFilter('week')}
            className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
              activeFilter === 'week'
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            This Week
          </button>

          <button
            onClick={() => setActiveFilter('month')}
            className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
              activeFilter === 'month'
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            This Month
          </button>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center rounded-[1.75rem] bg-slate-50 p-16 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
        <Receipt className="text-slate-400" size={28} />
       </div>

     <h3 className="text-xl font-semibold text-slate-950 mb-3">
      No activities yet
      </h3>

          <p className="max-w-xl text-sm leading-7 text-slate-500">
            Your activity history will appear here when you make payments or transfers.
          </p>
        </div>
      </div>
    </div>
  </div>
  );
};