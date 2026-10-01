import React from 'react';

interface DashboardSearchNoticeProps {
  onClose: () => void;
}

export const DashboardSearchNotice: React.FC<DashboardSearchNoticeProps> = ({ onClose }) => (
  <section className="bg-white border-b border-slate-200 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Search</h2>
          <p className="mt-1 text-sm text-slate-500">Search functionality coming soon! You will be able to search for transactions, children, and more.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
        >
          OK
        </button>
      </div>
    </div>
  </section>
);
