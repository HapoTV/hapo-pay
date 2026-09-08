import React from 'react';

interface TransferSectionProps {
  transferSource: 'family' | 'savings';
  setTransferSource: React.Dispatch<
    React.SetStateAction<'family' | 'savings'>
  >;
  transferAmount: string;
  setTransferAmount: React.Dispatch<React.SetStateAction<string>>;
  transferMessage: string;
  onTransfer: () => void;
  familyBalance: number;
  savings: number;
}

export const TransferSection: React.FC<TransferSectionProps> = ({
  transferSource,
  setTransferSource,
  transferAmount,
  setTransferAmount,
  transferMessage,
  onTransfer,
  familyBalance,
  savings,
}) => {
  const targetLabel =
    transferSource === 'family' ? 'Savings' : 'Family Balance';

  const isTransferValid =
    transferAmount !== '' && Number(transferAmount) > 0;

  return (
    <div className="pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4">

        {/* Transfer Header */}
        <div className="bg-white dark:bg-[#1A1830] rounded-3xl p-3 shadow-sm border border-gray-200 dark:border-[#2A2740] mb-5 transition-colors duration-200">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6D4AFF] dark:text-[#B39DFF]">
                Transfer
              </p>

              <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                Manage family payments, transfer funds, and view your
                balances in one place.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr] mb-6">

          {/* Transfer Form */}
          <div className="bg-white dark:bg-[#1A1830] rounded-3xl p-4 shadow-sm border border-gray-200 dark:border-[#2A2740] transition-colors duration-200">
            <div className="space-y-4">

              {/* Choose Source */}
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-300">
                  Choose source
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">

                  {/* Family Balance */}
                  <button
                    type="button"
                    onClick={() => setTransferSource('family')}
                    className={`rounded-2xl border px-3 py-2 text-left text-sm font-medium transition ${
                      transferSource === 'family'
                        ? 'border-[#7C5CFC]/60 bg-[#7C5CFC]/10 text-[#6D4AFF] dark:text-white'
                        : 'border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-semibold">
                      Family Balance
                    </div>

                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Main account
                    </div>
                  </button>

                  {/* Savings */}
                  <button
                    type="button"
                    onClick={() => setTransferSource('savings')}
                    className={`rounded-2xl border px-3 py-2 text-left text-sm font-medium transition ${
                      transferSource === 'savings'
                        ? 'border-[#7C5CFC]/60 bg-[#7C5CFC]/10 text-[#6D4AFF] dark:text-white'
                        : 'border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-semibold">
                      Savings
                    </div>

                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Saved money
                    </div>
                  </button>

                </div>
              </div>

              {/* Transfer Target */}
              <div className="rounded-3xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-3 transition-colors duration-200">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Transfer to
                </p>

                <p className="mt-2 text-sm text-gray-900 dark:text-white font-semibold">
                  {targetLabel}
                </p>
              </div>

              {/* Amount */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-2 w-full rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[#7C5CFC] focus:outline-none transition-colors duration-200"
                />
              </div>

              {/* Transfer Message */}
              {transferMessage && (
                <div className="mt-3 rounded-2xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
                  {transferMessage}
                </div>
              )}

              {/* Transfer Button */}
              <button
                onClick={onTransfer}
                disabled={!isTransferValid}
                className="mt-3 w-full rounded-2xl bg-[#7C5CFC] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6A4CE0] disabled:cursor-not-allowed disabled:bg-[#7C5CFC]/30"
              >
                Transfer Funds
              </button>

            </div>
          </div>

          {/* Account Balances */}
          <div className="rounded-3xl border border-gray-200 dark:border-[#2A2740] bg-white dark:bg-[#1A1830] p-3 shadow-sm transition-colors duration-200">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Account balances
            </h3>

            <div className="mt-3 space-y-2.5">

              {/* Family Balance */}
              <div className="rounded-3xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-2.5 transition-colors duration-200">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                  Family Balance
                </p>

                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  R
                  {familyBalance.toLocaleString('en-ZA', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              {/* Savings */}
              <div className="rounded-3xl border border-gray-200 dark:border-[#2A2740] bg-gray-50 dark:bg-[#0D0B1A] p-2.5 transition-colors duration-200">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                  Savings
                </p>

                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  R
                  {savings.toLocaleString('en-ZA', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
