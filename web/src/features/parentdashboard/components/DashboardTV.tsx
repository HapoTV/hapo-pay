import React, { useState, useCallback } from 'react';
import { CloseIcon } from '../../../components/icons';

// Types
type TVAccount = {
  id: string;
  accountHolder: string;
  accountNumber: string;
};

type PaymentSource = 'family' | 'savings';

type PaymentHistoryItem = {
  id: string;
  accountHolder: string;
  accountNumber: string;
  amount: number;
  date: string;
  status: string;
};

interface DashboardTVProps {
  tvTab: 'pay' | 'history';
  setTvTab: (value: 'pay' | 'history') => void;
  closeTvModal: () => void;
  familyBalance: number;
  savings: number;
  mockTvHistory: PaymentHistoryItem[];
  onPaymentComplete?: () => void;
}

// Constants
const VERIFICATION_DELAY = 1000;
const PAYMENT_PROCESSING_DELAY = 1500;

const DEMO_ACCOUNTS: Record<string, TVAccount> = {
  '6789012345': {
    id: '1',
    accountHolder: 'John Doe',
    accountNumber: '6789012345',
  },
  '5678901234': {
    id: '2',
    accountHolder: 'Jane Smith',
    accountNumber: '5678901234',
  },
  '1234567890': {
    id: '3',
    accountHolder: 'Michael Johnson',
    accountNumber: '1234567890',
  },
};

const DEMO_IDS = Object.keys(DEMO_ACCOUNTS).join(', ');

// Error Messages
const ERROR_MESSAGES = {
  EMPTY_ID: 'Please enter a DSTV account ID',
  ACCOUNT_NOT_FOUND: 'Account ID not found. Please check and try again.',
  INVALID_AMOUNT: 'Please enter a valid amount',
  INSUFFICIENT_BALANCE: 'Insufficient balance. Available: R{balance}',
} as const;

export const DashboardTV: React.FC<DashboardTVProps> = ({
  tvTab,
  setTvTab,
  closeTvModal,
  familyBalance,
  savings,
  mockTvHistory,
  onPaymentComplete,
}) => {
  // Step 1: Account verification state
  const [dstvId, setDstvId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  // Step 2: Account confirmation state
  const [verifiedAccount, setVerifiedAccount] =
    useState<TVAccount | null>(null);
  const [accountConfirmed, setAccountConfirmed] = useState(false);

  // Step 3: Payment details state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentSource, setPaymentSource] =
    useState<PaymentSource>('family');
  const [paymentError, setPaymentError] = useState('');

  // Step 4: Confirmation state
  const [showPaymentConfirmation, setShowPaymentConfirmation] =
    useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handlers
  const handleVerifyAccount = useCallback(async () => {
    if (!dstvId.trim()) {
      setVerificationError(ERROR_MESSAGES.EMPTY_ID);
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    setTimeout(() => {
      const account = DEMO_ACCOUNTS[dstvId];

      if (account) {
        setVerifiedAccount(account);
        setVerificationError('');
      } else {
        setVerificationError(ERROR_MESSAGES.ACCOUNT_NOT_FOUND);
        setVerifiedAccount(null);
      }

      setIsVerifying(false);
    }, VERIFICATION_DELAY);
  }, [dstvId]);

  const handleConfirmAccount = useCallback(() => {
    setAccountConfirmed(true);
    setPaymentAmount('');
    setPaymentError('');
  }, []);

  const handleProceedToPayment = useCallback(() => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      setPaymentError(ERROR_MESSAGES.INVALID_AMOUNT);
      return;
    }

    const availableBalance =
      paymentSource === 'family' ? familyBalance : savings;

    if (Number(paymentAmount) > availableBalance) {
      setPaymentError(
        ERROR_MESSAGES.INSUFFICIENT_BALANCE.replace(
          '{balance}',
          availableBalance.toFixed(2)
        )
      );
      return;
    }

    setPaymentError('');
    setShowPaymentConfirmation(true);
  }, [paymentAmount, paymentSource, familyBalance, savings]);

  const handleConfirmPayment = useCallback(async () => {
    setIsProcessing(true);

    setTimeout(() => {
      const sourceLabel =
        paymentSource === 'family' ? 'Family Balance' : 'Savings';

      alert(
        `✓ Payment successful!\n\nR${Number(paymentAmount).toFixed(
          2
        )} has been paid for DSTV account ${
          verifiedAccount?.accountNumber
        }\nfrom your ${sourceLabel}.`
      );

      resetForm();

      if (onPaymentComplete) {
        onPaymentComplete();
      }
    }, PAYMENT_PROCESSING_DELAY);
  }, [paymentAmount, paymentSource, verifiedAccount, onPaymentComplete]);

  const resetForm = useCallback(() => {
    setDstvId('');
    setVerifiedAccount(null);
    setAccountConfirmed(false);
    setPaymentAmount('');
    setPaymentSource('family');
    setVerificationError('');
    setPaymentError('');
    setShowPaymentConfirmation(false);
    setIsProcessing(false);
  }, []);

  const handleReset = useCallback(() => {
    resetForm();
  }, [resetForm]);

  // Render Tab Navigation
  const renderTabNavigation = () => (
    <div className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200 dark:border-[#2A2740]">
      <button
        onClick={() => setTvTab('pay')}
        className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
          tvTab === 'pay'
            ? 'border-b-2 border-[#7C5CFC] text-[#6D4AFF] dark:text-[#B39DFF]'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        Pay for DSTV
      </button>

      <button
        onClick={() => setTvTab('history')}
        className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
          tvTab === 'history'
            ? 'border-b-2 border-[#7C5CFC] text-[#6D4AFF] dark:text-[#B39DFF]'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        History
      </button>
    </div>
  );

  // Render Payment Source Button
  const renderPaymentSourceButton = (
    source: PaymentSource,
    label: string,
    balance: number
  ) => (
    <button
      onClick={() => setPaymentSource(source)}
      className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
        paymentSource === source
          ? 'border-[#7C5CFC] bg-[#7C5CFC]/10'
          : 'border-gray-200 bg-white hover:border-gray-300 dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:hover:border-gray-500'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white">
            {label}
          </p>

          <p className="text-xs text-gray-600 dark:text-gray-400">
            Available: R{balance.toFixed(2)}
          </p>
        </div>

        <div
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
            paymentSource === source
              ? 'border-[#7C5CFC] bg-[#7C5CFC]'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          {paymentSource === source && (
            <div className="h-2 w-2 rounded-full bg-white" />
          )}
        </div>
      </div>
    </button>
  );

  // Render Payment History
  const renderPaymentHistory = () => (
    <div className="max-h-[600px] space-y-3 overflow-y-auto">
      {mockTvHistory.length > 0 ? (
        mockTvHistory.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 dark:border-[#2A2740] dark:bg-[#1A1830] dark:hover:bg-[#211E38]"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold text-gray-900 dark:text-white">
                {item.accountHolder}
              </p>

              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                  item.status === 'Success'
                    ? 'bg-green-50 text-[#16A34A] dark:bg-[#22C55E]/15 dark:text-[#4ADE80]'
                    : 'bg-gray-100 text-gray-700 dark:bg-[#0D0B1A] dark:text-gray-300'
                }`}
              >
                {item.status}
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Account: {item.accountNumber}
            </p>

            <div className="mt-3 flex flex-col gap-2 border-t border-gray-200 pt-3 dark:border-[#2A2740] sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.date}
              </p>

              <p className="font-semibold text-gray-900 dark:text-white">
                R{item.amount.toFixed(2)}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 py-8 text-center dark:border-[#2A2740] dark:bg-[#1A1830]">
          <p className="text-gray-600 dark:text-gray-400">
            No payment history yet.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 transition-colors duration-200 dark:bg-[#0D0B1A] dark:text-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 dark:border-[#2A2740] dark:bg-[#1A1830] sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            DSTV Payment
          </h1>

          <button
            onClick={closeTvModal}
            className="shrink-0 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Close"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
        {renderTabNavigation()}

        {/* Pay Tab */}
        {tvTab === 'pay' && (
          <div className="space-y-6">
            {/* Step 1: Enter DSTV Account ID */}
            {!verifiedAccount && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-[#2A2740] dark:bg-[#1A1830] sm:p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Step 1: Link Your DSTV Account
                </h2>

                <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                  Enter your ID number linked to your DSTV account or the
                  decoder number
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      DSTV Account/Decoder Number
                    </label>

                    <input
                      type="text"
                      value={dstvId}
                      onChange={(e) => {
                        setDstvId(e.target.value);
                        setVerificationError('');
                      }}
                      placeholder="e.g., 6789012345"
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#7C5CFC] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white dark:placeholder-gray-500"
                    />

                    {verificationError && (
                      <p className="mt-2 text-xs text-[#DC2626] dark:text-[#F87171]">
                        {verificationError}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleVerifyAccount}
                    disabled={isVerifying || !dstvId.trim()}
                    className="w-full rounded-lg bg-[#7C5CFC] py-3 font-semibold text-white transition hover:bg-[#6A4CE0] disabled:cursor-not-allowed disabled:bg-[#7C5CFC]/30"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Account'}
                  </button>

                  <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-500">
                    Demo IDs: {DEMO_IDS}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Account Confirmation */}
            {verifiedAccount && !accountConfirmed && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-[#2A2740] dark:bg-[#1A1830] sm:p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Step 2: Confirm Your Account
                </h2>

                <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                  Please confirm this is your DStv account:
                </p>

                <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-[#2A2740] dark:bg-[#0D0B1A]">
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Account Holder:
                      </span>

                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {verifiedAccount.accountHolder}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Account Number:
                      </span>

                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {verifiedAccount.accountNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleReset}
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-100 dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-gray-300 dark:hover:bg-[#2A2740]"
                  >
                    No, Try Again
                  </button>

                  <button
                    onClick={handleConfirmAccount}
                    className="flex-1 rounded-lg bg-[#7C5CFC] px-4 py-2 font-medium text-white transition hover:bg-[#6A4CE0]"
                  >
                    Yes, This is My Account
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Details */}
            {verifiedAccount &&
              accountConfirmed &&
              !showPaymentConfirmation && (
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-[#2A2740] dark:bg-[#1A1830] sm:p-6">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Step 3: Payment Details
                  </h2>

                  <div className="space-y-6">
                    {/* Amount Input */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Amount to Pay
                      </label>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          R
                        </span>

                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => {
                            setPaymentAmount(e.target.value);
                            setPaymentError('');
                          }}
                          placeholder="0.00"
                          min="0"
                          step="10"
                          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#7C5CFC] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white dark:placeholder-gray-500"
                        />
                      </div>

                      {paymentError && (
                        <p className="mt-2 text-xs text-[#DC2626] dark:text-[#F87171]">
                          {paymentError}
                        </p>
                      )}
                    </div>

                    {/* Payment Source */}
                    <div>
                      <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Pay From
                      </label>

                      <div className="space-y-2">
                        {renderPaymentSourceButton(
                          'family',
                          'Family Balance',
                          familyBalance
                        )}

                        {renderPaymentSourceButton(
                          'savings',
                          'Savings',
                          savings
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleProceedToPayment}
                      disabled={
                        !paymentAmount || Number(paymentAmount) <= 0
                      }
                      className="w-full rounded-lg bg-[#7C5CFC] py-3 font-semibold text-white transition hover:bg-[#6A4CE0] disabled:cursor-not-allowed disabled:bg-[#7C5CFC]/30"
                    >
                      Review Payment
                    </button>
                  </div>
                </div>
              )}

            {/* Step 4: Review and Confirm */}
            {showPaymentConfirmation && verifiedAccount && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-[#2A2740] dark:bg-[#1A1830] sm:p-6">
                <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                  Step 4: Review and Pay
                </h2>

                <div className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-[#2A2740] dark:bg-[#0D0B1A]">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Account:
                    </span>

                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {verifiedAccount.accountHolder}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Account Number:
                    </span>

                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {verifiedAccount.accountNumber}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 border-t border-gray-200 pt-4 dark:border-[#2A2740] sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Payment Amount:
                    </span>

                    <span className="text-lg font-bold text-[#6D4AFF] dark:text-[#B39DFF]">
                      R{Number(paymentAmount).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      From:
                    </span>

                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {paymentSource === 'family'
                        ? 'Family Balance'
                        : 'Savings'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => setShowPaymentConfirmation(false)}
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-100 dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-gray-300 dark:hover:bg-[#2A2740]"
                  >
                    Back
                  </button>

                  <button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    className="flex-1 rounded-lg bg-[#7C5CFC] px-4 py-3 font-semibold text-white transition hover:bg-[#6A4CE0] disabled:cursor-not-allowed disabled:bg-[#7C5CFC]/30"
                  >
                    {isProcessing ? 'Processing...' : 'Pay'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {tvTab === 'history' && renderPaymentHistory()}
      </div>
    </div>
  );
};