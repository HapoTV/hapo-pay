import React, { useState, useRef } from 'react';
import { Gift } from 'lucide-react';

interface WalletReportModalProps {
  open: boolean;
  onClose: () => void;
}

export const WalletReportModal: React.FC<WalletReportModalProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'category' | 'safety'>('overview');

  if (!open) return null;

  const contentRef = useRef<HTMLDivElement | null>(null);

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
    pdf.save(`wallet-report-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Smart Transaction Reports</h2>
            <p className="text-sm text-slate-500">Overview</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>

        <div className="px-5 py-3">
          <div className="flex gap-3 mb-4">
            <button onClick={() => setActiveTab('overview')} className={`px-3 py-2 rounded-md text-sm ${activeTab === 'overview' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-700'}`}>Overview</button>
            <button onClick={() => setActiveTab('patterns')} className={`px-3 py-2 rounded-md text-sm ${activeTab === 'patterns' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-700'}`}>Spending Patterns</button>
            <button onClick={() => setActiveTab('category')} className={`px-3 py-2 rounded-md text-sm ${activeTab === 'category' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-700'}`}>Category Breakdown</button>
            <button onClick={() => setActiveTab('safety')} className={`px-3 py-2 rounded-md text-sm ${activeTab === 'safety' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-700'}`}>Safety Alerts</button>
          </div>

          <div className="max-h-[55vh] overflow-y-auto" ref={contentRef}>
            {activeTab === 'overview' && (
              <div>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 mb-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-white">
                        <Gift size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Total Spending</p>
                        <p className="text-base font-semibold text-slate-900">R0.00</p>
                        <p className="text-xs text-rose-500">+12% from last month</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-xs text-slate-500">Total Transactions</p>
                    <p className="text-base font-semibold text-slate-900">0</p>
                    <p className="text-xs text-red-500">-8% from last month</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-xs text-slate-500">Average Transaction</p>
                    <p className="text-base font-semibold text-slate-900">R0.00</p>
                    <p className="text-xs text-red-500">-3% from last month</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900 mb-2">Monthly Spending Trend</p>
                  <div className="flex items-end gap-3 h-28">
                    {['Jan','Feb','Mar','Apr','May'].map((m, idx) => (
                      <div key={m} className="flex-1">
                        <div className="mx-auto bg-rose-500 w-full rounded-t-md" style={{height: `${(idx+4)*8}px`}} />
                        <p className="text-xs text-slate-500 text-center mt-2">{m}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'patterns' && (
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-4">Spending Pattern Analysis</p>
                <div className="space-y-4 mb-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500 text-white">🕒</div>
                    <div>
                      <p className="font-semibold text-slate-900">Peak Spending Hours</p>
                      <p className="text-sm text-slate-500">Most transactions occur between 12:00 PM - 2:00 PM (lunch time)</p>
                      <p className="text-xs text-sky-500 mt-2">68% of daily transactions</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">📍</div>
                    <div>
                      <p className="font-semibold text-slate-900">Common Locations</p>
                      <p className="text-sm text-slate-500">School cafeteria and nearby convenience stores</p>
                      <p className="text-xs text-sky-500 mt-2">85% of all transactions</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white">📅</div>
                    <div>
                      <p className="font-semibold text-slate-900">Spending Frequency</p>
                      <p className="text-sm text-slate-500">Regular daily spending with weekend increases</p>
                      <p className="text-xs text-sky-500 mt-2">2.3 transactions/day average</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-900 mb-2">Weekly Spending Pattern</p>
                <div className="rounded-2xl border border-slate-200 bg-white p-8 h-36" />
              </div>
            )}

            {activeTab === 'category' && (
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-3">Spending by Category</p>
                <p className="text-xs text-slate-500 mb-3">Spending Insights</p>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 h-20" />
              </div>
            )}

            {activeTab === 'safety' && (
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-3">Safety Alerts & Notifications</p>
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 mb-4">
                  <p className="text-emerald-700">✔️ All spending patterns are normal</p>
                </div>

                <p className="text-sm font-semibold text-slate-900 mb-2">Recent Safety Events</p>
                <p className="text-sm text-slate-600 mb-3">Unusual Spending Detection</p>

                <div className="space-y-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 flex items-center justify-between">
                    <div>Out-of-hours spending alerts</div>
                    <div className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Enabled</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-3 flex items-center justify-between">
                    <div>Unknown location alerts</div>
                    <div className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Enabled</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-3 flex items-center justify-between">
                    <div>Large transaction alerts</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Enabled (&gt; 25.00)</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-3 flex items-center justify-between">
                    <div>Spending pattern changes</div>
                    <div className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Enabled</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-600">&nbsp;</div>
          <div className="flex gap-3">
            <button onClick={exportReport} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Export Report</button>
            <button onClick={onClose} className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-600">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};
