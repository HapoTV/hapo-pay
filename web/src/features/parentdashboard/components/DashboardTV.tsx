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
  '6789012345': { id: '1', accountHolder: 'John Doe', accountNumber: '6789012345' },
  '5678901234': { id: '2', accountHolder: 'Jane Smith', accountNumber: '5678901234' },
  '1234567890': { id: '3', accountHolder: 'Michael Johnson', accountNumber: '1234567890' },
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
  const [verifiedAccount, setVerifiedAccount] = useState<TVAccount | null>(null);
  const [accountConfirmed, setAccountConfirmed] = useState(false);

  // Step 3: Payment details state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentSource, setPaymentSource] = useState<PaymentSource>('family');
  const [paymentError, setPaymentError] = useState('');

  // Step 4: Confirmation state
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
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

    const availableBalance = paymentSource === 'family' ? familyBalance : savings;
    if (Number(paymentAmount) > availableBalance) {
      setPaymentError(
        ERROR_MESSAGES.INSUFFICIENT_BALANCE.replace('{balance}', availableBalance.toFixed(2))
      );
      return;
    }

    setPaymentError('');
    setShowPaymentConfirmation(true);
  }, [paymentAmount, paymentSource, familyBalance, savings]);

  const handleConfirmPayment = useCallback(async () => {
    setIsProcessing(true);

    setTimeout(() => {
      const sourceLabel = paymentSource === 'family' ? 'Family Balance' : 'Savings';
      alert(
        `✓ Payment successful!\n\nR${Number(paymentAmount).toFixed(2)} has been paid for DSTV account ${verifiedAccount?.accountNumber}\nfrom your ${sourceLabel}.`
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
    <div className="flex gap-4 mb-6 border-b border-slate-200">
      <button
        onClick={() => setTvTab('pay')}
        className={`px-4 py-3 font-medium text-sm transition ${
          tvTab === 'pay'
            ? 'border-b-2 border-rose-500 text-rose-500'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Pay for DSTV
      </button>
      <button
        onClick={() => setTvTab('history')}
        className={`px-4 py-3 font-medium text-sm transition ${
          tvTab === 'history'
            ? 'border-b-2 border-rose-500 text-rose-500'
            : 'text-slate-600 hover:text-slate-900'
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
      className={`w-full p-4 rounded-lg border-2 transition text-left ${
        paymentSource === source
          ? 'border-rose-500 bg-rose-50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-slate-950">{label}</p>
          <p className="text-xs text-slate-600">Available: R{balance.toFixed(2)}</p>
        </div>
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            paymentSource === source ? 'border-rose-500 bg-rose-500' : 'border-slate-300'
          }`}
        >
          {paymentSource === source && <div className="w-2 h-2 bg-white rounded-full"></div>}
        </div>
      </div>
    </button>
  );

  // Render Payment History
  const renderPaymentHistory = () => (
    <div className="space-y-3">
      {mockTvHistory.length > 0 ? (
        mockTvHistory.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-slate-900">{item.accountHolder}</p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.status === 'Success'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {item.status}
              </span>
            </div>
            <p className="text-sm text-slate-600">Account: {item.accountNumber}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
              <p className="text-sm text-slate-500">{item.date}</p>
              <p className="font-semibold text-slate-900">R{item.amount.toFixed(2)}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-600">No payment history yet.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-950">DSTV Payment</h1>
          <button onClick={closeTvModal} className="text-slate-500 hover:text-slate-900" aria-label="Close">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6">
        {renderTabNavigation()}

        {tvTab === 'pay' && (
          <div className="space-y-6">
            {/* Step 1: Enter DSTV Account ID */}
            {!verifiedAccount && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950 mb-4">Step 1: Link Your DSTV Account</h2>
                <p className="text-sm text-slate-600 mb-6">Enter your ID number linked to your DSTV account or the decoder number</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">DSTV Account/Decoder Number</label>
                    <input
                      type="text"
                      value={dstvId}
                      onChange={(e) => {
                        setDstvId(e.target.value);
                        setVerificationError('');
                      }}
                      placeholder="e.g., 6789012345"
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                    {verificationError && <p className="text-xs text-red-600 mt-2">{verificationError}</p>}
                  </div>

                  <button
                    onClick={handleVerifyAccount}
                    disabled={isVerifying || !dstvId.trim()}
                    className="w-full py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition disabled:cursor-not-allowed disabled:bg-rose-300"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Account'}
                  </button>

                  <p className="text-xs text-slate-500 text-center mt-4">
                    Demo IDs: {DEMO_IDS}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Account Confirmation */}
            {verifiedAccount && !accountConfirmed && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950 mb-4">Step 2: Confirm Your Account</h2>
                <p className="text-sm text-slate-600 mb-6">Please confirm this is your DStv account:</p>

                <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Account Holder:</span>
                      <span className="font-medium text-slate-900">{verifiedAccount.accountHolder}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Account Number:</span>
                      <span className="font-medium text-slate-900">{verifiedAccount.accountNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition"
                  >
                    No, Try Again
                  </button>
                  <button
                    onClick={handleConfirmAccount}
                    className="flex-1 px-4 py-2 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition"
                  >
                    Yes, This is My Account
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Details */}
            {verifiedAccount && accountConfirmed && !showPaymentConfirmation && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950 mb-4">Step 3: Payment Details</h2>

                <div className="space-y-6">
                  {/* Amount Input */}
                  <div>
                    <label className="text-sm font-medium text-slate-700">Amount to Pay</label>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-semibold text-slate-900">R</span>
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
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                    {paymentError && <p className="text-xs text-red-600 mt-2">{paymentError}</p>}
                  </div>

                  {/* Payment Source */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-3 block">Pay From</label>
                    <div className="space-y-2">
                      {renderPaymentSourceButton('family', 'Family Balance', familyBalance)}
                      {renderPaymentSourceButton('savings', 'Savings', savings)}
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToPayment}
                    disabled={!paymentAmount || Number(paymentAmount) <= 0}
                    className="w-full py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition disabled:cursor-not-allowed disabled:bg-rose-300"
                  >
                    Review Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review and Confirm */}
            {showPaymentConfirmation && verifiedAccount && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950 mb-6">Step 4: Review and Pay</h2>

                <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-4 border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Account:</span>
                    <span className="font-medium text-slate-900">{verifiedAccount.accountHolder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Account Number:</span>
                    <span className="font-medium text-slate-900">{verifiedAccount.accountNumber}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-4 flex justify-between">
                    <span className="text-slate-600">Payment Amount:</span>
                    <span className="font-bold text-rose-500 text-lg">R{Number(paymentAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">From:</span>
                    <span className="font-medium text-slate-900">{paymentSource === 'family' ? 'Family Balance' : 'Savings'}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPaymentConfirmation(false)}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition disabled:cursor-not-allowed disabled:bg-rose-300"
                  >
                    {isProcessing ? 'Processing...' : 'Pay'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tvTab === 'history' && renderPaymentHistory()}
      </div>
    </div>
  );
};
