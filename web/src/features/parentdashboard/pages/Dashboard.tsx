import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  BottomNavigation,
  DashboardAirtime,
  DashboardElectricity,
  DashboardHome,
  DashboardNotificationsPanel,
  DashboardSearchNotice,
  DashboardTopbar,
  DashboardTV,
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
import { TabType, BalanceSource } from '../types/dashboard.types';

import { WalletPage } from './Wallet';
import { RewardsPage } from './Rewards';

export const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [parentData, setParentData] = useState(mockParentData);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchNotice, setShowSearchNotice] = useState(false);
  const [showWalletTopupModal, setShowWalletTopupModal] = useState(false);
  const [topupChildId, setTopupChildId] = useState('');
  const [topupAmount, setTopupAmount] = useState('');
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showRecurringFormModal, setShowRecurringFormModal] = useState(false);
  const [showManageLimitsModal, setShowManageLimitsModal] = useState(false);
  const [transferSource, setTransferSource] = useState<BalanceSource>('family');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMessage, setTransferMessage] = useState('');
  // Add Child modal state
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [childUsername, setChildUsername] = useState('');
  const [childPassword, setChildPassword] = useState('');
  const [childWeeklyLimit, setChildWeeklyLimit] = useState('');
  const [childDailyLimit, setChildDailyLimit] = useState('');

  // Airtime/Data state
  const [showAirtimePage, setShowAirtimePage] = useState(false);
  const [airtimeTab, setAirtimeTab] = useState<'buy' | 'history'>('buy');
  const [contacts, setContacts] = useState(mockContacts);
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [newContactNumber, setNewContactNumber] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactNetwork, setNewContactNetwork] = useState('');
  const [selectedContactForBuy, setSelectedContactForBuy] = useState<string | null>(null);
  const [buyAccount, setBuyAccount] = useState('');
  const [buyProductType, setBuyProductType] = useState('');
  const [airtimeAmount, setAirtimeAmount] = useState('');
  const [selectedDataBundle, setSelectedDataBundle] = useState('');

  // Add Money modal state
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  // Electricity page
  const [showElectricityPage, setShowElectricityPage] = useState(false);
  const [electricityTab, setElectricityTab] = useState<'buy' | 'history'>('buy');
  const [electricityMeters, setElectricityMeters] = useState([{ id: '1', name: 'Home', meterNumber: '1234567890' }]);
  const [showAddMeterForm, setShowAddMeterForm] = useState(false);
  const [newMeterName, setNewMeterName] = useState('');
  const [newMeterNumber, setNewMeterNumber] = useState('');
  const [selectedMeterForBuy, setSelectedMeterForBuy] = useState<string | null>(null);
  const [electricityAmount, setElectricityAmount] = useState('');
  const [showElectricityConfirmation, setShowElectricityConfirmation] = useState(false);

  // TV page
  const [showTvPage, setShowTvPage] = useState(false);
  const [tvTab, setTvTab] = useState<'pay' | 'history'>('pay');

  // Airtime/Electricity Confirmation states
  const [showAirtimeConfirmation, setShowAirtimeConfirmation] = useState(false);

  // Profile page states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [appNotificationsEnabled, setAppNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const closeWalletTopupModal = () => {
    setShowWalletTopupModal(false);
    setTopupChildId('');
    setTopupAmount('');
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
      setTransferMessage('Please enter a valid transfer amount.');
      return;
    }

    const sourceBalance = transferSource === 'family' ? parentData.familyBalance : parentData.savings;
    if (amountValue > sourceBalance) {
      setTransferMessage(`Insufficient funds in ${transferSource === 'family' ? 'Family Balance' : 'Savings'}.`);
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
    setTransferMessage(`Successfully transferred R${amountValue.toFixed(2)} from ${transferSource === 'family' ? 'Family Balance' : 'Savings'} to ${transferSource === 'family' ? 'Savings' : 'Family Balance'}.`);
    setTransferAmount('');
  };

  const openRecurringFormModal = () => {
    setShowRecurringModal(false);
    setShowRecurringFormModal(true);
  };

  const closeRecurringModal = () => setShowRecurringModal(false);
  const closeRecurringFormModal = () => {
    setShowRecurringFormModal(false);
  };

  const closeManageLimitsModal = () => {
    setShowManageLimitsModal(false);
  };

  // Airtime handlers
  const closeAirtimeModal = () => {
    setShowAirtimePage(false);
    setAirtimeTab('buy');
    setShowAddContactForm(false);
    setNewContactNumber('');
    setNewContactName('');
    setNewContactNetwork('');
    setSelectedContactForBuy(null);
    setBuyAccount('');
    setBuyProductType('');
    setAirtimeAmount('');
    setSelectedDataBundle('');
  };

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

  // Add Child handlers
  const closeAddChildModal = () => {
    setShowAddChildModal(false);
    setChildFirstName('');
    setChildLastName('');
    setChildUsername('');
    setChildPassword('');
    setChildWeeklyLimit('');
    setChildDailyLimit('');
  };

  const handleCreateChild = () => {
    if (!childFirstName || !childLastName || !childUsername || !childPassword) return;
    const newChild = {
      id: String(parentData.children.length + 1),
      name: `${childFirstName} ${childLastName}`,
      email: childUsername,
      spendLimit: childWeeklyLimit ? Number(childWeeklyLimit) : 0,
      currentSpending: 0,
      avatar: undefined,
    };
    setParentData({ ...parentData, children: [...parentData.children, newChild] });
    closeAddChildModal();
    alert(`Child account for ${newChild.name} created successfully`);
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
      alert(`✓ Purchase confirmed!\n\nAirtime of R${amountValue.toFixed(2)} for ${contact?.name} (${contact?.number}) on ${contact?.network} from ${buyAccount} account has been processed.`);
    } else {
      const bundleLabel = dataBundlesByNetwork[contact?.network || '']?.find((b) => b.id === selectedDataBundle)?.label;
      alert(`✓ Purchase confirmed!\n\n${bundleLabel} data bundle for ${contact?.name} (${contact?.number}) on ${contact?.network} from ${buyAccount} account has been processed.`);
    }

    setShowAirtimeConfirmation(false);
    setSelectedContactForBuy(null);
    setBuyAccount('');
    setBuyProductType('');
    setAirtimeAmount('');
    setSelectedDataBundle('');
  };

  const closeAddMoneyModal = () => {
    setShowAddMoneyModal(false);
    setAddMoneyAmount('');
    setSelectedPaymentMethod('');
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
    alert(`✓ Purchase confirmed!\n\nElectricity credit of R${amountValue.toFixed(2)} for meter ${meter?.meterNumber} (${meter?.name}) has been processed.`);
    setShowElectricityConfirmation(false);
    setSelectedMeterForBuy(null);
    setElectricityAmount('');
  };

  const closeElectricityModal = () => {
    setShowElectricityPage(false);
    setElectricityTab('buy');
    setSelectedMeterForBuy(null);
    setElectricityAmount('');
    setShowAddMeterForm(false);
    setNewMeterName('');
    setNewMeterNumber('');
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
      icon: <RefreshIcon className="w-6 h-6 text-rose-500" />,
      onClick: () => setShowRecurringModal(true),
    },
    {
      id: '2',
      title: 'Wallet Top-up',
      icon: <WalletIcon className="w-6 h-6 text-rose-500" />,
      onClick: () => {
        setTopupChildId('');
        setTopupAmount('');
        setShowWalletTopupModal(true);
      },
    },
    {
      id: '3',
      title: 'Manage Spending Limits',
      icon: <ShieldIcon className="w-6 h-6 text-rose-500" />,
      onClick: () => {
        setShowManageLimitsModal(true);
      },
    },
  ];

  const quickActions = [quickActionsAll[0], quickActionsAll[1]];

  // Recharge Items
  const rechargeItems = [
    {
      id: '1',
      title: 'Buy airtime and data',
      icon: <SignalIcon className="w-6 h-6 text-rose-500" />,
      onClick: () => setShowAirtimePage(true),
    },
    {
      id: '2',
      title: 'Buy electricity',
      icon: <LightningBoltIcon className="w-6 h-6 text-rose-500" />,
      onClick: () => setShowElectricityPage(true),
    },
    {
      id: '3',
      title: 'TV',
      icon: <TvIcon className="w-6 h-6 text-rose-500" />,
      onClick: () => setShowTvPage(true),
    },
  ];

  // Profile handlers
  const handleEditProfile = () => {
    setShowEditProfileModal(true);
  };

  const closeEditProfileModal = () => {
    setShowEditProfileModal(false);
  };

  const handleSaveProfileChanges = () => {
    alert('Profile updated successfully!');
    closeEditProfileModal();
  };

  const handleDeleteAccount = () => {
    setShowDeleteAccountModal(true);
  };

  const handleConfirmDeleteAccount = () => {
    alert(`✓ Account deletion initiated.\n\nYour account and all associated children accounts have been permanently deleted.\n\nThis action cannot be undone.`);
    setShowDeleteAccountModal(false);
    // In a real app, this would call an API to delete the account
    // navigate('/login');
  };

  // Change password handlers (moved to component scope)
  const handleOpenChangePassword = () => {
    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowChangePasswordModal(true);
  };

  const handleCloseChangePassword = () => {
    setShowChangePasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleSaveNewPassword = () => {
    // Validation
    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword) {
      setPasswordError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    // Success
    alert('✓ Password changed successfully!');
    handleCloseChangePassword();
  };

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
            onAddMoney={() => setShowAddMoneyModal(true)}
            onAddChild={() => setShowAddChildModal(true)}
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
        return <WalletPage />;

      case 'pay':
        return <PaySection payments={mockQrPayments} />;

      case 'rewards':
        return <RewardsPage />;

      case 'settings':
        return (
          <div className="pb-16 md:pb-0 px-4 md:px-6 py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                <p className="text-sm text-slate-500 mt-2">View your account information and parent details.</p>
              </div>
              <div className="text-sm text-slate-500">Manage your profile and security preferences in one place.</div>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm mb-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 text-white text-lg font-bold">
                    {parentData.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">{parentData.name}</p>
                    <p className="text-sm text-slate-500">Parent Account</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="bg-white rounded-3xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
                    <p className="text-sm text-slate-500">Your HapoPay parent profile details.</p>
                  </div>
                  <button className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-600 hover:bg-pink-100 transition" onClick={handleEditProfile}>
                    Edit profile
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 p-3">
                    <p className="text-[11px] text-slate-500">Full Name</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{parentData.name}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 p-3">
                    <p className="text-[11px] text-slate-500">Email Address</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{parentData.email}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 p-3">
                    <p className="text-[11px] text-slate-500">Phone Number</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">+27 71 234 5678</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 p-3">
                    <p className="text-[11px] text-slate-500">Children Linked</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{parentData.children.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
                    <p className="text-sm text-slate-500">Manage your alert preferences.</p>
                  </div>
                  <button className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition">
                    Manage
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-3xl border border-slate-200 p-3">
                    <div>
                      <p className="font-medium text-slate-900">App notifications</p>
                      <p className="text-xs text-slate-500">Spending alerts and updates.</p>
                    </div>
                    <button onClick={() => setAppNotificationsEnabled(!appNotificationsEnabled)} className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium transition ${appNotificationsEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {appNotificationsEnabled ? 'On' : 'Off'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-3xl border border-slate-200 p-3">
                    <div>
                      <p className="font-medium text-slate-900">Email notifications</p>
                      <p className="text-xs text-slate-500">Weekly summaries and account alerts.</p>
                    </div>
                    <button onClick={() => setEmailNotificationsEnabled(!emailNotificationsEnabled)} className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium transition ${emailNotificationsEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {emailNotificationsEnabled ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Security</h2>
                <div className="space-y-3">
                  <div className="flex flex-col gap-2 rounded-3xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Change password</p>
                      <p className="text-xs text-slate-500">Update your password regularly.</p>
                    </div>
                    <button onClick={handleOpenChangePassword} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition">
                      Change password
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 rounded-3xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Two-factor authentication</p>
                      <p className="text-xs text-slate-500">Require a second verification step when signing in.</p>
                    </div>
                    <button className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-3xl p-4 shadow-sm border border-red-200">
                <h2 className="text-lg font-semibold text-red-900 mb-4">Danger zone</h2>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
                  <button className="w-full sm:w-auto rounded-3xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition min-w-[120px] sm:min-w-[130px]">
                    Logout
                  </button>
                  <button className="w-full sm:w-auto rounded-3xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition min-w-[120px] sm:min-w-[130px]" onClick={handleDeleteAccount}>
                    Delete account
                  </button>
                </div>
              </div>
            </div>
          </div>
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
        <div className="min-h-screen bg-slate-50 text-slate-900">
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
            <main className="flex-1">{renderContent()}</main>
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
            firstName={childFirstName}
            lastName={childLastName}
            username={childUsername}
            password={childPassword}
            weeklyLimit={childWeeklyLimit}
            dailyLimit={childDailyLimit}
            onChangeFirstName={setChildFirstName}
            onChangeLastName={setChildLastName}
            onChangeUsername={setChildUsername}
            onChangePassword={setChildPassword}
            onChangeWeeklyLimit={setChildWeeklyLimit}
            onChangeDailyLimit={setChildDailyLimit}
            onSubmit={handleCreateChild}
            currency={parentData.currency}
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

          {/* Edit Profile Modal */}
          {showEditProfileModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Edit Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Full Name</label>
                    <input type="text" defaultValue={parentData.name} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Email Address</label>
                    <input type="email" defaultValue={parentData.email} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Phone Number</label>
                    <input type="tel" defaultValue="+27 71 234 5678" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={closeEditProfileModal} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                    Cancel
                  </button>
                  <button onClick={handleSaveProfileChanges} className="flex-1 rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600 transition">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Change Password Modal */}
          {showChangePasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Change Password</h2>
                <p className="text-sm text-slate-500 mb-6">Enter your current and new password</p>

                {passwordError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-700">{passwordError}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCloseChangePassword}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewPassword}
                    className="flex-1 rounded-lg bg-pink-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-pink-600 transition"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Account Confirmation Modal */}
          {showDeleteAccountModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <span className="text-xl text-red-600">⚠️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-red-600">Delete Account?</h2>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-800 font-medium mb-2">This action cannot be undone.</p>
                  <p className="text-sm text-red-700">Deleting your account will:</p>
                  <ul className="text-sm text-red-700 list-disc list-inside mt-2 space-y-1">
                    <li>Permanently delete your profile</li>
                    <li>Delete all linked children accounts</li>
                    <li>Clear all transaction history</li>
                  </ul>
                </div>
                <p className="text-sm text-slate-600 mb-6">Are you sure you want to proceed? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteAccountModal(false)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                    Cancel
                  </button>
                  <button onClick={handleConfirmDeleteAccount} className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
};
