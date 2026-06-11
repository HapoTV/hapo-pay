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
  EmergencyFundModal,
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

import { WalletPage } from './Wallet';
import { RewardsPage } from './Rewards';
// Mock data for development
const mockParentData = {
  id: 'parent-1',
  name: 'Olwethu Madubela',
  email: 'olwethu.madubela.hapo@gmail.com',
  familyBalance: 500.0,
  monthlySpending: 150.0,
  savings: 1250.0,
  currency: 'R',
  children: [
    {
      id: '1',
      name: 'Thabo Madubela',
      email: 'thabo@hapo.com',
      spendLimit: 500,
      currentSpending: 250,
      avatar: undefined,
    },
    {
      id: '2',
      name: 'Nomsa Madubela',
      email: 'nomsa@hapo.com',
      spendLimit: 450,
      currentSpending: 180,
      avatar: undefined,
    },
  ],
};

// Mock contacts for airtime/data
const mockContacts = [
  { id: '1', number: '+27 71 234 5678', name: 'Thabo', network: 'Vodacom' },
  { id: '2', number: '+27 82 345 6789', name: 'Nomsa', network: 'MTN' },
  { id: '3', number: '+27 73 456 7890', name: 'Brother', network: 'Cell C' },
];

// Mock history for airtime/data purchases
const mockAirtimeHistory = [
  { id: '1', number: '+27 71 234 5678', type: 'Airtime', amount: 50, date: '2025-01-15', status: 'Success' },
  { id: '2', number: '+27 82 345 6789', type: 'Data', amount: 30, date: '2025-01-12', status: 'Success' },
  { id: '3', number: '+27 73 456 7890', type: 'Airtime', amount: 100, date: '2025-01-10', status: 'Success' },
  { id: '4', number: '+27 71 234 5678', type: 'Data', amount: 20, date: '2025-01-08', status: 'Success' },
];

const mockElectricityHistory = [
  { id: '1', meterName: 'Home', meterNumber: '1234567890', amount: 500, date: '2025-01-18', status: 'Success' },
  { id: '2', meterName: 'Home', meterNumber: '1234567890', amount: 300, date: '2025-01-14', status: 'Success' },
  { id: '3', meterName: 'Home', meterNumber: '1234567890', amount: 250, date: '2025-01-10', status: 'Success' },
  { id: '4', meterName: 'Home', meterNumber: '1234567890', amount: 400, date: '2025-01-05', status: 'Success' },
];

const mockQrPayments = [
  { id: '1', merchant: 'GoodFood Cafe', amount: 120, date: 'Today', status: 'Paid' },
  { id: '2', merchant: 'Market Express', amount: 85, date: 'Yesterday', status: 'Paid' },
  { id: '3', merchant: 'Bookstore', amount: 210, date: '2 days ago', status: 'Paid' },
];

const dataBundlesByNetwork: Record<string, { id: string; label: string }[]> = {
  Vodacom: [
    { id: 'vodacom-100mb', label: '100MB' },
    { id: 'vodacom-250mb', label: '250MB' },
    { id: 'vodacom-500mb', label: '500MB' },
    { id: 'vodacom-1gb', label: '1GB' },
  ],
  MTN: [
    { id: 'mtn-150mb', label: '150MB' },
    { id: 'mtn-500mb', label: '500MB' },
    { id: 'mtn-1gb', label: '1GB' },
    { id: 'mtn-2gb', label: '2GB' },
  ],
  'Cell C': [
    { id: 'cellc-100mb', label: '100MB' },
    { id: 'cellc-300mb', label: '300MB' },
    { id: 'cellc-1gb', label: '1GB' },
  ],
  'Telkom Mobile': [
    { id: 'telkom-100mb', label: '100MB' },
    { id: 'telkom-400mb', label: '400MB' },
    { id: 'telkom-1-5gb', label: '1.5GB' },
  ],
};

type TabType = 'home' | 'payments' | 'wallet' | 'pay' | 'rewards' | 'settings';

export const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [parentData, setParentData] = useState(mockParentData);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchNotice, setShowSearchNotice] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [emergencyAmount, setEmergencyAmount] = useState('');
  const [showWalletTopupModal, setShowWalletTopupModal] = useState(false);
  const [topupChildId, setTopupChildId] = useState('');
  const [topupAmount, setTopupAmount] = useState('');
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showRecurringFormModal, setShowRecurringFormModal] = useState(false);
  const [showManageLimitsModal, setShowManageLimitsModal] = useState(false);
  const [transferSource, setTransferSource] = useState<'family' | 'savings'>('family');
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

  // Airtime/Electricity Confirmation states
  const [showAirtimeConfirmation, setShowAirtimeConfirmation] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const closeEmergencyModal = () => {
    setShowEmergencyModal(false);
    setSelectedChildId('');
    setEmergencyAmount('');
  };

  const handleSendEmergencyFunds = () => {
    const amountValue = Number(emergencyAmount);
    if (!selectedChildId || !amountValue || amountValue <= 0) return;
    const child = parentData.children.find((c) => c.id === selectedChildId);
    alert(`Send R${amountValue.toFixed(2)} to ${child?.name || 'selected child'} as an emergency transfer.`);
    closeEmergencyModal();
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

  // Quick Actions
  const quickActionsAll = [
    {
      id: '1',
      title: 'Emergency Fund Transfer',
      icon: <HomeIcon className="w-6 h-6 text-rose-500" />,
      onClick: () => {
        setSelectedChildId('');
        setEmergencyAmount('');
        setShowEmergencyModal(true);
      },
    },
    {
      id: '2',
      title: 'Recurring Auto Payments',
      icon: <RefreshIcon className="w-6 h-6 text-rose-500" />,
      onClick: () => setShowRecurringModal(true),
    },
    {
      id: '3',
      title: 'Wallet Top-up',
      icon: <WalletIcon className="w-6 h-6 text-rose-500" />,
      onClick: () => {
        setTopupChildId('');
        setTopupAmount('');
        setShowWalletTopupModal(true);
      },
    },
    {
      id: '4',
      title: 'Manage Spending Limits',
      icon: <ShieldIcon className="w-6 h-6 text-rose-500" />,
      onClick: () => {
        setShowManageLimitsModal(true);
      },
    },
  ];

  const quickActions = [quickActionsAll[0], quickActionsAll[2]];

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
      onClick: () => alert('TV - Coming Soon'),
    },
  ];

  // Bottom Navigation Items
  const navItems = [
    { id: 'home', label: 'Home', isActive: currentTab === 'home', onClick: () => setCurrentTab('home'), icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'payments', label: 'Transfer', isActive: currentTab === 'payments', onClick: () => setCurrentTab('payments'), icon: <TransferIcon className="w-5 h-5" /> },
    { id: 'wallet', label: 'Wallet', isActive: currentTab === 'wallet', onClick: () => setCurrentTab('wallet'), icon: <WalletIcon className="w-5 h-5" /> },
    { id: 'pay', label: 'Pay', isActive: currentTab === 'pay', onClick: () => setCurrentTab('pay'), icon: <PlayIcon className="w-5 h-5" /> },
    { id: 'rewards', label: 'Rewards', isActive: currentTab === 'rewards', onClick: () => setCurrentTab('rewards'), icon: <StarIcon className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', isActive: currentTab === 'settings', onClick: () => setCurrentTab('settings'), icon: <CogIcon className="w-5 h-5" /> },
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
          <div className="pb-20 md:pb-0 max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-slate-600">Settings feature coming soon</p>
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

          {/* Modals: Emergency, Wallet Topup, Recurring, Manage limits, Add Money */}

                    <EmergencyFundModal
            open={showEmergencyModal}
            onClose={closeEmergencyModal}
            children={parentData.children}
            selectedChildId={selectedChildId}
            onSelectChild={setSelectedChildId}
            emergencyAmount={emergencyAmount}
            onChangeAmount={setEmergencyAmount}
            onSend={handleSendEmergencyFunds}
          />

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

        </div>
      )}
    </>
  );
};
