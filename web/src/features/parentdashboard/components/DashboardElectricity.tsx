import React from 'react';
import { CloseIcon } from '../../../components/icons';

type ElectricityMeter = {
  id: string;
  name: string;
  meterNumber: string;
};

interface DashboardElectricityProps {
  electricityTab: 'buy' | 'history';
  setElectricityTab: (value: 'buy' | 'history') => void;
  closeElectricityModal: () => void;
  showAddMeterForm: boolean;
  setShowAddMeterForm: (value: boolean) => void;
  newMeterName: string;
  setNewMeterName: (value: string) => void;
  newMeterNumber: string;
  setNewMeterNumber: (value: string) => void;
  electricityMeters: ElectricityMeter[];
  handleAddMeter: () => void;
  handleDeleteMeter: (id: string) => void;
  selectedMeterForBuy: string | null;
  setSelectedMeterForBuy: (value: string | null) => void;
  electricityAmount: string;
  setElectricityAmount: (value: string) => void;
  showElectricityConfirmation: boolean;
  handleBuyElectricity: (meterId: string) => void;
  handleConfirmElectricityPurchase: () => void;
  handleElectricityPurchaseConfirmed: () => void;
  mockElectricityHistory: Array<{
    id: string;
    meterName: string;
    meterNumber: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

export const DashboardElectricity: React.FC<DashboardElectricityProps> = ({
  electricityTab,
  setElectricityTab,
  closeElectricityModal,
  showAddMeterForm,
  setShowAddMeterForm,
  newMeterName,
  setNewMeterName,
  newMeterNumber,
  setNewMeterNumber,
  electricityMeters,
  handleAddMeter,
  handleDeleteMeter,
  selectedMeterForBuy,
  setSelectedMeterForBuy,
  electricityAmount,
  setElectricityAmount,
  showElectricityConfirmation,
  handleBuyElectricity,
  handleConfirmElectricityPurchase,
  handleElectricityPurchaseConfirmed,
  mockElectricityHistory,
}) => {
  const selectedMeter = electricityMeters.find(
    (m) => m.id === selectedMeterForBuy
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#0D0B1A] dark:text-white transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-[#1A1830] border-b border-gray-200 dark:border-[#2A2740] px-4 py-4 sm:px-6 transition-colors duration-200">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Buy Electricity
          </h1>

          <button
            onClick={closeElectricityModal}
            className="shrink-0 rounded-full p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200 dark:border-[#2A2740]">
          <button
            onClick={() => setElectricityTab('buy')}
            className={`shrink-0 px-4 py-3 font-medium text-sm transition-colors ${
              electricityTab === 'buy'
                ? 'border-b-2 border-[#7C5CFC] text-[#6D4AFF] dark:text-[#B39DFF]'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Buy
          </button>

          <button
            onClick={() => setElectricityTab('history')}
            className={`shrink-0 px-4 py-3 font-medium text-sm transition-colors ${
              electricityTab === 'history'
                ? 'border-b-2 border-[#7C5CFC] text-[#6D4AFF] dark:text-[#B39DFF]'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            History
          </button>
        </div>

        {/* Buy Tab */}
        {electricityTab === 'buy' && (
          <div className="space-y-6">
            {/* Add Meter Button */}
            <button
              onClick={() => setShowAddMeterForm(!showAddMeterForm)}
              className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#7C5CFC] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6A4CE0]"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>

              Add New Meter
            </button>

            {/* Add Meter Form */}
            {showAddMeterForm && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-[#2A2740] dark:bg-[#1A1830] sm:p-6 transition-colors duration-200">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Add New Meter
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Meter Name
                    </label>

                    <input
                      type="text"
                      value={newMeterName}
                      onChange={(e) => setNewMeterName(e.target.value)}
                      placeholder="e.g., Home, Office, Apartment"
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#7C5CFC] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white dark:placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Meter Number
                    </label>

                    <input
                      type="text"
                      value={newMeterNumber}
                      onChange={(e) => setNewMeterNumber(e.target.value)}
                      placeholder="e.g., 1234567890"
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#7C5CFC] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white dark:placeholder-gray-500"
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <button
                      onClick={() => {
                        setShowAddMeterForm(false);
                        setNewMeterName('');
                        setNewMeterNumber('');
                      }}
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-gray-300 dark:hover:bg-[#2A2740]"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleAddMeter}
                      disabled={!newMeterName || !newMeterNumber}
                      className="flex-1 rounded-lg bg-[#7C5CFC] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6A4CE0] disabled:cursor-not-allowed disabled:bg-[#7C5CFC]/30"
                    >
                      Add Meter
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Meters */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Your Meters
              </h2>

              {electricityMeters.length > 0 ? (
                <div className="space-y-3">
                  {electricityMeters.map((meter) => (
                    <div key={meter.id}>
                      {/* Meter Card */}
                      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-[#2A2740] dark:bg-[#1A1830] sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#7C5CFC]/15 p-3">
                            <svg
                              className="h-6 w-6 text-[#7C5CFC]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.657 14.243a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.757 15.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM4 10a1 1 0 01-1-1V8a1 1 0 012 0v1a1 1 0 01-1 1zM5.757 5.757a1 1 0 000-1.414L5.05 3.636a1 1 0 10-1.414 1.414l.707.707zM10 5a1 1 0 011-1h4a2 2 0 012 2v4a1 1 0 11-2 0V6h-3a1 1 0 01-1-1z" />
                            </svg>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                              {meter.name}
                            </h3>

                            <p className="mt-1 truncate text-xs text-gray-600 dark:text-gray-400">
                              Meter: {meter.meterNumber}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-normal">
                          <button
                            onClick={() => handleBuyElectricity(meter.id)}
                            className="rounded-full bg-[#7C5CFC] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#6A4CE0]"
                            aria-label="Buy electricity"
                          >
                            Buy
                          </button>

                          <button
                            onClick={() => handleDeleteMeter(meter.id)}
                            className="rounded-full p-2 text-gray-500 transition hover:bg-red-50 hover:text-[#F87171] dark:text-gray-500 dark:hover:bg-red-500/10"
                            aria-label="Delete meter"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Electricity Purchase Form */}
                      {selectedMeterForBuy === meter.id && (
                        <div className="mt-3 rounded-lg border border-[#7C5CFC]/30 bg-[#7C5CFC]/5 p-4 shadow-md transition-colors duration-200">
                          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                            Enter Amount to Buy
                          </h3>

                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Meter: {meter.name} ({meter.meterNumber})
                              </label>

                              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                Please enter the amount of electricity credit
                                you want to purchase
                              </p>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Amount (R)
                              </label>

                              <input
                                type="number"
                                min="1"
                                value={electricityAmount}
                                onChange={(e) =>
                                  setElectricityAmount(e.target.value)
                                }
                                placeholder="e.g., 100"
                                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#7C5CFC] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white dark:placeholder-gray-500"
                              />
                            </div>

                            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                              <button
                                onClick={() =>
                                  setSelectedMeterForBuy(null)
                                }
                                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-gray-300 dark:hover:bg-[#2A2740]"
                              >
                                Cancel
                              </button>

                              <button
                                onClick={handleConfirmElectricityPurchase}
                                disabled={
                                  !electricityAmount ||
                                  Number(electricityAmount) <= 0
                                }
                                className="flex-1 rounded-lg bg-[#7C5CFC] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6A4CE0] disabled:cursor-not-allowed disabled:bg-[#7C5CFC]/30"
                              >
                                Review
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center shadow-sm dark:border-[#2A2740] dark:bg-[#1A1830] transition-colors duration-200">
                  <svg
                    className="mx-auto mb-3 h-12 w-12 text-gray-400 dark:text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.657 14.243a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.757 15.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM4 10a1 1 0 01-1-1V8a1 1 0 012 0v1a1 1 0 01-1 1zM5.757 5.757a1 1 0 000-1.414L5.05 3.636a1 1 0 10-1.414 1.414l.707.707zM10 5a1 1 0 011 1v4a1 1 0 11-2 0V6H7a1 1 0 01-1-1h4z" />
                  </svg>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No meters added yet. Click "Add New Meter" to get started!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {electricityTab === 'history' && (
          <div className="max-h-[600px] overflow-y-auto px-0 py-2 sm:px-2">
            {mockElectricityHistory.length > 0 ? (
              <div className="space-y-3">
                {mockElectricityHistory.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:bg-gray-50 dark:border-[#2A2740] dark:bg-[#1A1830] dark:hover:bg-[#211E38] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7C5CFC]/15 p-2">
                          <svg
                            className="h-5 w-5 text-[#7C5CFC]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.657 14.243a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.757 15.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM4 10a1 1 0 01-1-1V8a1 1 0 012 0v1a1 1 0 01-1 1zM5.757 5.757a1 1 0 000-1.414L5.05 3.636a1 1 0 10-1.414 1.414l.707.707zM10 5a1 1 0 011-1h4a2 2 0 012 2v4a1 1 0 11-2 0V6h-3a1 1 0 01-1-1z" />
                          </svg>
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.meterName}
                          </p>

                          <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                            Meter: {transaction.meterNumber}
                          </p>
                        </div>
                      </div>

                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {transaction.date}
                      </p>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        R{transaction.amount.toFixed(2)}
                      </p>

                      <p className="text-xs font-medium text-[#16A34A] dark:text-[#4ADE80]">
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No transaction history yet
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Electricity Confirmation Modal */}
      {showElectricityConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-[#2A2740] dark:bg-[#1A1830] transition-colors duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#7C5CFC] px-4 py-4 text-white sm:px-6">
              <h2 className="text-base font-bold sm:text-lg">
                Confirm Electricity Purchase
              </h2>

              <button
                onClick={() => setSelectedMeterForBuy(null)}
                className="rounded-full p-1 text-white transition hover:bg-[#6A4CE0]"
                aria-label="Close confirmation"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4 p-4 sm:p-6">
              {/* Disclaimer Banner */}
              <div className="rounded border-l-4 border-[#F97316] bg-orange-50 p-4 dark:bg-[#3B1A16]">
                <p className="mb-1 text-xs font-semibold text-[#C2410C] dark:text-[#F97316]">
                  ⚠️ IMPORTANT DISCLAIMER
                </p>

                <p className="text-xs text-orange-700 dark:text-[#F97316]/80">
                  Please verify the meter number carefully before confirming.
                  Once confirmed, this transaction cannot be reversed. Ensure
                  you are purchasing for the correct meter.
                </p>
              </div>

              {/* Purchase Details */}
              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-[#2A2740] dark:bg-[#0D0B1A]">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    METER NAME
                  </p>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedMeter?.name}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-3 dark:border-[#2A2740]">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    METER NUMBER
                  </p>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedMeter?.meterNumber}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-3 dark:border-[#2A2740]">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    AMOUNT TO PURCHASE
                  </p>

                  <p className="text-sm font-semibold text-[#6D4AFF] dark:text-[#B39DFF]">
                    R{Number(electricityAmount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Verification Checkboxes */}
              <div className="space-y-2 rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-[#3ED9C2]/30 dark:bg-[#151F35]">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="verify-meter"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#7C5CFC] focus:ring-[#7C5CFC]"
                  />

                  <label
                    htmlFor="verify-meter"
                    className="text-xs text-gray-700 dark:text-gray-300"
                  >
                    I have verified the meter number is correct
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="verify-amount"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#7C5CFC] focus:ring-[#7C5CFC]"
                  />

                  <label
                    htmlFor="verify-amount"
                    className="text-xs text-gray-700 dark:text-gray-300"
                  >
                    I have confirmed the amount is what I want to purchase
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="understand-irreversible"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#7C5CFC] focus:ring-[#7C5CFC]"
                  />

                  <label
                    htmlFor="understand-irreversible"
                    className="text-xs text-gray-700 dark:text-gray-300"
                  >
                    I understand this transaction cannot be reversed
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <button
                  onClick={() => {
                    setSelectedMeterForBuy(null);
                    setElectricityAmount('');
                  }}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-gray-300 dark:hover:bg-[#2A2740]"
                >
                  Cancel
                </button>

                <button
                  onClick={handleElectricityPurchaseConfirmed}
                  className="flex-1 rounded-lg bg-[#7C5CFC] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6A4CE0]"
                >
                  Confirm & Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};