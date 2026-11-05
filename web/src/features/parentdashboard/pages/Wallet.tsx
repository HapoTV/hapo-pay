import React, { useMemo, useState } from 'react';
import { AlertCircle, Calendar, FileText, Wallet } from 'lucide-react';
import type { SpendingAnalytics, WalletTransaction } from '@/api/client';

interface WalletPageProps {
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
  analytics: SpendingAnalytics | null;
  isLoading: boolean;
}

interface TransactionFilter {
  label: string;
  value: 'all' | 'week' | 'month';
}

const filters: TransactionFilter[] = [
  { label: 'All', value: 'all' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
];

const formatAmount = (value: string | number, currency: string) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `${currency} ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : 'Unavailable';
};

export const WalletPage: React.FC<WalletPageProps> = ({
  balance,
  currency,
  transactions,
  analytics,
  isLoading,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'week' | 'month'>('month');

  const filteredTransactions = useMemo(() => {
    const now = Date.now();
    const cutoff = activeFilter === 'week'
      ? now - 7 * 24 * 60 * 60 * 1000
      : activeFilter === 'month'
        ? now - 30 * 24 * 60 * 60 * 1000
        : null;

    return [...transactions]
      .filter((transaction) => {
        if (cutoff === null) return true;
        const createdAt = new Date(transaction.created_at).getTime();
        return Number.isFinite(createdAt) && createdAt >= cutoff;
      })
      .sort((left, right) =>
        new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
      );
  }, [activeFilter, transactions]);

  const topCategory = analytics?.category_breakdown[0];
  const totalSpent = analytics ? formatAmount(analytics.total_spent, currency) : 'Unavailable';

  return (
    <div className="pb-20 md:pb-0 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#713cff]">Wallet</p>
              <h1 className="mt-2 text-xl font-semibold text-slate-950">Family wallet overview</h1>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-snug">
                Current wallet balance, children’s spending analytics, and recent family transactions.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#713cff] text-white shadow-sm">
              <Wallet size={16} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Family wallet balance</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                {formatAmount(balance, currency)}
              </h2>
            </div>
          </div>
        </div>

        <section aria-label="Spending analytics" className="mb-6">
          <h2 className="mb-3 text-base font-semibold text-slate-950">Children’s spending analytics</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-[#713cff]" />
                <div>
                  <h3 className="text-base font-semibold text-slate-950">{totalSpent}</h3>
                  <p className="mt-1 text-[11px] text-slate-500">Children spent in the last 30 days</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-[#713cff]" />
                <div>
                  <h3 className="text-base font-semibold text-slate-950">
                    {analytics?.transaction_count ?? 'Unavailable'}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-500">Child payment transactions</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#713cff]" />
                <div>
                  <h3 className="text-base font-semibold text-slate-950">
                    {topCategory
                      ? `${topCategory.category}: ${formatAmount(topCategory.total, currency)}`
                      : analytics ? 'No spending yet' : 'Unavailable'}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-500">Highest spending category</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Transaction history" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-950">Transaction history</h2>
            <p className="mt-1 text-sm text-slate-600">
              Recent parent and linked-child transactions (up to 20 returned by the API).
            </p>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                aria-pressed={activeFilter === filter.value}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  activeFilter === filter.value
                    ? 'bg-[#713cff] text-white border-[#713cff]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p role="status" className="py-8 text-center text-sm text-slate-500">Loading transactions…</p>
          ) : filteredTransactions.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <FileText className="mx-auto mb-3 text-slate-400" size={20} />
              <h3 className="text-base font-semibold text-slate-950">No transactions in this period</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
                The backend returned no matching transactions for this filter.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredTransactions.map((transaction) => (
                <li key={transaction.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {transaction.merchant_name || transaction.description || transaction.category}
                    </p>
                    <p className="text-xs text-slate-500">
                      {transaction.user_email} · {transaction.type} · {transaction.status}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(transaction.created_at).toLocaleString('en-ZA')}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatAmount(transaction.amount, currency)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};
