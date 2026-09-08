import React from 'react';

export const DashboardNotificationsPanel: React.FC = () => (
  <section className="bg-white dark:bg-[#1A1830] border-b border-gray-200 dark:border-[#2A2740] shadow-sm transition-colors duration-200">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Notifications
          </h2>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Money requests from your children
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-dashed border-gray-300 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] py-14 text-center transition-colors duration-200">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-[#1A1830] shadow-sm transition-colors duration-200">
          <svg
            className="h-10 w-10 text-gray-400 dark:text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </div>

        <h3 className="mt-8 text-xl font-semibold text-gray-900 dark:text-white">
          No pending notifications
        </h3>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          All requests have been processed
        </p>
      </div>
    </div>
  </section>
);