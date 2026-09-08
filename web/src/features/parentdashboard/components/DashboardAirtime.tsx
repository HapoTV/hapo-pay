import React from 'react';
import { Logo } from '../../../components/Logo';
import { CloseIcon } from '../../../components/icons';
import type { ParentUser } from '../types';

type Contact = {
  id: string;
  number: string;
  name: string;
  network: string;
};

type DataBundlesByNetwork = Record<
  string,
  { id: string; label: string }[]
>;

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
  showAirtimeConfirmation: boolean;
  handleAirtimePurchaseConfirmed: () => void;
  mockAirtimeHistory: Array<{
    id: string;
    number: string;
    type: string;
    amount: number;
    date: string;
    status: string;
  }>;
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
  showAirtimeConfirmation,
  handleAirtimePurchaseConfirmed,
  mockAirtimeHistory,
  dataBundlesByNetwork,
}) => {
  const contact = contacts.find(
    (c) => c.id === selectedContactForBuy
  );

  const bundleLabel =
    dataBundlesByNetwork[contact?.network || '']?.find(
      (b) => b.id === selectedDataBundle
    )?.label;

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#0D0B1A] dark:text-white transition-colors duration-200">
      {/* Header */}
      <nav
        className="sticky top-0 z-50 px-4 py-4 text-white shadow-lg border-b border-gray-200/20 dark:border-[#2A2740] sm:px-6"
        style={{
          background:
            'linear-gradient(135deg, #7C5CFC 0%, #3ED9C2 100%)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center">
            <Logo
              className="h-10 w-10 rounded-full bg-white/20 p-2 object-contain"
              alt="HapoPay logo"
            />
          </div>

          <div className="min-w-0 text-center">
            <h1 className="text-base font-bold sm:text-lg">
              Buy Airtime & Data
            </h1>
          </div>

          <button
            onClick={closeAirtimeModal}
            className="flex shrink-0 items-center gap-2 rounded-full bg-white/20 px-3 py-2 text-xs font-bold transition hover:bg-white/30 sm:px-4 sm:text-sm"
          >
            <CloseIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </nav>

      <div className="flex flex-col">
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
          {/* Tabs */}
          <div className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200 dark:border-[#2A2740]">
            <button
              onClick={() => setAirtimeTab('buy')}
              className={`shrink-0 px-4 py-3 text-sm font-medium transition ${
                airtimeTab === 'buy'
                  ? 'border-b-2 border-[#7C5CFC] text-[#6D4AFF] dark:text-[#B39DFF]'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Buy
            </button>

            <button
              onClick={() => setAirtimeTab('history')}
              className={`shrink-0 px-4 py-3 text-sm font-medium transition ${
                airtimeTab === 'history'
                  ? 'border-b-2 border-[#7C5CFC] text-[#6D4AFF] dark:text-[#B39DFF]'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              History
            </button>
          </div>

          {/* Buy Tab */}
          {airtimeTab === 'buy' && (
            <div className="max-h-[60vh] space-y-5 overflow-y-auto px-1 py-2 sm:px-2">
              {/* Add Contact */}
              <button
                onClick={handleAddContactClick}
                className="w-full rounded-2xl border-2 border-dashed border-[#7C5CFC]/40 bg-[#7C5CFC]/10 px-4 py-3 text-sm font-semibold text-[#6D4AFF] transition hover:border-[#7C5CFC]/60 hover:bg-[#7C5CFC]/20 dark:text-[#B39DFF]"
              >
                + Add Contact
              </button>

              {/* Add Contact Form */}
              {showAddContactForm && (
                <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2A2740] dark:bg-[#1A1830] transition-colors duration-200">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Contact Name
                    </label>

                    <input
                      type="text"
                      value={newContactName}
                      onChange={(e) =>
                        setNewContactName(e.target.value)
                      }
                      placeholder="e.g., Sister"
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#7C5CFC] focus:outline-none dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white dark:placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Cellphone Number
                    </label>

                    <input
                      type="tel"
                      value={newContactNumber}
                      onChange={(e) =>
                        setNewContactNumber(e.target.value)
                      }
                      placeholder="e.g., +27 81 234 5678"
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#7C5CFC] focus:outline-none dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white dark:placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Network
                    </label>

                    <select
                      value={newContactNetwork}
                      onChange={(e) =>
                        setNewContactNetwork(e.target.value)
                      }
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-[#7C5CFC] focus:outline-none dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white"
                    >
                      <option value="">Select network</option>
                      <option value="Vodacom">Vodacom</option>
                      <option value="MTN">MTN</option>
                      <option value="Cell C">Cell C</option>
                      <option value="Telkom Mobile">
                        Telkom Mobile
                      </option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                    <button
                      onClick={() => {
                        setShowAddContactForm(false);
                        setNewContactNumber('');
                        setNewContactName('');
                        setNewContactNetwork('');
                      }}
                      className="flex-1 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-gray-300 dark:hover:bg-[#2A2740]"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSaveContact}
                      disabled={
                        !newContactName ||
                        !newContactNumber ||
                        !newContactNetwork
                      }
                      className="flex-1 rounded-full bg-[#7C5CFC] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#6A4CE0] disabled:cursor-not-allowed disabled:bg-[#7C5CFC]/30"
                    >
                      Save Contact
                    </button>
                  </div>
                </div>
              )}

              {/* Contacts */}
              {contacts.length > 0 ? (
                <div>
                  <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                    Your Contacts ({contacts.length})
                  </p>

                  <div className="space-y-2">
                    {contacts.map((contact) => (
                      <div key={contact.id}>
                        {/* Contact Card */}
                        <div
                          className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition ${
                            selectedContactForBuy === contact.id
                              ? 'border-[#7C5CFC] bg-[#7C5CFC]/10'
                              : 'border-gray-200 bg-white hover:border-[#7C5CFC]/50 hover:bg-[#7C5CFC]/5 dark:border-[#2A2740] dark:bg-[#1A1830]'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                              {contact.name}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {contact.number}
                              </p>

                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-[#0D0B1A] dark:text-gray-300">
                                {contact.network}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              handleBuyAirtime(contact.id)
                            }
                            className="ml-2 shrink-0 text-2xl font-light text-[#6D4AFF] transition hover:text-[#7C5CFC] dark:text-[#B39DFF] dark:hover:text-white"
                          >
                            &gt;
                          </button>
                        </div>

                        {/* Purchase Options */}
                        {selectedContactForBuy === contact.id && (
                          <div className="mt-2 space-y-3 rounded-xl border border-[#7C5CFC]/30 bg-[#7C5CFC]/5 p-4">
                            <div>
                              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Select Account
                              </label>

                              <select
                                value={buyAccount}
                                onChange={(e) =>
                                  setBuyAccount(e.target.value)
                                }
                                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-[#7C5CFC] focus:outline-none dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white"
                              >
                                <option value="">
                                  Choose account
                                </option>

                                <option value="Family Balance">
                                  Family Balance (R
                                  {parentData.familyBalance.toFixed(2)})
                                </option>

                                <option value="Savings">
                                  Savings (R
                                  {parentData.savings.toFixed(2)})
                                </option>
                              </select>
                            </div>

                            <div>
                              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Product Type
                              </label>

                              <select
                                value={buyProductType}
                                onChange={(e) => {
                                  setBuyProductType(e.target.value);
                                  setAirtimeAmount('');
                                  setSelectedDataBundle('');
                                }}
                                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-[#7C5CFC] focus:outline-none dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white"
                              >
                                <option value="">
                                  Choose product
                                </option>
                                <option value="Airtime">
                                  Airtime
                                </option>
                                <option value="Data">Data</option>
                              </select>
                            </div>

                            {/* Airtime */}
                            {buyProductType === 'Airtime' && (
                              <div>
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  Airtime Amount
                                </label>

                                <input
                                  type="number"
                                  min="1"
                                  value={airtimeAmount}
                                  onChange={(e) =>
                                    setAirtimeAmount(e.target.value)
                                  }
                                  placeholder="Enter airtime amount"
                                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#7C5CFC] focus:outline-none dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white dark:placeholder-gray-500"
                                />
                              </div>
                            )}

                            {/* Data */}
                            {buyProductType === 'Data' &&
                              selectedContactForBuy && (
                                <div>
                                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Data Bundle
                                  </label>

                                  <select
                                    value={selectedDataBundle}
                                    onChange={(e) =>
                                      setSelectedDataBundle(
                                        e.target.value
                                      )
                                    }
                                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-[#7C5CFC] focus:outline-none dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white"
                                  >
                                    <option value="">
                                      Choose data bundle
                                    </option>

                                    {dataBundlesByNetwork[
                                      contact.network
                                    ]?.map((bundle) => (
                                      <option
                                        key={bundle.id}
                                        value={bundle.id}
                                      >
                                        {bundle.label}
                                      </option>
                                    ))}
                                  </select>

                                  {!dataBundlesByNetwork[
                                    contact.network
                                  ] && (
                                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                      No bundle options available for{' '}
                                      {contact.network}.
                                    </p>
                                  )}
                                </div>
                              )}

                            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                              <button
                                onClick={() => {
                                  setSelectedContactForBuy(null);
                                  setBuyAccount('');
                                  setBuyProductType('');
                                }}
                                className="flex-1 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-gray-300 dark:hover:bg-[#2A2740]"
                              >
                                Cancel
                              </button>

                              <button
                                onClick={handleConfirmBuyAirtime}
                                disabled={
                                  !buyAccount ||
                                  !buyProductType ||
                                  (buyProductType === 'Airtime' &&
                                    (!airtimeAmount ||
                                      Number(airtimeAmount) <= 0)) ||
                                  (buyProductType === 'Data' &&
                                    !selectedDataBundle)
                                }
                                className="flex-1 rounded-full bg-[#7C5CFC] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#6A4CE0] disabled:cursor-not-allowed disabled:bg-[#7C5CFC]/30"
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No contacts yet. Add your first contact to get
                    started!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {airtimeTab === 'history' && (
            <div className="max-h-[60vh] overflow-y-auto px-1 py-2 sm:px-2">
              {mockAirtimeHistory.length > 0 ? (
                <div className="space-y-3">
                  {mockAirtimeHistory.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-3 transition hover:bg-gray-50 dark:border-[#2A2740] dark:bg-[#1A1830] dark:hover:bg-[#211E38]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.number}
                          </p>

                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-[#0D0B1A] dark:text-gray-300">
                            {transaction.type}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                          {transaction.date}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          R{transaction.amount.toFixed(2)}
                        </p>

                        <p className="text-xs text-[#16A34A] dark:text-[#4ADE80]">
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
        </main>
      </div>

      {/* Airtime Confirmation Modal */}
      {showAirtimeConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-[#2A2740] dark:bg-[#1A1830] transition-colors duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between bg-[#7C5CFC] px-6 py-4 text-white">
              <h2 className="text-lg font-bold">
                Confirm Purchase Details
              </h2>

              <button
                onClick={() => {
                  setSelectedContactForBuy(null);
                }}
                className="rounded-full p-1 text-white transition hover:bg-[#6A4CE0]"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {/* Disclaimer Banner */}
              <div className="rounded border-l-4 border-[#F97316] bg-orange-50 p-4 dark:bg-[#3B1A16]">
                <p className="mb-1 text-xs font-semibold text-[#EA580C] dark:text-[#F97316]">
                  ⚠️ IMPORTANT DISCLAIMER
                </p>

                <p className="text-xs text-orange-700/80 dark:text-[#F97316]/80">
                  Please verify all details carefully before confirming.
                  Once confirmed, this transaction cannot be reversed.
                  Make sure you entered the correct phone number.
                </p>
              </div>

              {/* Purchase Details */}
              <div className="space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-[#0D0B1A]">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    RECIPIENT
                  </p>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {contact?.name}
                  </p>

                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {contact?.number}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-3 dark:border-[#2A2740]">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    NETWORK
                  </p>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {contact?.network}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-3 dark:border-[#2A2740]">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    PRODUCT TYPE
                  </p>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {buyProductType}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-3 dark:border-[#2A2740]">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {buyProductType === 'Airtime'
                      ? 'AMOUNT'
                      : 'DATA BUNDLE'}
                  </p>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {buyProductType === 'Airtime'
                      ? `R${Number(airtimeAmount).toFixed(2)}`
                      : bundleLabel}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-3 dark:border-[#2A2740]">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    PAYMENT FROM
                  </p>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {buyAccount}
                  </p>
                </div>
              </div>

              {/* Verification Checkboxes */}
              <div className="space-y-2 rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-[#3ED9C2]/30 dark:bg-[#151F35]">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="verify-number"
                    className="mt-1 h-4 w-4 rounded text-[#7C5CFC]"
                  />

                  <label
                    htmlFor="verify-number"
                    className="text-xs text-gray-700 dark:text-gray-300"
                  >
                    I have verified the phone number is correct
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="verify-amount"
                    className="mt-1 h-4 w-4 rounded text-[#7C5CFC]"
                  />

                  <label
                    htmlFor="verify-amount"
                    className="text-xs text-gray-700 dark:text-gray-300"
                  >
                    I have confirmed the amount/bundle is what I want
                    to purchase
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-4 sm:flex-row">
                <button
                  onClick={() => {
                    setSelectedContactForBuy(null);
                    setBuyAccount('');
                    setBuyProductType('');
                    setAirtimeAmount('');
                    setSelectedDataBundle('');
                  }}
                  className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-gray-300 dark:hover:bg-[#2A2740]"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAirtimePurchaseConfirmed}
                  className="flex-1 rounded-full bg-[#7C5CFC] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6A4CE0]"
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