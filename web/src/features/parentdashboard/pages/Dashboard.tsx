import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  authApi,
  getApiErrorMessage,
  getCollectionItems,
  parentApi,
  type SpendingAnalytics,
  type WalletTransaction,
} from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import type { Child, ParentUser } from '@/types/parent';
import { getOrCreateFamilyInviteCode } from '@/features/auth/familyInviteCode';
import {
  useAddChildModal,
  useAddMoneyModal,
  useAccountTransfer,
  useAirtimeModal,
  useElectricityModal,
  useManageLimitsModal,
  useRecurringModal,
  useWalletTopupModal,
} from '@/hooks';
import {
  BottomNavigation,
  DashboardAirtime,
  DashboardElectricity,
  DashboardHome,
  DashboardNotificationsPanel,
  DashboardSearchNotice,
  DashboardTopbar,
  DashboardTV,
  ParentProfileSection,
  WalletTopupModal,
  RecurringModal,
  RecurringFormModal,
  ManageLimitsModal,
  AddChildModal,
  AddMoneyModal,
  QuickActions,
  PaySection,
  TransferSection,
} from '../components';
import {
  HomeIcon,
  WalletIcon,
  PlayIcon,
  StarIcon,
  TvIcon,
  LightningBoltIcon,
  SignalIcon,
  ShieldIcon,
  TransferIcon,
  RefreshIcon,
  CogIcon,
} from '@/components/icons';
import {
  mockParentData,
  mockContacts,
  mockAirtimeHistory,
  mockElectricityHistory,
  mockTvHistory,
  mockQrPayments,
  dataBundlesByNetwork,
} from '../constants/mockData';
import { TabType } from '../types/dashboard.types';

import { WalletPage } from './Wallet';
import { RewardsPage } from './Rewards';

export const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [parentData, setParentData] = useState<ParentUser>({
    ...mockParentData,
    name: '',
    email: '',
    phoneNumber: null as string | null,
    familyBalance: 0,
    monthlySpending: 0,
    children: [],
  });
  const [profileError, setProfileError] = useState('');
  const [profileLoadAttempt, setProfileLoadAttempt] = useState(0);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [spendingAnalytics, setSpendingAnalytics] = useState<SpendingAnalytics | null>(null);
  const [dashboardDataLoading, setDashboardDataLoading] = useState(true);
  const [dashboardDataErrors, setDashboardDataErrors] = useState<string[]>([]);
  const [dashboardDataLoadAttempt, setDashboardDataLoadAttempt] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchNotice, setShowSearchNotice] = useState(false);
  const {
    showWalletTopupModal,
    topupChildId,
    setTopupChildId,
    topupAmount,
    setTopupAmount,
    openModal: openWalletTopupModal,
    closeModal: closeWalletTopupModal,
  } = useWalletTopupModal();
  const {
    showRecurringModal,
    showRecurringFormModal,
    openRecurringModal,
    closeRecurringModal,
    openRecurringFormModal,
    closeRecurringFormModal,
  } = useRecurringModal();
  const {
    showManageLimitsModal,
    openModal: openManageLimitsModal,
    closeModal: closeManageLimitsModal,
  } = useManageLimitsModal();
  const {
    transferSource,
    setTransferSource,
    transferAmount,
    setTransferAmount,
    transferMessage,
    setErrorMessage: setTransferError,
    setSuccessMessage: setTransferSuccess,
  } = useAccountTransfer();
  const {
    showAddChildModal,
    openModal: openAddChildModal,
    closeModal: closeAddChildModal,
  } = useAddChildModal();
  const [familyInviteCode] = useState(() => getOrCreateFamilyInviteCode());
  const familyInviteError = "";
  const [familyInviteCopyStatus, setFamilyInviteCopyStatus] = useState("");

  useEffect(() => {
    let active = true;

    authApi.getProfile()
      .then(({ data }) => {
        if (!active) return;
        const profile = data.data;
        setParentData((current) => ({
          ...current,
          id: profile.id,
          name: profile.full_name,
          email: profile.email,
          phoneNumber: profile.phone_number,
        }));
        setProfileError('');
      })
      .catch((error: unknown) => {
        if (active) {
          setProfileError(getApiErrorMessage(error, 'Unable to load your profile.'));
        }
      });

    return () => {
      active = false;
    };
  }, [profileLoadAttempt]);

  useEffect(() => {
    let active = true;
    setDashboardDataLoading(true);
    setDashboardDataErrors([]);

    Promise.allSettled([
      parentApi.getWallet(),
      parentApi.getChildren(),
      parentApi.getTransactions(),
      parentApi.getSpendingAnalytics({ period: 'month' }),
    ]).then(([walletResult, childrenResult, transactionsResult, analyticsResult]) => {
      if (!active) return;

      const errors: string[] = [];

      if (walletResult.status === 'fulfilled') {
        const wallet = walletResult.value.data.data;
        const balance = Number(wallet.balance);
        if (Number.isFinite(balance)) {
          setParentData((current) => ({
            ...current,
            familyBalance: balance,
            currency: wallet.currency === 'ZAR' ? 'R' : wallet.currency,
          }));
        } else {
          errors.push('The wallet response contained an invalid balance.');
        }
      } else {
        errors.push(`Wallet: ${getApiErrorMessage(walletResult.reason, 'Unable to load wallet data.')}`);
      }

      if (childrenResult.status === 'fulfilled') {
        const children: Child[] = childrenResult.value.data.data.map((child) => ({
          id: child.id,
          name: child.full_name || child.email,
          email: child.email,
          grade: child.grade,
          schoolName: child.school_name,
          walletBalance:
            child.wallet_balance === null ? null : Number(child.wallet_balance),
          isAccountFrozen: child.is_account_frozen,
        }));
        setParentData((current) => ({ ...current, children }));
      } else {
        errors.push(`Children: ${getApiErrorMessage(childrenResult.reason, 'Unable to load linked children.')}`);
      }

      if (transactionsResult.status === 'fulfilled') {
        setWalletTransactions(getCollectionItems(transactionsResult.value.data));
      } else {
        errors.push(`Transactions: ${getApiErrorMessage(transactionsResult.reason, 'Unable to load transactions.')}`);
      }

      if (analyticsResult.status === 'fulfilled') {
        const analytics = analyticsResult.value.data.data;
        setSpendingAnalytics(analytics);
        const monthlySpending = Number(analytics.total_spent);
        if (Number.isFinite(monthlySpending)) {
          setParentData((current) => ({ ...current, monthlySpending }));
        } else {
          errors.push('Spending analytics returned an invalid total.');
        }
      } else {
        errors.push(`Analytics: ${getApiErrorMessage(analyticsResult.reason, 'Unable to load spending analytics.')}`);
      }

      setDashboardDataErrors(errors);
      setDashboardDataLoading(false);
    });

    return () => {
      active = false;
    };
  }, [dashboardDataLoadAttempt]);

  const handleOpenAddChildModal = () => {
    setFamilyInviteCopyStatus("");
    openAddChildModal();
  };

  const handleCopyFamilyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(familyInviteCode);
      setFamilyInviteCopyStatus("Family invite code copied.");
    } catch {
      setFamilyInviteCopyStatus("Copy failed. Select and copy the code manually.");
    }
  };

  const {
    showAirtimePage,
    airtimeTab,
    setAirtimeTab,
    contacts,
    setContacts,
    showAddContactForm,
    setShowAddContactForm,
    newContactNumber,
    setNewContactNumber,
    newContactName,
    setNewContactName,
    newContactNetwork,
    setNewContactNetwork,
    selectedContactForBuy,
    setSelectedContactForBuy,
    buyAccount,
    setBuyAccount,
    buyProductType,
    setBuyProductType,
    airtimeAmount,
    setAirtimeAmount,
    selectedDataBundle,
    setSelectedDataBundle,
    showAirtimeConfirmation,
    setShowAirtimeConfirmation,
    openModal: openAirtimeModal,
    closeModal: closeAirtimeModal,
  } = useAirtimeModal(mockContacts);

  const {
    showAddMoneyModal,
    addMoneyAmount,
    setAddMoneyAmount,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    openModal: openAddMoneyModal,
    closeModal: closeAddMoneyModal,
  } = useAddMoneyModal();

  const {
    showElectricityPage,
    electricityTab,
    setElectricityTab,
    electricityMeters,
    setElectricityMeters,
    showAddMeterForm,
    setShowAddMeterForm,
    newMeterName,
    setNewMeterName,
    newMeterNumber,
    setNewMeterNumber,
    selectedMeterForBuy,
    setSelectedMeterForBuy,
    electricityAmount,
    setElectricityAmount,
    showElectricityConfirmation,
    setShowElectricityConfirmation,
    openModal: openElectricityModal,
    closeModal: closeElectricityModal,
  } = useElectricityModal([{ id: '1', name: 'Home', meterNumber: '1234567890' }]);

  // TV page
  const [showTvPage, setShowTvPage] = useState(false);
  const [tvTab, setTvTab] = useState<'pay' | 'history'>('pay');

  const handleLogout = async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch (error) {
      console.error('Unable to revoke the session on the server.', error);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const handleTopupWallet = () => {
    const amountValue = Number(topupAmount);
    if (!topupChildId || !amountValue || amountValue <= 0) return;
    const child = parentData.children.find((c) => c.id === topupChildId);
    alert(`Top-up R${amountValue.toFixed(2)} to ${child?.name || 'selected child'}'s wallet.`);
    closeWalletTopupModal();
  };

  const handleTransferAccounts = () => {
    const amountValue = Number(transferAmount);
    if (!amountValue || amountValue <= 0) {
      setTransferError('Please enter a valid transfer amount.');
      return;
    }

    const sourceBalance = transferSource === 'family' ? parentData.familyBalance : parentData.savings;
    if (amountValue > sourceBalance) {
      setTransferError(`Insufficient funds in ${transferSource === 'family' ? 'Family Balance' : 'Savings'}.`);
      return;
    }

    const updatedData = {
      ...parentData,
      familyBalance:
        transferSource === 'family'
          ? parentData.familyBalance - amountValue
          : parentData.familyBalance + amountValue,
      savings:
        transferSource === 'family'
          ? parentData.savings + amountValue
          : parentData.savings - amountValue,
    };

    setParentData(updatedData);
    setTransferSuccess(
      amountValue,
      transferSource === 'family' ? 'Family Balance' : 'Savings',
      transferSource === 'family' ? 'Savings' : 'Family Balance'
    );
  };

  // Airtime handlers
  const handleAddContactClick = () => setShowAddContactForm((s) => !s);

  const handleSaveContact = () => {
    if (!newContactName || !newContactNumber || !newContactNetwork) return;
    const newContact = { id: String(contacts.length + 1), number: newContactNumber, name: newContactName, network: newContactNetwork };
    setContacts([...contacts, newContact]);
    setNewContactNumber('');
    setNewContactName('');
    setNewContactNetwork('');
    setShowAddContactForm(false);
    alert(`Contact ${newContactName} (${newContactNumber}) added successfully!`);
  };

  const handleBuyAirtime = (contactId: string) => {
    setSelectedContactForBuy(contactId);
    setBuyAccount('');
    setBuyProductType('');
    setAirtimeAmount('');
    setSelectedDataBundle('');
  };

  const handleConfirmBuyAirtime = () => {
    if (!selectedContactForBuy || !buyAccount || !buyProductType) return;
    if (buyProductType === 'Airtime') {
      const amountValue = Number(airtimeAmount);
      if (!amountValue || amountValue <= 0) return;
    } else {
      if (!selectedDataBundle) return;
    }
    setShowAirtimeConfirmation(true);
  };

  const handleAirtimePurchaseConfirmed = () => {
    const contact = contacts.find((c) => c.id === selectedContactForBuy);
    if (buyProductType === 'Airtime') {
      const amountValue = Number(airtimeAmount);
      alert(`Purchase confirmed!\n\nAirtime of R${amountValue.toFixed(2)} for ${contact?.name} (${contact?.number}) on ${contact?.network} from ${buyAccount} account has been processed.`);
    } else {
      const bundleLabel = dataBundlesByNetwork[contact?.network || '']?.find((b) => b.id === selectedDataBundle)?.label;
      alert(`Purchase confirmed!\n\n${bundleLabel} data bundle for ${contact?.name} (${contact?.number}) on ${contact?.network} from ${buyAccount} account has been processed.`);
    }

    setShowAirtimeConfirmation(false);
    setSelectedContactForBuy(null);
    setBuyAccount('');
    setBuyProductType('');
    setAirtimeAmount('');
    setSelectedDataBundle('');
  };

  const handleContinueToPayment = () => {
    const amountValue = Number(addMoneyAmount);
    if (!amountValue || amountValue <= 0 || !selectedPaymentMethod) return;
    alert(`Processing R${amountValue.toFixed(2)} payment via ${selectedPaymentMethod}`);
    closeAddMoneyModal();
  };

  const handleAddMeter = () => {
    if (!newMeterName || !newMeterNumber) return;
    const newMeter = { id: String(electricityMeters.length + 1), name: newMeterName, meterNumber: newMeterNumber };
    setElectricityMeters([...electricityMeters, newMeter]);
    setNewMeterName('');
    setNewMeterNumber('');
    setShowAddMeterForm(false);
    alert(`Meter "${newMeter.name}" added successfully!`);
  };

  const handleDeleteMeter = (id: string) => {
    setElectricityMeters(electricityMeters.filter((m) => m.id !== id));
  };

  const handleBuyElectricity = (meterId: string) => {
    setSelectedMeterForBuy(meterId);
    setElectricityAmount('');
  };

  const handleConfirmElectricityPurchase = () => {
    const amountValue = Number(electricityAmount);
    if (!selectedMeterForBuy || !amountValue || amountValue <= 0) return;
    setShowElectricityConfirmation(true);
  };

  const handleElectricityPurchaseConfirmed = () => {
    const meter = electricityMeters.find((m) => m.id === selectedMeterForBuy);
    const amountValue = Number(electricityAmount);
    alert(`Purchase confirmed!\n\nElectricity credit of R${amountValue.toFixed(2)} for meter ${meter?.meterNumber} (${meter?.name}) has been processed.`);
    setShowElectricityConfirmation(false);
    setSelectedMeterForBuy(null);
    setElectricityAmount('');
  };

  // TV handlers
  const closeTvModal = () => {
    setShowTvPage(false);
    setTvTab('pay');
  };

  // Quick Actions
  const quickActionsAll = [
    {
      id: '1',
      title: 'Recurring Auto Payments',
      icon: <RefreshIcon className="w-6 h-6 text-[#713cff]" />,
      onClick: openRecurringModal,
    },
    {
      id: '2',
      title: 'Wallet Top-up',
      icon: <WalletIcon className="w-6 h-6 text-[#713cff]" />,
      onClick: openWalletTopupModal,
    },
    {
      id: '3',
      title: 'Manage Spending Limits',
      icon: <ShieldIcon className="w-6 h-6 text-[#713cff]" />,
      onClick: openManageLimitsModal,
    },
  ];

  const quickActions = [quickActionsAll[0], quickActionsAll[1]];

  // Recharge Items
  const rechargeItems = [
    {
      id: '1',
      title: 'Buy airtime and data',
      icon: <SignalIcon className="w-6 h-6 text-[#713cff]" />,
      onClick: openAirtimeModal,
    },
    {
      id: '2',
      title: 'Buy electricity',
      icon: <LightningBoltIcon className="w-6 h-6 text-[#713cff]" />,
      onClick: openElectricityModal,
    },
    {
      id: '3',
      title: 'TV',
      icon: <TvIcon className="w-6 h-6 text-[#713cff]" />,
      onClick: () => setShowTvPage(true),
    },
  ];

  // Bottom Navigation Items
  const navItems = [
    { id: 'home', label: 'Home', isActive: currentTab === 'home', onClick: () => setCurrentTab('home'), icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'payments', label: 'Transfer', isActive: currentTab === 'payments', onClick: () => setCurrentTab('payments'), icon: <TransferIcon className="w-5 h-5" /> },
    { id: 'wallet', label: 'Wallet', isActive: currentTab === 'wallet', onClick: () => setCurrentTab('wallet'), icon: <WalletIcon className="w-5 h-5" /> },
    { id: 'pay', label: 'Pay', isActive: currentTab === 'pay', onClick: () => setCurrentTab('pay'), icon: <PlayIcon className="w-5 h-5" /> },
    { id: 'rewards', label: 'Rewards', isActive: currentTab === 'rewards', onClick: () => setCurrentTab('rewards'), icon: <StarIcon className="w-5 h-5" /> },
    { id: 'settings', label: 'Profile', isActive: currentTab === 'settings', onClick: () => setCurrentTab('settings'), icon: <CogIcon className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <DashboardHome
            parentData={parentData}
            quickActions={quickActions}
            rechargeItems={rechargeItems}
            onAddMoney={openAddMoneyModal}
            onAddChild={handleOpenAddChildModal}
            onChildClick={(child) => alert(`Manage ${child.name} - Coming Soon`)}
            onChangeCurrency={(child) => alert(`Change currency for ${child.name} - Coming Soon`)}
          />
        );

      case 'payments':
        return (
          <div className="pb-20 md:pb-0">
            <div className="max-w-7xl mx-auto px-4">
              <TransferSection
                transferSource={transferSource}
                setTransferSource={setTransferSource}
                transferAmount={transferAmount}
                setTransferAmount={setTransferAmount}
                transferMessage={transferMessage}
                onTransfer={handleTransferAccounts}
                familyBalance={parentData.familyBalance}
                savings={parentData.savings}
              />

              <QuickActions actions={quickActionsAll} title="Manage payments" />
            </div>
          </div>
        );

      case 'wallet':
        return (
          <WalletPage
            balance={parentData.familyBalance}
            currency={parentData.currency}
            transactions={walletTransactions}
            analytics={spendingAnalytics}
            isLoading={dashboardDataLoading}
          />
        );

      case 'pay':
        return <PaySection payments={mockQrPayments} />;

      case 'rewards':
        return <RewardsPage />;

      case 'settings':
        return (
          <ParentProfileSection
            parentData={parentData}
            familyInviteCode={familyInviteCode}
            onLogout={handleLogout}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {showAirtimePage ? (
        <DashboardAirtime
          parentData={parentData}
          airtimeTab={airtimeTab}
          setAirtimeTab={setAirtimeTab}
          closeAirtimeModal={closeAirtimeModal}
          showAddContactForm={showAddContactForm}
          setShowAddContactForm={setShowAddContactForm}
          handleAddContactClick={handleAddContactClick}
          setSelectedContactForBuy={setSelectedContactForBuy}
          contacts={contacts}
          newContactName={newContactName}
          newContactNumber={newContactNumber}
          newContactNetwork={newContactNetwork}
          setNewContactName={setNewContactName}
          setNewContactNumber={setNewContactNumber}
          setNewContactNetwork={setNewContactNetwork}
          handleSaveContact={handleSaveContact}
          selectedContactForBuy={selectedContactForBuy}
          handleBuyAirtime={handleBuyAirtime}
          buyAccount={buyAccount}
          setBuyAccount={setBuyAccount}
          buyProductType={buyProductType}
          setBuyProductType={setBuyProductType}
          airtimeAmount={airtimeAmount}
          setAirtimeAmount={setAirtimeAmount}
          selectedDataBundle={selectedDataBundle}
          setSelectedDataBundle={setSelectedDataBundle}
          handleConfirmBuyAirtime={handleConfirmBuyAirtime}
          showAirtimeConfirmation={showAirtimeConfirmation}
          handleAirtimePurchaseConfirmed={handleAirtimePurchaseConfirmed}
          mockAirtimeHistory={mockAirtimeHistory}
          dataBundlesByNetwork={dataBundlesByNetwork}
        />
      ) : showElectricityPage ? (
        <DashboardElectricity
          electricityTab={electricityTab}
          setElectricityTab={setElectricityTab}
          closeElectricityModal={closeElectricityModal}
          showAddMeterForm={showAddMeterForm}
          setShowAddMeterForm={setShowAddMeterForm}
          newMeterName={newMeterName}
          setNewMeterName={setNewMeterName}
          newMeterNumber={newMeterNumber}
          setNewMeterNumber={setNewMeterNumber}
          electricityMeters={electricityMeters}
          handleAddMeter={handleAddMeter}
          handleDeleteMeter={handleDeleteMeter}
          selectedMeterForBuy={selectedMeterForBuy}
          setSelectedMeterForBuy={setSelectedMeterForBuy}
          electricityAmount={electricityAmount}
          setElectricityAmount={setElectricityAmount}
          showElectricityConfirmation={showElectricityConfirmation}
          handleBuyElectricity={handleBuyElectricity}
          handleConfirmElectricityPurchase={handleConfirmElectricityPurchase}
          handleElectricityPurchaseConfirmed={handleElectricityPurchaseConfirmed}
          mockElectricityHistory={mockElectricityHistory}
        />
      ) : showTvPage ? (
        <DashboardTV
          tvTab={tvTab}
          setTvTab={setTvTab}
          closeTvModal={closeTvModal}
          familyBalance={parentData.familyBalance}
          savings={parentData.savings}
          mockTvHistory={mockTvHistory}
        />
      ) : (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0D0B1A] dark:text-white transition-colors duration-200">
          <DashboardTopbar
            title="Parent Dashboard"
            onSearch={() => setShowSearchNotice(true)}
            onToggleNotifications={() => setShowNotifications((value) => !value)}
            onLogout={handleLogout}
          />

          {showSearchNotice && <DashboardSearchNotice onClose={() => setShowSearchNotice(false)} />}
          {showNotifications && <DashboardNotificationsPanel />}

          <div className="flex flex-col md:flex-row">
            <aside className="w-full md:w-64 flex-shrink-0"><BottomNavigation items={navItems} /></aside>
            <main className="flex-1">
              {profileError && (
                <div role="alert" className="mx-4 mt-4 flex items-center justify-between gap-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                  <span>{profileError}</span>
                  <button
                    type="button"
                    onClick={() => setProfileLoadAttempt((attempt) => attempt + 1)}
                    className="shrink-0 font-semibold underline"
                  >
                    Retry
                  </button>
                </div>
              )}
              {dashboardDataErrors.length > 0 && (
                <div role="alert" className="mx-4 mt-4 flex items-start justify-between gap-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <ul className="list-disc space-y-1 pl-5">
                    {dashboardDataErrors.map((error) => <li key={error}>{error}</li>)}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setDashboardDataLoadAttempt((attempt) => attempt + 1)}
                    className="shrink-0 font-semibold underline"
                  >
                    Retry
                  </button>
                </div>
              )}
              {dashboardDataLoading && (
                <p role="status" className="mx-4 mt-4 text-sm text-slate-600 dark:text-slate-300">
                  Loading your wallet, children, and spending data…
                </p>
              )}
              {renderContent()}
            </main>
          </div>

          {/* Modals: Wallet Topup, Recurring, Manage limits, Add Money */}

                    <WalletTopupModal
            open={showWalletTopupModal}
            onClose={closeWalletTopupModal}
            children={parentData.children}
            topupChildId={topupChildId}
            onSelectChild={setTopupChildId}
            topupAmount={topupAmount}
            onChangeAmount={setTopupAmount}
            onTopup={handleTopupWallet}
          />

                    <RecurringModal
            open={showRecurringModal}
            onClose={closeRecurringModal}
            onAddNew={openRecurringFormModal}
          />

                    <RecurringFormModal
            open={showRecurringFormModal}
            onClose={closeRecurringFormModal}
          />

                    <ManageLimitsModal
            open={showManageLimitsModal}
            onClose={closeManageLimitsModal}
          />

                    <AddChildModal
            open={showAddChildModal}
            onClose={closeAddChildModal}
            inviteCode={familyInviteCode}
            error={familyInviteError}
            copyStatus={familyInviteCopyStatus}
            onCopy={handleCopyFamilyInviteCode}
          />

                    <AddMoneyModal
            open={showAddMoneyModal}
            onClose={closeAddMoneyModal}
            amount={addMoneyAmount}
            onChangeAmount={setAddMoneyAmount}
            selectedPaymentMethod={selectedPaymentMethod}
            onChangePaymentMethod={setSelectedPaymentMethod}
            onContinue={handleContinueToPayment}
          />

        </div>
      )}
    </>
  );
};
