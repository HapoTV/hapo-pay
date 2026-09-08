import React from 'react';
import { CloseIcon, RefreshIcon, CardIcon, InfoIcon } from '../../../components/icons';
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${widthClass} max-h-[90vh] overflow-y-auto rounded-[2rem] bg-white dark:bg-[#1A1830] border border-gray-200 dark:border-[#2A2740] shadow-2xl transition-colors duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-[#2A2740]">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6">{children}</div>

        <div className="px-6 py-5 border-t border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] transition-colors duration-200">
          {footer}
        </div>
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
        <button
          onClick={onClose}
          className="w-full rounded-full border border-gray-200 dark:border-[#2A2740] bg-white dark:bg-[#1A1830] px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-[#2A2740] sm:w-auto"
        >
          Cancel
        </button>

        <button
          onClick={onSend}
          disabled={
            !selectedChildId ||
            !emergencyAmount ||
            Number(emergencyAmount) <= 0
          }
          className="w-full rounded-full bg-[#7C5CFC] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6A4CE0] disabled:cursor-not-allowed disabled:bg-[#7C5CFC]/30 sm:w-auto"
        >
          Send Emergency Funds
        </button>
      </div>
    )}
  >
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select child
        </label>

        <select
          value={selectedChildId}
          onChange={(e) => onSelectChild(e.target.value)}
          className="mt-3 w-full rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-4 py-3 text-sm text-gray-900 dark:text-white shadow-sm focus:border-[#7C5CFC] focus:outline-none"
        >
          <option value="">Select child</option>

          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Emergency amount
        </label>

        <input
          type="number"
          min="0"
          step="0.01"
          value={emergencyAmount}
          onChange={(e) => onChangeAmount(e.target.value)}
          placeholder="0.00"
          className="mt-3 w-full rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[#7C5CFC] focus:outline-none"
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
        <button
          onClick={onClose}
          className="w-full rounded-full border border-gray-200 dark:border-[#2A2740] bg-white dark:bg-[#1A1830] px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-[#2A2740] sm:w-auto"
        >
          Cancel
        </button>

        <button
          onClick={onTopup}
          disabled={
            !topupChildId ||
            !topupAmount ||
            Number(topupAmount) <= 0
          }
          className="w-full rounded-full bg-[#7C5CFC] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6A4CE0] disabled:cursor-not-allowed disabled:bg-[#7C5CFC]/30 sm:w-auto"
        >
          Send Top-up
        </button>
      </div>
    )}
  >
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select child
        </label>

        <select
          value={topupChildId}
          onChange={(e) => onSelectChild(e.target.value)}
          className="mt-3 w-full rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-4 py-3 text-sm text-gray-900 dark:text-white shadow-sm focus:border-[#7C5CFC] focus:outline-none"
        >
          <option value="">Select child</option>

          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Top-up amount
        </label>

        <input
          type="number"
          min="0"
          step="0.01"
          value={topupAmount}
          onChange={(e) => onChangeAmount(e.target.value)}
          placeholder="0.00"
          className="mt-3 w-full rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[#7C5CFC] focus:outline-none"
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

export const RecurringModal: React.FC<RecurringModalProps> = ({
  open,
  onClose,
  onAddNew,
}) => (
  <ModalShell
    title="Recurring Auto Payments"
    open={open}
    onClose={onClose}
    footer={(
      <button
        onClick={onAddNew}
        className="w-full rounded-full bg-[#7C5CFC] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6A4CE0]"
      >
        + Add New Payment
      </button>
    )}
  >
    <div className="text-center">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100 dark:bg-[#0D0B1A] text-[#6D4AFF] dark:text-[#7C5CFC] transition-colors duration-200">
        <RefreshIcon className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        No recurring payments set up yet
      </h3>

      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Click "Add New Payment" to create your first recurring payment
      </p>
    </div>
  </ModalShell>
);

interface RecurringFormModalProps {
  open: boolean;
  onClose: () => void;
}

export const RecurringFormModal: React.FC<RecurringFormModalProps> = ({
  open,
  onClose,
}) => (
  <ModalShell
    title="Add Recurring Payment"
    open={open}
    onClose={onClose}
    footer={(
      <button
        onClick={onClose}
        className="w-full rounded-full bg-[#7C5CFC] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6A4CE0]"
      >
        Save Payment
      </button>
    )}
  >
    <div className="space-y-5">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Build your recurring payment here. This demo form is ready for your next integration.
      </p>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Payment name
        </label>

        <input
          type="text"
          className="mt-3 w-full rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[#7C5CFC] focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Amount
        </label>

        <input
          type="number"
          min="0"
          step="0.01"
          className="mt-3 w-full rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[#7C5CFC] focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Schedule
        </label>

        <select
          className="mt-3 w-full rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-4 py-3 text-sm text-gray-900 dark:text-white shadow-sm focus:border-[#7C5CFC] focus:outline-none"
        >
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

export const ManageLimitsModal: React.FC<ManageLimitsModalProps> = ({
  open,
  onClose,
}) => (
  <ModalShell
    title="Manage Spending Limits"
    open={open}
    onClose={onClose}
    footer={(
      <button
        onClick={onClose}
        className="w-full rounded-full bg-[#7C5CFC] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6A4CE0]"
      >
        Save changes
      </button>
    )}
  >
    <div className="space-y-5">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Use these controls to set spending limits for your children.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Weekly limit
          </label>

          <input
            type="number"
            min="0"
            className="mt-3 w-full rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-4 py-3 text-sm text-gray-900 dark:text-white shadow-sm focus:border-[#7C5CFC] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Daily limit
          </label>

          <input
            type="number"
            min="0"
            className="mt-3 w-full rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-4 py-3 text-sm text-gray-900 dark:text-white shadow-sm focus:border-[#7C5CFC] focus:outline-none"
          />
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
        <button
          onClick={onClose}
          className="w-full rounded-lg border border-gray-200 dark:border-[#2A2740] bg-white dark:bg-[#1A1830] px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-[#2A2740] sm:w-auto"
        >
          Cancel
        </button>

        <button
          onClick={onSubmit}
          disabled={!firstName || !lastName || !username || !password}
          className="w-full rounded-lg bg-[#7C5CFC] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#6A4CE0] disabled:cursor-not-allowed disabled:bg-[#7C5CFC]/30 sm:w-auto"
        >
          Create Account
        </button>
      </div>
    )}
  >
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          First Name
        </label>

        <input
          value={firstName}
          onChange={(e) => onChangeFirstName(e.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[#7C5CFC] focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Last Name
        </label>

        <input
          value={lastName}
          onChange={(e) => onChangeLastName(e.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[#7C5CFC] focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Username (email)
        </label>

        <input
          type="email"
          value={username}
          onChange={(e) => onChangeUsername(e.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[#7C5CFC] focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => onChangePassword(e.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[#7C5CFC] focus:outline-none"
        />
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Using same currency as parent account ({currency}). You can change it later using "Change Currency".
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Weekly Limit
          </label>

          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-l-lg border border-gray-200 dark:border-[#2A2740] bg-white dark:bg-[#1A1830] px-3 py-2 text-gray-700 dark:text-gray-300">
              {currency}
            </span>

            <input
              type="number"
              min="0"
              value={weeklyLimit}
              onChange={(e) => onChangeWeeklyLimit(e.target.value)}
              className="flex-1 rounded-r-lg border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-3 py-2 text-sm text-gray-900 dark:text-white shadow-sm focus:border-[#7C5CFC] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Daily Limit
          </label>

          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-l-lg border border-gray-200 dark:border-[#2A2740] bg-white dark:bg-[#1A1830] px-3 py-2 text-gray-700 dark:text-gray-300">
              {currency}
            </span>

            <input
              type="number"
              min="0"
              value={dailyLimit}
              onChange={(e) => onChangeDailyLimit(e.target.value)}
              className="flex-1 rounded-r-lg border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-3 py-2 text-sm text-gray-900 dark:text-white shadow-sm focus:border-[#7C5CFC] focus:outline-none"
            />
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
        <button
          onClick={onClose}
          className="w-full rounded-lg border border-gray-200 dark:border-[#2A2740] bg-white dark:bg-[#1A1830] px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-[#2A2740] sm:w-auto"
        >
          Cancel
        </button>

        <button
          onClick={onContinue}
          disabled={
            !amount ||
            Number(amount) <= 0 ||
            !selectedPaymentMethod
          }
          className="w-full rounded-lg bg-[#7C5CFC] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#6A4CE0] disabled:cursor-not-allowed disabled:bg-[#7C5CFC]/30 sm:w-auto"
        >
          Continue to Payment
        </button>
      </div>
    )}
  >
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Amount to Add
        </label>

        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => onChangeAmount(e.target.value)}
          placeholder="0.00"
          className="mt-3 w-full rounded-lg border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[#7C5CFC] focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Payment Method
        </label>

        <div className="mt-3 space-y-3">
          {[
            {
              value: 'card',
              label: 'Debit/Credit Card',
              description: 'Instant payment via card',
            },
            {
              value: 'eft',
              label: 'EFT / Bank Transfer',
              description: 'Transfer from your bank account',
            },
            {
              value: 'instant_eft',
              label: 'Instant EFT',
              description: 'Secure instant bank payment',
            },
          ].map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => onChangePaymentMethod(method.value)}
              className={`w-full text-left rounded-lg border p-3 flex items-center gap-3 transition-colors ${
                selectedPaymentMethod === method.value
                  ? 'border-[#7C5CFC]/60 bg-[#7C5CFC]/10'
                  : 'border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] hover:bg-gray-100 dark:hover:bg-[#24213A]'
              }`}
            >
              <div className="w-10 h-10 flex items-center justify-center bg-[#3ED9C2]/15 rounded-md text-[#0F9F8A] dark:text-[#3ED9C2] shrink-0">
                <CardIcon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {method.label}
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {method.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-cyan-200 dark:border-[#3ED9C2]/30 bg-cyan-50 dark:bg-[#151F35] p-3 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-[#0F9F8A] dark:text-[#3ED9C2]">
            <InfoIcon className="w-5 h-5" />
          </div>

          <div>
            Your payment is secure and encrypted. Funds will be available immediately after successful payment.
          </div>
        </div>
      </div>
    </div>
  </ModalShell>
);