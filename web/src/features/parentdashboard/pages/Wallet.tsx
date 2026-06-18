import React, { useState } from 'react';
import {
  Wallet,
  FileText,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const WalletPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'week' | 'month'>('month');
  const [showSmartReports, setShowSmartReports] = useState(false);

  return (
    <div className="pb-20 md:pb-0 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-500">Wallet</p>
              <h1 className="mt-2 text-xl font-semibold text-slate-950">Family wallet overview</h1>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-snug">
                See balances, approvals, and recent activity across your children’s wallets.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSmartReports((current) => !current)}
              className="inline-flex items-center justify-center rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-600"
            >
              {showSmartReports ? 'Hide reports' : 'View reports'}
            </button>
          </div>
        </div>

        {showSmartReports && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Smart Reports</h2>
                <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-snug">
                  A quick snapshot of wallet performance and spending trends.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Family balance</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">R0.00</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Savings outlook</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">Stable</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Next review</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">In 7 days</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm">
                <Wallet size={16} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">This month</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">R0.00</h2>
              </div>
            </div>
            <div className="text-xs text-slate-500">Latest family wallet summary and spending view.</div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm">
                <Wallet size={14} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-950">0</h3>
                <p className="mt-1 text-[11px] text-slate-500">Total transactions</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm">
                <AlertCircle size={14} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-950">R0.00</h3>
                <p className="mt-1 text-[11px] text-slate-500">Spent this month</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm">
                <Calendar size={14} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-950">R0.00</h3>
                <p className="mt-1 text-[11px] text-slate-500">Forecast this week</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Transaction history</h2>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-snug">Review recent wallet transactions and filter by period.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {(['all', 'week', 'month'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  activeFilter === filter
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'week' ? 'This week' : 'This month'}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <FileText className="text-slate-400" size={20} />
            </div>
            <h3 className="text-base font-semibold text-slate-950 mb-2">No activity yet</h3>
            <p className="max-w-lg mx-auto text-sm leading-6 text-slate-500 mb-3">
              Your activity history will appear here once you start making transfers and payments.
            </p>
            <button
              type="button"
              className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-600"
            >
              Add transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};