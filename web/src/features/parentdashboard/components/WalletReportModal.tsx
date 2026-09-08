import React, { useState, useRef } from 'react';
import { Gift } from 'lucide-react';

interface WalletReportModalProps {
  open: boolean;
  onClose: () => void;
}

export const WalletReportModal: React.FC<WalletReportModalProps> = ({
  open,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'patterns' | 'category' | 'safety'
  >('overview');

  const contentRef = useRef<HTMLDivElement | null>(null);

  if (!open) return null;

  const exportReport = async () => {
    if (!contentRef.current) return;

    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const canvas = await html2canvas(contentRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(
      `wallet-report-${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#1A1830] border border-gray-200 dark:border-[#2A2740] shadow-xl overflow-hidden transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2A2740]">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Smart Transaction Reports
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Overview
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Close report"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 py-3">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap px-3 py-2 rounded-md text-sm transition ${
                activeTab === 'overview'
                  ? 'bg-[#7C5CFC] text-white'
                  : 'bg-gray-100 dark:bg-[#0D0B1A] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#24213A]'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setActiveTab('patterns')}
              className={`whitespace-nowrap px-3 py-2 rounded-md text-sm transition ${
                activeTab === 'patterns'
                  ? 'bg-[#7C5CFC] text-white'
                  : 'bg-gray-100 dark:bg-[#0D0B1A] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#24213A]'
              }`}
            >
              Spending Patterns
            </button>

            <button
              onClick={() => setActiveTab('category')}
              className={`whitespace-nowrap px-3 py-2 rounded-md text-sm transition ${
                activeTab === 'category'
                  ? 'bg-[#7C5CFC] text-white'
                  : 'bg-gray-100 dark:bg-[#0D0B1A] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#24213A]'
              }`}
            >
              Category Breakdown
            </button>

            <button
              onClick={() => setActiveTab('safety')}
              className={`whitespace-nowrap px-3 py-2 rounded-md text-sm transition ${
                activeTab === 'safety'
                  ? 'bg-[#7C5CFC] text-white'
                  : 'bg-gray-100 dark:bg-[#0D0B1A] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#24213A]'
              }`}
            >
              Safety Alerts
            </button>
          </div>

          {/* Report Content */}
          <div
            className="max-h-[55vh] overflow-y-auto"
            ref={contentRef}
          >
            {/* Overview */}
            {activeTab === 'overview' && (
              <div>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 mb-3">

                  {/* Total Spending */}
                  <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7C5CFC] text-white">
                        <Gift size={18} />
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Total Spending
                        </p>

                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          R0.00
                        </p>

                        <p className="text-xs text-[#6D4AFF] dark:text-[#B39DFF]">
                          +12% from last month
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Total Transactions */}
                  <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-3 shadow-sm">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Total Transactions
                    </p>

                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      0
                    </p>

                    <p className="text-xs text-red-600 dark:text-[#F87171]">
                      -8% from last month
                    </p>
                  </div>

                  {/* Average Transaction */}
                  <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-3 shadow-sm">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Average Transaction
                    </p>

                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      R0.00
                    </p>

                    <p className="text-xs text-red-600 dark:text-[#F87171]">
                      -3% from last month
                    </p>
                  </div>
                </div>

                {/* Monthly Spending Trend */}
                <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-3 shadow-sm">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Monthly Spending Trend
                  </p>

                  <div className="flex items-end gap-3 h-28">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((m, idx) => (
                      <div key={m} className="flex-1">
                        <div
                          className="mx-auto bg-[#7C5CFC] w-full rounded-t-md"
                          style={{
                            height: `${(idx + 4) * 8}px`,
                          }}
                        />

                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                          {m}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Spending Patterns */}
            {activeTab === 'patterns' && (
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Spending Pattern Analysis
                </p>

                <div className="space-y-4 mb-4">

                  {/* Peak Spending Hours */}
                  <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-4 shadow-sm flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7C5CFC] text-white">
                      🕒
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Peak Spending Hours
                      </p>

                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Most transactions occur between 12:00 PM - 2:00 PM
                        (lunch time)
                      </p>

                      <p className="text-xs text-[#0F9F8A] dark:text-[#3ED9C2] mt-2">
                        68% of daily transactions
                      </p>
                    </div>
                  </div>

                  {/* Common Locations */}
                  <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-4 shadow-sm flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#22C55E] text-white">
                      📍
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Common Locations
                      </p>

                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        School cafeteria and nearby convenience stores
                      </p>

                      <p className="text-xs text-[#0F9F8A] dark:text-[#3ED9C2] mt-2">
                        85% of all transactions
                      </p>
                    </div>
                  </div>

                  {/* Spending Frequency */}
                  <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-4 shadow-sm flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F97316] text-white">
                      📅
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Spending Frequency
                      </p>

                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Regular daily spending with weekend increases
                      </p>

                      <p className="text-xs text-[#0F9F8A] dark:text-[#3ED9C2] mt-2">
                        2.3 transactions/day average
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Weekly Spending Pattern
                </p>

                <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-8 h-36" />
              </div>
            )}

            {/* Category Breakdown */}
            {activeTab === 'category' && (
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Spending by Category
                </p>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Spending Insights
                </p>

                <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-4 h-20" />
              </div>
            )}

            {/* Safety Alerts */}
            {activeTab === 'safety' && (
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Safety Alerts & Notifications
                </p>

                {/* Normal Spending Alert */}
                <div className="rounded-lg bg-green-50 dark:bg-[#14291F] border border-green-200 dark:border-[#22C55E]/30 p-3 mb-4">
                  <p className="text-green-700 dark:text-[#4ADE80]">
                    ✔️ All spending patterns are normal
                  </p>
                </div>

                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Recent Safety Events
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Unusual Spending Detection
                </p>

                <div className="space-y-2">

                  {/* Out-of-hours */}
                  <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-3 flex items-center justify-between gap-3">
                    <div className="text-gray-700 dark:text-gray-300">
                      Out-of-hours spending alerts
                    </div>

                    <div className="text-xs text-green-700 dark:text-[#4ADE80] bg-green-100 dark:bg-[#22C55E]/15 px-2 py-1 rounded-full whitespace-nowrap">
                      Enabled
                    </div>
                  </div>

                  {/* Unknown Location */}
                  <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-3 flex items-center justify-between gap-3">
                    <div className="text-gray-700 dark:text-gray-300">
                      Unknown location alerts
                    </div>

                    <div className="text-xs text-green-700 dark:text-[#4ADE80] bg-green-100 dark:bg-[#22C55E]/15 px-2 py-1 rounded-full whitespace-nowrap">
                      Enabled
                    </div>
                  </div>

                  {/* Large Transaction */}
                  <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-3 flex items-center justify-between gap-3">
                    <div className="text-gray-700 dark:text-gray-300">
                      Large transaction alerts
                    </div>

                    <div className="text-xs text-green-700 dark:text-[#4ADE80] bg-green-100 dark:bg-[#22C55E]/15 px-2 py-1 rounded-full whitespace-nowrap">
                      Enabled (&gt; 25.00)
                    </div>
                  </div>

                  {/* Spending Pattern Changes */}
                  <div className="rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-3 flex items-center justify-between gap-3">
                    <div className="text-gray-700 dark:text-gray-300">
                      Spending pattern changes
                    </div>

                    <div className="text-xs text-green-700 dark:text-[#4ADE80] bg-green-100 dark:bg-[#22C55E]/15 px-2 py-1 rounded-full whitespace-nowrap">
                      Enabled
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            &nbsp;
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportReport}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-[#2A2740] bg-white dark:bg-[#1A1830] px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2A2740] transition"
            >
              Export Report
            </button>

            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-full bg-[#7C5CFC] px-3 py-2 text-sm font-semibold text-white hover:bg-[#6A4CE0] transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};