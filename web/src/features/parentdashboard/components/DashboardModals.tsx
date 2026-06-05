import React from 'react';
import type { Child } from '../types';

interface ModalShellProps {
  title: string;
  open: boolean;
  onClose: () => void;
  footer: React.ReactNode;
  widthClass?: string;
  children: React.ReactNode;
}

const ModalShell: React.FC<ModalShellProps> = ({
  title,
  open,
  onClose,
  footer,
  widthClass = 'max-w-xl',
  children,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div className={`w-full ${widthClass} rounded-[2rem] bg-white shadow-2xl overflow-hidden`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
        <div className="px-6 py-5 border-t border-slate-200 bg-slate-50">{footer}</div>
      </div>
    </div>
  );
};

interface EmergencyFundModalProps {
  open: boolean;
  onClose: () => void;
  children: Child[];
  selectedChildId: string;
  onSelectChild: (id: string) => void;
  emergencyAmount: string;
  onChangeAmount: (value: string) => void;
  onSend: () => void;
}

export const EmergencyFundModal: React.FC<EmergencyFundModalProps> = ({
  open,
  onClose,
  children,
  selectedChildId,
  onSelectChild,
  emergencyAmount,
  onChangeAmount,
  onSend,
}) => (
  <ModalShell
    title="Emergency Fund Transfer"
    open={open}
    onClose={onClose}
    footer={(
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:items-center">
        <button onClick={onClose} className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto">Cancel</button>
        <button onClick={onSend} disabled={!selectedChildId || !emergencyAmount || Number(emergencyAmount) <= 0} className="w-full rounded-full bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300 sm:w-auto">Send Emergency Funds</button>
      </div>
    )}
  >
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-slate-700">Select child</label>
        <select value={selectedChildId} onChange={(e) => onSelectChild(e.target.value)} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none">
          <option value="">Select child</option>
          {children.map((child) => (
            <option key={child.id} value={child.id}>{child.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Emergency amount</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={emergencyAmount}
          onChange={(e) => onChangeAmount(e.target.value)}
          placeholder="0.00"
          className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none"
        />
      </div>
    </div>
  </ModalShell>
);

interface WalletTopupModalProps {
  open: boolean;
  onClose: () => void;
  children: Child[];
  topupChildId: string;
  onSelectChild: (id: string) => void;
  topupAmount: string;
  onChangeAmount: (value: string) => void;
  onTopup: () => void;
}

export const WalletTopupModal: React.FC<WalletTopupModalProps> = ({
  open,
  onClose,
  children,
  topupChildId,
  onSelectChild,
  topupAmount,
  onChangeAmount,
  onTopup,
}) => (
  <ModalShell
    title="Top-up Child's Wallet"
    open={open}
    onClose={onClose}
    footer={(
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:items-center">
        <button onClick={onClose} className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto">Cancel</button>
        <button onClick={onTopup} disabled={!topupChildId || !topupAmount || Number(topupAmount) <= 0} className="w-full rounded-full bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300 sm:w-auto">Send Top-up</button>
      </div>
    )}
  >
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-slate-700">Select child</label>
        <select value={topupChildId} onChange={(e) => onSelectChild(e.target.value)} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none">
          <option value="">Select child</option>
          {children.map((child) => (
            <option key={child.id} value={child.id}>{child.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Top-up amount</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={topupAmount}
          onChange={(e) => onChangeAmount(e.target.value)}
          placeholder="0.00"
          className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none"
        />
      </div>
    </div>
  </ModalShell>
);

interface RecurringModalProps {
  open: boolean;
  onClose: () => void;
  onAddNew: () => void;
}

export const RecurringModal: React.FC<RecurringModalProps> = ({ open, onClose, onAddNew }) => (
  <ModalShell
    title="Recurring Auto Payments"
    open={open}
    onClose={onClose}
    footer={(
      <button onClick={onAddNew} className="w-full rounded-full bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600">+ Add New Payment</button>
    )}
  >
    <div className="text-center">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-rose-500">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 1l4 4m0 0l-4 4m4-4H7a6 6 0 00-6 6v3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15l4 4m0 0l4-4m-4 4V7a6 6 0 016-6h3" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-950">No recurring payments set up yet</h3>
      <p className="mt-2 text-sm text-slate-500">Click "Add New Payment" to create your first recurring payment</p>
    </div>
  </ModalShell>
);

interface RecurringFormModalProps {
  open: boolean;
  onClose: () => void;
}

export const RecurringFormModal: React.FC<RecurringFormModalProps> = ({ open, onClose }) => (
  <ModalShell
    title="Add Recurring Payment"
    open={open}
    onClose={onClose}
    footer={(
      <button onClick={onClose} className="w-full rounded-full bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600">Save Payment</button>
    )}
  >
    <div className="space-y-5">
      <p className="text-sm text-slate-500">Build your recurring payment here. This demo form is ready for your next integration.</p>
      <div>
        <label className="text-sm font-medium text-slate-700">Payment name</label>
        <input type="text" className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none" />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Amount</label>
        <input type="number" min="0" step="0.01" className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none" />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Schedule</label>
        <select className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
    </div>
  </ModalShell>
);

interface ManageLimitsModalProps {
  open: boolean;
  onClose: () => void;
}

export const ManageLimitsModal: React.FC<ManageLimitsModalProps> = ({ open, onClose }) => (
  <ModalShell
    title="Manage Spending Limits"
    open={open}
    onClose={onClose}
    footer={(
      <button onClick={onClose} className="w-full rounded-full bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600">Save changes</button>
    )}
  >
    <div className="space-y-5">
      <p className="text-sm text-slate-500">Use these controls to set spending limits for your children.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Weekly limit</label>
          <input type="number" min="0" className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Daily limit</label>
          <input type="number" min="0" className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none" />
        </div>
      </div>
    </div>
  </ModalShell>
);

interface AddChildModalProps {
  open: boolean;
  onClose: () => void;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  weeklyLimit: string;
  dailyLimit: string;
  onChangeFirstName: (value: string) => void;
  onChangeLastName: (value: string) => void;
  onChangeUsername: (value: string) => void;
  onChangePassword: (value: string) => void;
  onChangeWeeklyLimit: (value: string) => void;
  onChangeDailyLimit: (value: string) => void;
  onSubmit: () => void;
  currency: string;
}

export const AddChildModal: React.FC<AddChildModalProps> = ({
  open,
  onClose,
  firstName,
  lastName,
  username,
  password,
  weeklyLimit,
  dailyLimit,
  onChangeFirstName,
  onChangeLastName,
  onChangeUsername,
  onChangePassword,
  onChangeWeeklyLimit,
  onChangeDailyLimit,
  onSubmit,
  currency,
}) => (
  <ModalShell
    title="Create Child Account"
    open={open}
    onClose={onClose}
    footer={(
      <div className="flex gap-2 flex-col sm:flex-row sm:justify-end sm:items-center">
        <button onClick={onClose} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto">Cancel</button>
        <button onClick={onSubmit} disabled={!firstName || !lastName || !username || !password} className="w-full rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300 sm:w-auto">Create Account</button>
      </div>
    )}
  >
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">First Name</label>
        <input value={firstName} onChange={(e) => onChangeFirstName(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none" />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Last Name</label>
        <input value={lastName} onChange={(e) => onChangeLastName(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none" />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Username (email)</label>
        <input type="email" value={username} onChange={(e) => onChangeUsername(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none" />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Password</label>
        <input type="password" value={password} onChange={(e) => onChangePassword(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none" />
      </div>
      <p className="text-sm text-slate-600">Using same currency as parent account ({currency}). You can change it later using "Change Currency".</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Weekly Limit</label>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-3 py-2 rounded-l-lg border border-slate-200 bg-slate-50 text-slate-700">{currency}</span>
            <input type="number" min="0" value={weeklyLimit} onChange={(e) => onChangeWeeklyLimit(e.target.value)} className="flex-1 rounded-r-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Daily Limit</label>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-3 py-2 rounded-l-lg border border-slate-200 bg-slate-50 text-slate-700">{currency}</span>
            <input type="number" min="0" value={dailyLimit} onChange={(e) => onChangeDailyLimit(e.target.value)} className="flex-1 rounded-r-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none" />
          </div>
        </div>
      </div>
    </div>
  </ModalShell>
);

interface AddMoneyModalProps {
  open: boolean;
  onClose: () => void;
  amount: string;
  onChangeAmount: (value: string) => void;
  selectedPaymentMethod: string;
  onChangePaymentMethod: (value: string) => void;
  onContinue: () => void;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  open,
  onClose,
  amount,
  onChangeAmount,
  selectedPaymentMethod,
  onChangePaymentMethod,
  onContinue,
}) => (
  <ModalShell
    title="Add Money to Your Account"
    open={open}
    onClose={onClose}
    footer={(
      <div className="flex gap-2 flex-col sm:flex-row sm:justify-end sm:items-center">
        <button onClick={onClose} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto">Cancel</button>
        <button onClick={onContinue} disabled={!amount || Number(amount) <= 0 || !selectedPaymentMethod} className="w-full rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300 sm:w-auto">Continue to Payment</button>
      </div>
    )}
  >
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">Amount to Add</label>
        <input type="number" min="0" step="0.01" value={amount} onChange={(e) => onChangeAmount(e.target.value)} placeholder="0.00" className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none" />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Payment Method</label>
        <div className="mt-3 space-y-3">
          {[
            { value: 'card', label: 'Debit/Credit Card', description: 'Instant payment via card' },
            { value: 'eft', label: 'EFT / Bank Transfer', description: 'Transfer from your bank account' },
            { value: 'instant_eft', label: 'Instant EFT', description: 'Secure instant bank payment' },
          ].map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => onChangePaymentMethod(method.value)}
              className={`w-full text-left rounded-lg border p-3 flex items-center gap-3 ${selectedPaymentMethod === method.value ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
            >
              <div className="w-10 h-10 flex items-center justify-center bg-sky-50 rounded-md text-sky-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 7a2 2 0 012-2h12a2 2 0 012 2v2H2V7z"/><path d="M2 11h16v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z"/></svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{method.label}</div>
                <div className="text-xs text-slate-500">{method.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700">
        <div className="flex items-start gap-3">
          <div className="text-sky-500 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a7 7 0 100 14A7 7 0 009 2zM8 6h2v5H8V6zm1 8a1 1 0 110-2 1 1 0 010 2z"/></svg>
          </div>
          <div>Your payment is secure and encrypted. Funds will be available immediately after successful payment.</div>
        </div>
      </div>
    </div>
  </ModalShell>
);
