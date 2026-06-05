import React from 'react';
import type { ParentUser } from '../types';

type Contact = { id: string; number: string; name: string; network: string };

type DataBundlesByNetwork = Record<string, { id: string; label: string }[]>;

interface DashboardAirtimeProps {
  parentData: ParentUser;
  airtimeTab: 'buy' | 'history';
  setAirtimeTab: (value: 'buy' | 'history') => void;
  closeAirtimeModal: () => void;
  showAddContactForm: boolean;
  setShowAddContactForm: (value: boolean) => void;
  handleAddContactClick: () => void;
  contacts: Contact[];
  newContactName: string;
  newContactNumber: string;
  newContactNetwork: string;
  setNewContactName: (value: string) => void;
  setNewContactNumber: (value: string) => void;
  setNewContactNetwork: (value: string) => void;
  handleSaveContact: () => void;
  selectedContactForBuy: string | null;
  handleBuyAirtime: (contactId: string) => void;
  setSelectedContactForBuy: (value: string | null) => void;
  buyAccount: string;
  setBuyAccount: (value: string) => void;
  buyProductType: string;
  setBuyProductType: (value: string) => void;
  airtimeAmount: string;
  setAirtimeAmount: (value: string) => void;
  selectedDataBundle: string;
  setSelectedDataBundle: (value: string) => void;
  handleConfirmBuyAirtime: () => void;
  mockAirtimeHistory: Array<{ id: string; number: string; type: string; amount: number; date: string; status: string }>;
  dataBundlesByNetwork: DataBundlesByNetwork;
}

export const DashboardAirtime: React.FC<DashboardAirtimeProps> = ({
  parentData,
  airtimeTab,
  setAirtimeTab,
  closeAirtimeModal,
  showAddContactForm,
  setShowAddContactForm,
  handleAddContactClick,
  contacts,
  newContactName,
  newContactNumber,
  newContactNetwork,
  setNewContactName,
  setNewContactNumber,
  setNewContactNetwork,
  handleSaveContact,
  selectedContactForBuy,
  setSelectedContactForBuy,
  handleBuyAirtime,
  buyAccount,
  setBuyAccount,
  buyProductType,
  setBuyProductType,
  airtimeAmount,
  setAirtimeAmount,
  selectedDataBundle,
  setSelectedDataBundle,
  handleConfirmBuyAirtime,
  mockAirtimeHistory,
  dataBundlesByNetwork,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-slate-900 font-bold">Logo</div>
          </div>
          <div className="text-center"><h1 className="text-lg font-bold">Buy Airtime & Data</h1></div>
          <button onClick={closeAirtimeModal} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-bold transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Close
          </button>
        </div>
      </nav>

      <div className="flex flex-col">
        <main className="flex-1 px-4 py-6 sm:px-6 max-w-4xl mx-auto w-full">
          <div className="flex gap-4 mb-6 border-b border-slate-200">
            <button onClick={() => setAirtimeTab('buy')} className={`px-4 py-3 font-medium text-sm transition ${airtimeTab === 'buy' ? 'border-b-2 border-rose-500 text-rose-500' : 'text-slate-600 hover:text-slate-900'}`}>Buy</button>
            <button onClick={() => setAirtimeTab('history')} className={`px-4 py-3 font-medium text-sm transition ${airtimeTab === 'history' ? 'border-b-2 border-rose-500 text-rose-500' : 'text-slate-600 hover:text-slate-900'}`}>History</button>
          </div>

          {airtimeTab === 'buy' && (
            <div className="px-6 py-6 space-y-5 max-h-[400px] overflow-y-auto">
              <button onClick={handleAddContactClick} className="w-full rounded-2xl bg-rose-50 border-2 border-dashed border-rose-300 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 hover:border-rose-400">+ Add Contact</button>

              {showAddContactForm && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700">Contact Name</label>
                    <input type="text" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} placeholder="e.g., Sister" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Cellphone Number</label>
                    <input type="tel" value={newContactNumber} onChange={(e) => setNewContactNumber(e.target.value)} placeholder="e.g., +27 81 234 5678" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Network</label>
                    <select value={newContactNetwork} onChange={(e) => setNewContactNetwork(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none">
                      <option value="">Select network</option>
                      <option value="Vodacom">Vodacom</option>
                      <option value="MTN">MTN</option>
                      <option value="Cell C">Cell C</option>
                      <option value="Telkom Mobile">Telkom Mobile</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { setShowAddContactForm(false); setNewContactNumber(''); setNewContactName(''); setNewContactNetwork(''); }} className="flex-1 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100">Cancel</button>
                    <button onClick={handleSaveContact} disabled={!newContactName || !newContactNumber || !newContactNetwork} className="flex-1 rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300">Save Contact</button>
                  </div>
                </div>
              )}

              {contacts.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-slate-950 mb-3">Your Contacts ({contacts.length})</p>
                  <div className="space-y-2">
                    {contacts.map((contact) => (
                      <div key={contact.id}>
                        <div className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${selectedContactForBuy === contact.id ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-rose-300 hover:bg-rose-50'}`}>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-950">{contact.name}</p>
                            <div className="flex gap-2 mt-1">
                              <p className="text-xs text-slate-600">{contact.number}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{contact.network}</span>
                            </div>
                          </div>
                          <button onClick={() => handleBuyAirtime(contact.id)} className="ml-3 text-2xl text-rose-500 hover:text-rose-600 font-light">&gt;</button>
                        </div>

                        {selectedContactForBuy === contact.id && (
                          <div className="mt-2 p-4 rounded-xl border border-rose-200 bg-rose-50 space-y-3">
                            <div>
                              <label className="text-xs font-medium text-slate-700">Select Account</label>
                              <select value={buyAccount} onChange={(e) => setBuyAccount(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none">
                                <option value="">Choose account</option>
                                <option value="Family Balance">Family Balance (R{parentData.familyBalance.toFixed(2)})</option>
                                <option value="Savings">Savings (R{parentData.savings.toFixed(2)})</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-xs font-medium text-slate-700">Product Type</label>
                              <select value={buyProductType} onChange={(e) => { setBuyProductType(e.target.value); setAirtimeAmount(''); setSelectedDataBundle(''); }} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none">
                                <option value="">Choose product</option>
                                <option value="Airtime">Airtime</option>
                                <option value="Data">Data</option>
                              </select>
                            </div>

                            {buyProductType === 'Airtime' && (
                              <div>
                                <label className="text-xs font-medium text-slate-700">Airtime Amount</label>
                                <input type="number" min="1" value={airtimeAmount} onChange={(e) => setAirtimeAmount(e.target.value)} placeholder="Enter airtime amount" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none" />
                              </div>
                            )}

                            {buyProductType === 'Data' && selectedContactForBuy && (
                              <div>
                                <label className="text-xs font-medium text-slate-700">Data Bundle</label>
                                <select value={selectedDataBundle} onChange={(e) => setSelectedDataBundle(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none">
                                  <option value="">Choose data bundle</option>
                                  {dataBundlesByNetwork[contact.network]?.map((bundle) => (
                                    <option key={bundle.id} value={bundle.id}>{bundle.label}</option>
                                  ))}
                                </select>
                                {!dataBundlesByNetwork[contact.network] && (
                                  <p className="mt-2 text-xs text-slate-500">No bundle options available for {contact.network}.</p>
                                )}
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <button onClick={() => { setSelectedContactForBuy(null); setBuyAccount(''); setBuyProductType(''); }} className="flex-1 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100">Cancel</button>
                              <button onClick={handleConfirmBuyAirtime} disabled={!buyAccount || !buyProductType || (buyProductType === 'Airtime' && (!airtimeAmount || Number(airtimeAmount) <= 0)) || (buyProductType === 'Data' && !selectedDataBundle)} className="flex-1 rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300">Confirm</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6"><p className="text-sm text-slate-600">No contacts yet. Add your first contact to get started!</p></div>
              )}
            </div>
          )}

          {airtimeTab === 'history' && (
            <div className="px-6 py-6 max-h-[400px] overflow-y-auto">
              {mockAirtimeHistory.length > 0 ? (
                <div className="space-y-3">
                  {mockAirtimeHistory.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><p className="text-sm font-medium text-slate-950">{transaction.number}</p><span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{transaction.type}</span></div>
                        <p className="text-xs text-slate-600 mt-1">{transaction.date}</p>
                      </div>
                      <div className="text-right"><p className="text-sm font-semibold text-slate-950">R{transaction.amount.toFixed(2)}</p><p className="text-xs text-green-600">{transaction.status}</p></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8"><p className="text-sm text-slate-600">No transaction history yet</p></div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
