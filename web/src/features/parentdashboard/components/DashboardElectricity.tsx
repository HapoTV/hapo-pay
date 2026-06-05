import React from 'react';

type ElectricityMeter = { id: string; name: string; meterNumber: string };

interface DashboardElectricityProps {
  showAddMeterForm: boolean;
  setShowAddMeterForm: (value: boolean) => void;
  newMeterName: string;
  setNewMeterName: (value: string) => void;
  newMeterNumber: string;
  setNewMeterNumber: (value: string) => void;
  electricityMeters: ElectricityMeter[];
  setShowElectricityPage: (value: boolean) => void;
  handleAddMeter: () => void;
  handleDeleteMeter: (id: string) => void;
}

export const DashboardElectricity: React.FC<DashboardElectricityProps> = ({
  showAddMeterForm,
  setShowAddMeterForm,
  newMeterName,
  setNewMeterName,
  newMeterNumber,
  setNewMeterNumber,
  electricityMeters,
  setShowElectricityPage,
  handleAddMeter,
  handleDeleteMeter,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-950">Buy Electricity</h1>
          <button onClick={() => setShowElectricityPage(false)} className="text-slate-500 hover:text-slate-900" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6">
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
                <div key={meter.id} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="rounded-full bg-rose-100 p-3 flex items-center justify-center w-12 h-12 flex-shrink-0">
                      <svg className="w-6 h-6 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.657 14.243a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.757 15.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM4 10a1 1 0 01-1-1V8a1 1 0 012 0v1a1 1 0 01-1 1zM5.757 5.757a1 1 0 000-1.414L5.05 3.636a1 1 0 10-1.414 1.414l.707.707zM10 5a1 1 0 011-1h4a2 2 0 012 2v4a1 1 0 11-2 0V6h-3a1 1 0 01-1-1z" /></svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-950 text-sm">{meter.name}</h3>
                      <p className="text-xs text-slate-600 mt-1">Meter: {meter.meterNumber}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteMeter(meter.id)} className="ml-4 p-2 text-slate-400 hover:text-red-500 transition" aria-label="Delete meter">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  </button>
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
    </div>
  );
};
