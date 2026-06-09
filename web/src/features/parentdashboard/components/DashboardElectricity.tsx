import React from 'react';
import { CloseIcon } from '../../../components/icons';

type ElectricityMeter = { id: string; name: string; meterNumber: string };

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
  mockElectricityHistory: Array<{ id: string; meterName: string; meterNumber: string; amount: number; date: string; status: string }>;
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
  const selectedMeter = electricityMeters.find((m) => m.id === selectedMeterForBuy);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-950">Buy Electricity</h1>
          <button onClick={closeElectricityModal} className="text-slate-500 hover:text-slate-900" aria-label="Close">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6">
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button onClick={() => setElectricityTab('buy')} className={`px-4 py-3 font-medium text-sm transition ${electricityTab === 'buy' ? 'border-b-2 border-rose-500 text-rose-500' : 'text-slate-600 hover:text-slate-900'}`}>Buy</button>
          <button onClick={() => setElectricityTab('history')} className={`px-4 py-3 font-medium text-sm transition ${electricityTab === 'history' ? 'border-b-2 border-rose-500 text-rose-500' : 'text-slate-600 hover:text-slate-900'}`}>History</button>
        </div>

        {electricityTab === 'buy' && (
          <div className="space-y-6">
            <button onClick={() => setShowAddMeterForm(!showAddMeterForm)} className="w-full mb-6 rounded-lg bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add New Meter
            </button>

            {showAddMeterForm && (
              <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 mb-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950 mb-4">Add New Meter</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Meter Name</label>
                    <input type="text" value={newMeterName} onChange={(e) => setNewMeterName(e.target.value)} placeholder="e.g., Home, Office, Apartment" className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Meter Number</label>
                    <input type="text" value={newMeterNumber} onChange={(e) => setNewMeterNumber(e.target.value)} placeholder="e.g., 1234567890" className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { setShowAddMeterForm(false); setNewMeterName(''); setNewMeterNumber(''); }} className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Cancel</button>
                    <button onClick={handleAddMeter} disabled={!newMeterName || !newMeterNumber} className="flex-1 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300">Add Meter</button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-slate-950 mb-4">Your Meters</h2>
              {electricityMeters.length > 0 ? (
                <div className="space-y-3">
                  {electricityMeters.map((meter) => (
                    <div key={meter.id}>
                      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="rounded-full bg-rose-100 p-3 flex items-center justify-center w-12 h-12 flex-shrink-0">
                            <svg className="w-6 h-6 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.657 14.243a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.757 15.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM4 10a1 1 0 01-1-1V8a1 1 0 012 0v1a1 1 0 01-1 1zM5.757 5.757a1 1 0 000-1.414L5.05 3.636a1 1 0 10-1.414 1.414l.707.707zM10 5a1 1 0 011-1h4a2 2 0 012 2v4a1 1 0 11-2 0V6h-3a1 1 0 01-1-1z" /></svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-950 text-sm">{meter.name}</h3>
                            <p className="text-xs text-slate-600 mt-1">Meter: {meter.meterNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleBuyElectricity(meter.id)} className="ml-4 px-3 py-1 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-full transition" aria-label="Buy electricity">
                            Buy
                          </button>
                          <button onClick={() => handleDeleteMeter(meter.id)} className="ml-2 p-2 text-slate-400 hover:text-red-500 transition" aria-label="Delete meter">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                          </button>
                        </div>
                      </div>

                      {/* Electricity Purchase Form */}
                      {selectedMeterForBuy === meter.id && (
                        <div className="mt-3 bg-rose-50 rounded-lg border border-rose-200 p-4 shadow-md">
                          <h3 className="font-semibold text-slate-950 text-sm mb-3">Enter Amount to Buy</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-medium text-slate-700">Meter: {meter.name} ({meter.meterNumber})</label>
                              <p className="text-xs text-slate-600 mt-1">Please enter the amount of electricity credit you want to purchase</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Amount (R)</label>
                              <input
                                type="number"
                                min="1"
                                value={electricityAmount}
                                onChange={(e) => setElectricityAmount(e.target.value)}
                                placeholder="e.g., 100"
                                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => setSelectedMeterForBuy(null)}
                                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleConfirmElectricityPurchase}
                                disabled={!electricityAmount || Number(electricityAmount) <= 0}
                                className="flex-1 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
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
                <div className="bg-white rounded-lg border border-slate-200 p-8 text-center shadow-sm">
                  <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.657 14.243a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.757 15.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM4 10a1 1 0 01-1-1V8a1 1 0 012 0v1a1 1 0 01-1 1zM5.757 5.757a1 1 0 000-1.414L5.05 3.636a1 1 0 10-1.414 1.414l.707.707zM10 5a1 1 0 011-1h4a2 2 0 012 2v4a1 1 0 11-2 0V6h-3a1 1 0 01-1-1z" /></svg>
                  <p className="text-sm text-slate-600">No meters added yet. Click "Add New Meter" to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {electricityTab === 'history' && (
          <div className="px-6 py-6 max-h-[600px] overflow-y-auto">
            {mockElectricityHistory.length > 0 ? (
              <div className="space-y-3">
                {mockElectricityHistory.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition bg-white">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-rose-100 p-2 flex items-center justify-center w-10 h-10">
                          <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.657 14.243a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.757 15.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM4 10a1 1 0 01-1-1V8a1 1 0 012 0v1a1 1 0 01-1 1zM5.757 5.757a1 1 0 000-1.414L5.05 3.636a1 1 0 10-1.414 1.414l.707.707zM10 5a1 1 0 011-1h4a2 2 0 012 2v4a1 1 0 11-2 0V6h-3a1 1 0 01-1-1z" /></svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-950">{transaction.meterName}</p>
                          <p className="text-xs text-slate-600">Meter: {transaction.meterNumber}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 mt-2">{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-950">R{transaction.amount.toFixed(2)}</p>
                      <p className="text-xs text-green-600 font-medium">{transaction.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-600">No transaction history yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Electricity Confirmation Modal */}
      {showElectricityConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-rose-500 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Confirm Electricity Purchase</h2>
              <button onClick={() => setSelectedMeterForBuy(null)} className="text-white hover:bg-rose-600 rounded-full p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Disclaimer Banner */}
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <p className="text-xs font-semibold text-amber-900 mb-1">⚠️ IMPORTANT DISCLAIMER</p>
                <p className="text-xs text-amber-800">Please verify the meter number carefully before confirming. Once confirmed, this transaction cannot be reversed. Ensure you are purchasing for the correct meter.</p>
              </div>

              {/* Purchase Details */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                <div>
                  <p className="text-xs font-medium text-slate-600">METER NAME</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedMeter?.name}</p>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <p className="text-xs font-medium text-slate-600">METER NUMBER</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedMeter?.meterNumber}</p>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <p className="text-xs font-medium text-slate-600">AMOUNT TO PURCHASE</p>
                  <p className="text-sm font-semibold text-rose-600">R{Number(electricityAmount).toFixed(2)}</p>
                </div>
              </div>

              {/* Verification Checkboxes */}
              <div className="space-y-2 bg-blue-50 p-4 rounded-xl">
                <div className="flex items-start gap-2">
                  <input type="checkbox" id="verify-meter" className="mt-1 h-4 w-4 rounded text-blue-600" />
                  <label htmlFor="verify-meter" className="text-xs text-slate-700">
                    I have verified the meter number is correct
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <input type="checkbox" id="verify-amount" className="mt-1 h-4 w-4 rounded text-blue-600" />
                  <label htmlFor="verify-amount" className="text-xs text-slate-700">
                    I have confirmed the amount is what I want to purchase
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <input type="checkbox" id="understand-irreversible" className="mt-1 h-4 w-4 rounded text-blue-600" />
                  <label htmlFor="understand-irreversible" className="text-xs text-slate-700">
                    I understand this transaction cannot be reversed
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setSelectedMeterForBuy(null);
                    setElectricityAmount('');
                  }}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleElectricityPurchaseConfirmed}
                  className="flex-1 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
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
