import React from 'react';
import { QuickActions, RechargeSection, ChildrenSection, SafetyAlerts } from '.';
import type { ParentUser, Child } from '../types';

type QuickActionItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
};

type RechargeItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
};

interface DashboardHomeProps {
  parentData: ParentUser;
  quickActions: QuickActionItem[];
  rechargeItems: RechargeItem[];
  onAddMoney: () => void;
  onAddChild: () => void;
  onChildClick: (child: Child) => void;
  onChangeCurrency: (child: Child) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  parentData,
  quickActions,
  rechargeItems,
  onAddMoney,
  onAddChild,
  onChildClick,
  onChangeCurrency,
}) => {
  return (
    <div className="pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4">

        {/* Welcome / Overview Section */}
        <div className="bg-white dark:bg-[#1A1830] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-[#2A2740] mb-8 transition-colors duration-200">
          <div className="space-y-6">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6D4AFF] dark:text-[#B39DFF]">
                Welcome back
              </p>

              <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
                Olwethu
              </h1>

              <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                See balances, top up wallets, and manage payments, allowances,
                and spending for children.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 justify-items-center">

              {/* Family Balance */}
              <div
                className="rounded-3xl p-3 shadow-sm flex flex-col justify-between min-h-[64px] max-w-[180px] w-full"
                style={{
                  background:
                    'linear-gradient(135deg, #7C5CFC 0%, #3ED9C2 100%)',
                }}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div>
                    <p className="text-white/80 text-xs">
                      Family Balance
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {parentData.currency}{' '}
                      {parentData.familyBalance.toLocaleString('en-ZA', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="bg-white/20 rounded-2xl p-1">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </div>
                </div>

                <button
                  onClick={onAddMoney}
                  className="mt-1 self-start w-auto inline-flex items-center justify-center rounded-full bg-white/25 px-2 py-0.5 text-[0.6rem] font-semibold text-white transition hover:bg-white/35"
                >
                  + Add money
                </button>
              </div>

              {/* This Month */}
              <div className="rounded-3xl bg-white dark:bg-[#0D0B1A] p-3 shadow-sm border border-gray-200 dark:border-[#2A2740] flex flex-col justify-between min-h-[64px] max-w-[180px] w-full transition-colors duration-200">
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      This Month
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {parentData.currency}{' '}
                      {parentData.monthlySpending.toLocaleString('en-ZA', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="bg-[#7C5CFC]/15 rounded-2xl p-1">
                    <svg
                      className="w-3 h-3 text-[#7C5CFC]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Savings */}
              <div className="rounded-3xl bg-white dark:bg-[#0D0B1A] p-3 shadow-sm border border-gray-200 dark:border-[#2A2740] flex flex-col justify-between min-h-[64px] max-w-[180px] w-full transition-colors duration-200">
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      Savings
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {parentData.currency}
                      {parentData.savings.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-[#3ED9C2]/15 rounded-2xl p-1">
                    <svg
                      className="w-3 h-3 text-[#3ED9C2]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6 2a1 1 0 00-1 1v2h10V3a1 1 0 00-1-1H6z" />
                      <path d="M3 7h14v6a3 3 0 01-3 3H6a3 3 0 01-3-3V7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Children */}
              <div className="rounded-3xl bg-white dark:bg-[#0D0B1A] p-3 shadow-sm border border-gray-200 dark:border-[#2A2740] flex flex-col justify-between min-h-[64px] max-w-[180px] w-full transition-colors duration-200">
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      Children
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {parentData.children.length}
                    </p>
                  </div>

                  <div className="bg-[#22C55E]/15 rounded-2xl p-1">
                    <svg
                      className="w-3 h-3 text-[#22C55E]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path
                        fillRule="evenodd"
                        d="M2 13.5A4.5 4.5 0 016.5 9h7a4.5 4.5 0 014.5 4.5V15a1 1 0 01-1 1H3a1 1 0 01-1-1v-1.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions actions={quickActions} />

        {/* Recharge */}
        <RechargeSection items={rechargeItems} />

        {/* Children */}
        <ChildrenSection
          children={parentData.children}
          onAddChild={onAddChild}
          onChildClick={onChildClick}
          onChangeCurrency={onChangeCurrency}
        />

        {/* Safety Alerts */}
        <SafetyAlerts
          message="All spending within normal patterns"
          type="success"
          onSettings={() =>
            alert('Safety Settings - Coming Soon')
          }
        />

      </div>
    </div>
  );
};
