import React, { useState } from 'react';
import {
  Wallet,
  FileText,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { WalletReportModal } from '../components/WalletReportModal';

export const WalletPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'week' | 'month'>('month');
  const [showSmartReports, setShowSmartReports] = useState(false);

  return (
    <div className="pb-20 md:pb-0 bg-white text-gray-900 dark:bg-[#0D0B1A] dark:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4">

        {/* Wallet Header */}
        <div className="bg-white dark:bg-[#1A1830] rounded-2xl border border-gray-200 dark:border-[#2A2740] p-4 shadow-sm mb-5 transition-colors duration-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6D4AFF] dark:text-[#B39DFF]">
                Wallet
              </p>

              <h1 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                Family wallet overview
              </h1>

              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-2xl leading-snug">
                See balances, approvals, and recent activity across your children’s wallets.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSmartReports(true)}
              className="inline-flex items-center justify-center rounded-full bg-[#7C5CFC] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#6A4CE0]"
            >
              View reports
            </button>
          </div>
        </div>

        {showSmartReports && (
          <WalletReportModal
            open={showSmartReports}
            onClose={() => setShowSmartReports(false)}
          />
        )}

        {/* Monthly Summary */}
        <div className="bg-white dark:bg-[#1A1830] rounded-2xl border border-gray-200 dark:border-[#2A2740] p-4 shadow-sm mb-5 transition-colors duration-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7C5CFC] text-white shadow-sm">
                <Wallet size={16} />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-600 dark:text-gray-400">
                  This month
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  R0.00
                </h2>
              </div>
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-400">
              Latest family wallet summary and spending view.
            </div>
          </div>
        </div>

        {/* Wallet Statistics */}
        <div className="grid gap-3 md:grid-cols-3 mb-6">

          {/* Total Transactions */}
          <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-white dark:bg-[#1A1830] p-3 shadow-sm transition-colors duration-200">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7C5CFC] text-white shadow-sm">
                <Wallet size={14} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  0
                </h3>

                <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">
                  Total transactions
                </p>
              </div>
            </div>
          </div>

          {/* Spent This Month */}
          <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-white dark:bg-[#1A1830] p-3 shadow-sm transition-colors duration-200">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7C5CFC] text-white shadow-sm">
                <AlertCircle size={14} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  R0.00
                </h3>

                <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">
                  Spent this month
                </p>
              </div>
            </div>
          </div>

          {/* Forecast */}
          <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-white dark:bg-[#1A1830] p-3 shadow-sm transition-colors duration-200">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7C5CFC] text-white shadow-sm">
                <Calendar size={14} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  R0.00
                </h3>

                <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">
                  Forecast this week
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-white dark:bg-[#1A1830] p-4 shadow-sm transition-colors duration-200">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Transaction history
              </h2>

              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-2xl leading-snug">
                Review recent wallet transactions and filter by period.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(['all', 'week', 'month'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  activeFilter === filter
                    ? 'bg-[#7C5CFC] text-white border-[#7C5CFC]'
                    : 'bg-gray-50 dark:bg-[#0D0B1A] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#2A2740] hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                {filter === 'all'
                  ? 'All'
                  : filter === 'week'
                    ? 'This week'
                    : 'This month'}
              </button>
            ))}
          </div>

          {/* Empty State */}
          <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-4 text-center transition-colors duration-200">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-[#1A1830] shadow-sm mx-auto">
              <FileText
                className="text-gray-500 dark:text-gray-500"
                size={20}
              />
            </div>

            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              No activity yet
            </h3>

            <p className="max-w-lg mx-auto text-sm leading-6 text-gray-600 dark:text-gray-400 mb-3">
              Your activity history will appear here once you start making transfers and payments.
            </p>

            <button
              type="button"
              className="rounded-full bg-[#7C5CFC] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#6A4CE0]"
            >
              Add transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};