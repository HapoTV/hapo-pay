import React from 'react';

export const DashboardNotificationsPanel: React.FC = () => (
  <section className="bg-white border-b border-slate-200 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Notifications</h2>
          <p className="mt-1 text-sm text-slate-500">Money requests from your children</p>
        </div>
      </div>
      <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-100 py-14 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
          <svg className="h-10 w-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </div>
        <h3 className="mt-8 text-xl font-semibold text-slate-950">No pending notifications</h3>
        <p className="mt-2 text-sm text-slate-500">All requests have been processed</p>
      </div>
    </div>
  </section>
);
