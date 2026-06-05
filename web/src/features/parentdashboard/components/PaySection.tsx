import React from 'react';

type PaymentRecord = {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  status: string;
};

interface PaySectionProps {
  payments: PaymentRecord[];
}

export const PaySection: React.FC<PaySectionProps> = ({ payments }) => {
  return (
    <div className="pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-500">QR-Based Payments</p>
              <p className="mt-3 text-slate-600 max-w-2xl leading-relaxed">Make fast QR payments, scan merchant codes, and complete transactions in seconds.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col items-center justify-center gap-3 py-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.75rem] bg-rose-500 text-white shadow-md">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <path d="M8 8h1v1H8V8zM8 15h1v1H8v-1zM15 8h1v1h-1V8zM15 15h1v1h-1v-1zM8 11h1v1H8v-1zM11 8h1v1h-1V8zM11 15h1v1h-1v-1zM15 11h1v1h-1v-1z" />
              </svg>
            </div>
            <div className="text-center max-w-xl">
              <h2 className="text-xl font-semibold text-slate-950">Scan QR Code</h2>
              <p className="mt-2 text-sm text-slate-600">Scan merchant QR codes to make instant payments from your family balance or savings account.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-slate-950 text-sm font-semibold">Recent QR Payments</div>
          <div className="space-y-1">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-3xl border border-slate-200 bg-white p-1.5 shadow-sm">
                <div className="flex items-center justify-between gap-1.5">
                  <div>
                    <p className="text-[0.7rem] font-semibold text-slate-950">{payment.merchant}</p>
                    <p className="mt-0.5 text-[0.6rem] leading-tight text-slate-500">{payment.date}</p>
                  </div>
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[0.6rem] font-semibold text-rose-600">{payment.status}</span>
                </div>
                <div className="mt-1 text-sm font-semibold leading-tight text-slate-950">R{payment.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
