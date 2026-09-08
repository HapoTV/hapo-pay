import { useTheme } from '@/context/ThemeContext';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  BottomNavigation,
  DashboardAirtime,
  DashboardElectricity,
  DashboardHome,
  DashboardNotificationsPanel,
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
  const { theme, toggleTheme, setTheme } = useTheme();

const isDarkMode = theme === 'dark';

const handleToggleMode = () => {
  toggleTheme();
};
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
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [transactionAlertsEnabled, setTransactionAlertsEnabled] = useState(true);
  const [flaggedPurchasesEnabled, setFlaggedPurchasesEnabled] = useState(true);
  const [allowanceRemindersEnabled, setAllowanceRemindersEnabled] = useState(false);
  const [biometricUnlockEnabled, setBiometricUnlockEnabled] = useState(true);
  const [parentPinEnabled, setParentPinEnabled] = useState(true);
  const [spendingAlertsEnabled, setSpendingAlertsEnabled] = useState(true);
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
      icon: <RefreshIcon className="w-6 h-6 text-[#7C5CFC]" />,
      onClick: () => setShowRecurringModal(true),
    },
    {
      id: '2',
      title: 'Wallet Top-up',
      icon: <WalletIcon className="w-6 h-6 text-[#7C5CFC]" />,
      onClick: () => {
        setTopupChildId('');
        setTopupAmount('');
        setShowWalletTopupModal(true);
      },
    },
    {
      id: '3',
      title: 'Manage Spending Limits',
      icon: <ShieldIcon className="w-6 h-6 text-[#7C5CFC]" />,
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
      icon: <SignalIcon className="w-6 h-6 text-[#7C5CFC]" />,
      onClick: () => setShowAirtimePage(true),
    },
    {
      id: '2',
      title: 'Buy electricity',
      icon: <LightningBoltIcon className="w-6 h-6 text-[#7C5CFC]" />,
      onClick: () => setShowElectricityPage(true),
    },
    {
      id: '3',
      title: 'TV',
      icon: <TvIcon className="w-6 h-6 text-[#7C5CFC]" />,
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
 case 'settings': {
  // Reusable iOS-style toggle switch
  const Toggle: React.FC<{
    enabled: boolean;
    onToggle: () => void;
    label: string;
  }> = ({ enabled, onToggle, label }) => (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
        enabled
          ? 'bg-[#7C5CFC]'
          : 'bg-gray-300 dark:bg-[#2A2740]'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const childrenCount = parentData.children.length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-20 md:px-6 md:pb-6">

      {/* Family / Profile */}
      <div className="mb-5 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-[#2A2740] dark:bg-[#1A1830]">
        <button
          type="button"
          onClick={() => setShowPersonalInfo((value) => !value)}
          className="flex w-full items-center gap-3 text-left"
          aria-expanded={showPersonalInfo}
        >
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-lg text-white"
            style={{
              background:
                'linear-gradient(135deg, #7C5CFC 0%, #3ED9C2 100%)',
            }}
          >
            👨‍👩‍👧‍👦
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-gray-900 dark:text-white">
              {parentData.name}
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {childrenCount}{' '}
              {childrenCount === 1 ? 'child' : 'children'} · Premium plan
            </p>
          </div>

          <span
            className="flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white"
            style={{
              background:
                'linear-gradient(135deg, #7C5CFC 0%, #3ED9C2 100%)',
            }}
          >
            PRO
          </span>
        </button>

        {showPersonalInfo && (
          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-[#2A2740]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h2>

              <button
                type="button"
                onClick={handleEditProfile}
                className="rounded-full border border-[#7C5CFC]/30 bg-[#7C5CFC]/10 px-3 py-1.5 text-xs font-medium text-[#7C5CFC] transition hover:bg-[#7C5CFC]/20 dark:text-[#B39DFF]"
              >
                Edit profile
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: 'Full Name',
                  value: parentData.name,
                },
                {
                  label: 'Email Address',
                  value: parentData.email,
                },
                {
                  label: 'Phone Number',
                  value: '+27 71 234 5678',
                },
                {
                  label: 'Children Linked',
                  value: childrenCount,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-gray-200 p-3 transition-colors dark:border-[#2A2740]"
                >
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {item.label}
                  </p>

                  <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Appearance */}
      <div className="mb-5 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-[#2A2740] dark:bg-[#1A1830]">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500">
          Appearance
        </p>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 text-[#7C5CFC]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>

            <p className="font-medium text-gray-900 dark:text-white">
              Dark Mode
            </p>
          </div>

          <Toggle
            enabled={isDarkMode}
            onToggle={handleToggleMode}
            label="Dark mode"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Dark Mode */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`rounded-2xl border-2 py-4 text-center transition ${
              isDarkMode
                ? 'border-[#7C5CFC] bg-[#7C5CFC]/5'
                : 'border-gray-200 bg-gray-50 dark:border-[#2A2740] dark:bg-[#0D0B1A]'
            }`}
          >
            <div className="mx-auto mb-2 h-1 w-6 rounded-full bg-[#7C5CFC]" />

            <p
              className={`text-sm font-medium ${
                isDarkMode
                  ? 'text-[#7C5CFC] dark:text-[#B39DFF]'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Dark
            </p>
          </button>

          {/* Light Mode */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`rounded-2xl border-2 py-4 text-center transition ${
              !isDarkMode
                ? 'border-[#7C5CFC] bg-[#7C5CFC]/5'
                : 'border-gray-200 bg-gray-50 dark:border-[#2A2740] dark:bg-[#0D0B1A]'
            }`}
          >
            <div className="mx-auto mb-2 h-1 w-6 rounded-full bg-gray-800 dark:bg-white" />

            <p
              className={`text-sm font-medium ${
                !isDarkMode
                  ? 'text-[#7C5CFC] dark:text-[#B39DFF]'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Light
            </p>
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-5 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-[#2A2740] dark:bg-[#1A1830]">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          Notifications
        </p>

        <div className="space-y-4">
          {/* Transaction Alerts */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>

              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Transaction alerts
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Get notified on every purchase
                </p>
              </div>
            </div>

            <Toggle
              enabled={transactionAlertsEnabled}
              onToggle={() =>
                setTransactionAlertsEnabled((value) => !value)
              }
              label="Transaction alerts"
            />
          </div>

          {/* Flagged Purchases */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />

              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Flagged purchases
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Immediate alerts for blocked items
                </p>
              </div>
            </div>

            <Toggle
              enabled={flaggedPurchasesEnabled}
              onToggle={() =>
                setFlaggedPurchasesEnabled((value) => !value)
              }
              label="Flagged purchases"
            />
          </div>

          {/* Allowance Reminders */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>

              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Allowance reminders
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Weekly top-up reminder
                </p>
              </div>
            </div>

            <Toggle
              enabled={allowanceRemindersEnabled}
              onToggle={() =>
                setAllowanceRemindersEnabled((value) => !value)
              }
              label="Allowance reminders"
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="mb-5 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-[#2A2740] dark:bg-[#1A1830]">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          Security
        </p>

        <div className="space-y-4">
          {/* Biometric Unlock */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1a4 4 0 00-4 4v3H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-1V5a4 4 0 00-4-4zm2 7V5a2 2 0 10-4 0v3h4z"
                  clipRule="evenodd"
                />
              </svg>

              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Biometric unlock
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Touch ID or Face ID required
                </p>
              </div>
            </div>

            <Toggle
              enabled={biometricUnlockEnabled}
              onToggle={() =>
                setBiometricUnlockEnabled((value) => !value)
              }
              label="Biometric unlock"
            />
          </div>

          {/* Parent PIN */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />

              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Parent PIN
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  4-digit PIN for parent access
                </p>
              </div>
            </div>

            <Toggle
              enabled={parentPinEnabled}
              onToggle={() =>
                setParentPinEnabled((value) => !value)
              }
              label="Parent PIN"
            />
          </div>

          {/* Spending Alerts */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>

              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Spending alerts
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Notify on unusual patterns
                </p>
              </div>
            </div>

            <Toggle
              enabled={spendingAlertsEnabled}
              onToggle={() =>
                setSpendingAlertsEnabled((value) => !value)
              }
              label="Spending alerts"
            />
          </div>

          {/* Change Password */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-[#2A2740]">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Change password
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Update your password regularly
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenChangePassword}
              className="flex-shrink-0 rounded-full border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-gray-300 dark:hover:bg-[#2A2740]"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {/* App Footer */}
      <div className="mb-5 rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-colors dark:border-[#2A2740] dark:bg-[#1A1830]">
        <div
          className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white"
          style={{
            background:
              'linear-gradient(135deg, #7C5CFC 0%, #3ED9C2 100%)',
          }}
        >
          H
        </div>

        <p className="text-base font-semibold text-gray-900 dark:text-white">
          HapoPay
        </p>

        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Version 2.4.1 · Built with love 💜
        </p>

        <div className="mt-4 flex items-center justify-center gap-3 text-xs">
          <button
            type="button"
            className="text-[#7C5CFC] transition hover:text-[#6A4CE0] dark:text-[#B39DFF] dark:hover:text-white"
          >
            Privacy Policy
          </button>

          <span className="text-gray-400 dark:text-gray-600">·</span>

          <button
            type="button"
            className="text-[#7C5CFC] transition hover:text-[#6A4CE0] dark:text-[#B39DFF] dark:hover:text-white"
          >
            Terms of Service
          </button>

          <span className="text-gray-400 dark:text-gray-600">·</span>

          <button
            type="button"
            className="text-[#7C5CFC] transition hover:text-[#6A4CE0] dark:text-[#B39DFF] dark:hover:text-white"
          >
            Support
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:bg-[#3B1A16] dark:text-[#F97316] dark:hover:bg-[#F97316]/10"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>

        Sign Out
      </button>

      {/* Delete Account */}
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="text-xs text-gray-500 transition hover:text-red-600 dark:hover:text-gray-300"
        >
          Delete account
        </button>
      </div>
    </div>
  );
}
 
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
        <div className="min-h-screen bg-white text-gray-900 dark:bg-[#0D0B1A] dark:text-white transition-colors duration-200">
          <DashboardTopbar
            title="Parent Dashboard"
            onToggleNotifications={() => setShowNotifications((value) => !value)}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            onToggleMode={handleToggleMode}
          />
 
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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-lg dark:border-[#2A2740] dark:bg-[#1A1830]">
      <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
        Edit Profile
      </h2>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Full Name
          </label>
          <input
            type="text"
            defaultValue={parentData.name}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Email Address
          </label>
          <input
            type="email"
            defaultValue={parentData.email}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
            Phone Number
          </label>
          <input
            type="tel"
            defaultValue="+27 71 234 5678"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={closeEditProfileModal}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-[#2A2740] dark:text-gray-300 dark:hover:bg-[#2A2740]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSaveProfileChanges}
          className="flex-1 rounded-lg bg-[#7C5CFC] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#6A4CE0]"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}

{/* Change Password Modal */}
{showChangePasswordModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-lg dark:border-[#2A2740] dark:bg-[#1A1830]">
      <h2 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
        Change Password
      </h2>

      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Enter your current and new password
      </p>

      {passwordError && (
        <div className="mb-4 rounded-lg border border-orange-500/30 bg-orange-50 p-3 dark:bg-[#3B1A16]">
          <p className="text-sm text-orange-600 dark:text-[#F97316]">
            {passwordError}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
            Current Password
          </label>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
            New Password
          </label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 8 characters)"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
            Confirm New Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] dark:border-[#2A2740] dark:bg-[#0D0B1A] dark:text-white"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={handleCloseChangePassword}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-[#2A2740] dark:text-gray-300 dark:hover:bg-[#2A2740]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSaveNewPassword}
          className="flex-1 rounded-lg bg-[#7C5CFC] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#6A4CE0]"
        >
          Update Password
        </button>
      </div>
    </div>
  </div>
)}

{/* Delete Account Confirmation Modal */}
{showDeleteAccountModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-lg dark:border-[#2A2740] dark:bg-[#1A1830]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-[#F97316]/15">
          <span className="text-xl text-orange-600 dark:text-[#F97316]">
            ⚠️
          </span>
        </div>

        <h2 className="text-2xl font-bold text-red-600 dark:text-[#F97316]">
          Delete Account?
        </h2>
      </div>

      <div className="mb-4 rounded-lg border border-orange-500/30 bg-orange-50 p-4 dark:bg-[#3B1A16]">
        <p className="mb-2 text-sm font-medium text-orange-700 dark:text-[#F97316]">
          This action cannot be undone.
        </p>

        <p className="text-sm text-orange-600 dark:text-[#F97316]/90">
          Deleting your account will:
        </p>

        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-orange-600 dark:text-[#F97316]/90">
          <li>Permanently delete your profile</li>
          <li>Delete all linked children accounts</li>
          <li>Clear all transaction history</li>
        </ul>
      </div>

      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Are you sure you want to proceed? This action cannot be undone.
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowDeleteAccountModal(false)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-[#2A2740] dark:text-gray-300 dark:hover:bg-[#2A2740]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleConfirmDeleteAccount}
          className="flex-1 rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#B91C1C]"
        >
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
 