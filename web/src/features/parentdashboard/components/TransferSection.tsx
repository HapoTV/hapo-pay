import React from 'react';

interface TransferSectionProps {
  transferSource: 'family' | 'savings';
  setTransferSource: React.Dispatch<React.SetStateAction<'family' | 'savings'>>;
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
  const targetLabel = transferSource === 'family' ? 'Savings' : 'Family Balance';
  const isTransferValid = transferAmount !== '' && Number(transferAmount) > 0;

  return (
    <div className="pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-3 shadow-sm border border-slate-200 mb-5 dark:bg-[#1A1830] dark:border-[#2A2740] dark:shadow-none">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#713cff]">Transfer</p>
              <p className="mt-3 text-slate-600 max-w-2xl leading-relaxed dark:text-slate-300">Manage family payments, transfer funds, and view your balances in one place.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr] mb-6">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 dark:bg-[#1A1830] dark:border-[#2A2740] dark:shadow-none">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Choose source</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setTransferSource('family')}
                    className={`rounded-2xl border px-3 py-2 text-left text-sm font-medium transition ${transferSource === 'family'
                      ? 'border-[#b9a1ff] bg-[#f0ebff] text-slate-950 dark:border-[#7C5CFC] dark:bg-[#2A2740] dark:text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-[#2A2740] dark:bg-[#1A1830] dark:text-slate-200 dark:hover:border-[#3A3750]'}`}
                  >
                    <div className="font-semibold">Family Balance</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-300">Main account</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferSource('savings')}
                    className={`rounded-2xl border px-3 py-2 text-left text-sm font-medium transition ${transferSource === 'savings'
                      ? 'border-[#b9a1ff] bg-[#f0ebff] text-slate-950 dark:border-[#7C5CFC] dark:bg-[#2A2740] dark:text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-[#2A2740] dark:bg-[#1A1830] dark:text-slate-200 dark:hover:border-[#3A3750]'}`}
                  >
                    <div className="font-semibold">Savings</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-300">Saved money</div>
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 dark:border-[#2A2740] dark:bg-[#1A1830]">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Transfer to</p>
                <p className="mt-2 text-sm text-slate-900 font-semibold dark:text-white">{targetLabel}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[#713cff] focus:outline-none dark:border-[#2A2740] dark:bg-[#1A1830] dark:text-white dark:placeholder:text-slate-400"
                />
              </div>

              {transferMessage && (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 dark:border-[#2A2740] dark:bg-[#1A1830] dark:text-slate-200">
                  {transferMessage}
                </div>
              )}

              <button
                onClick={onTransfer}
                disabled={!isTransferValid}
                className="mt-3 w-full rounded-2xl bg-[#713cff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#824fff] disabled:cursor-not-allowed disabled:bg-[#c2b3ed]"
              >
                Transfer Funds
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm dark:border-[#2A2740] dark:bg-[#1A1830] dark:shadow-none">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Account balances</h3>
            <div className="mt-3 space-y-2.5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-2.5 dark:border-[#2A2740] dark:bg-[#0D0B1A]">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">Family Balance</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">R{familyBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-2.5 dark:border-[#2A2740] dark:bg-[#0D0B1A]">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">Savings</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">R{savings.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
