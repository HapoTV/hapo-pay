import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  BalanceCard,
  QuickActions,
  RechargeSection,
  ChildrenSection,
  SafetyAlerts,
  BottomNavigation,
} from '../components';

// Mock data for development
const mockParentData = {
  name: 'Olwethu Madubela',
  email: 'olwethu.madubela.hapo@gmail.com',
  familyBalance: 500.00,
  monthlySpending: 150.00,
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

type TabType = 'home' | 'wallet' | 'pay' | 'rewards' | 'settings';

export const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [parentData] = useState(mockParentData);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchNotice, setShowSearchNotice] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  // Quick Actions
  const quickActions = [
    {
      id: '1',
      title: 'Emergency Fund Transfer',
      icon: (
        <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
      onClick: () => alert('Emergency Fund Transfer - Coming Soon'),
    },
    {
      id: '2',
      title: 'Recurring Auto Payments',
      icon: (
        <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      ),
      onClick: () => alert('Recurring Auto Payments - Coming Soon'),
    },
    {
      id: '3',
      title: 'Wallet Top-up',
      icon: (
        <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      ),
      onClick: () => alert('Wallet Top-up - Coming Soon'),
    },
    {
      id: '4',
      title: 'Manage Spending Limits',
      icon: (
        <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 108 12H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381zM10 9.573L5.823 15H10a1 1 0 001-1V9.573zM12 2.427l.823 6H8a1 1 0 00-1 1v3.854l5.823-8.427z" clipRule="evenodd" />
        </svg>
      ),
      onClick: () => alert('Manage Spending Limits - Coming Soon'),
    },
  ];

  // Recharge Items
  const rechargeItems = [
    {
      id: '1',
      title: 'Airtime',
      icon: (
        <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
      onClick: () => alert('Airtime - Coming Soon'),
    },
    {
      id: '2',
      title: 'Data',
      icon: (
        <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a1 1 0 00-.894.553L.618 9.18a1 1 0 000 1.64l2.488 5.627A1 1 0 004 17h12a1 1 0 00.894-.553l2.488-5.627a1 1 0 000-1.64L16.894 3.553A1 1 0 0016 3H4zm7.5 2a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-2 5a1 1 0 11-2 0 1 1 0 012 0zm3-2a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
      ),
      onClick: () => alert('Data - Coming Soon'),
    },
    {
      id: '3',
      title: 'Electricity',
      icon: (
        <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ),
      onClick: () => alert('Electricity - Coming Soon'),
    },
    {
      id: '4',
      title: 'TV',
      icon: (
        <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" />
        </svg>
      ),
      onClick: () => alert('TV - Coming Soon'),
    },
  ];

  // Bottom Navigation Items
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      isActive: currentTab === 'home',
      onClick: () => setCurrentTab('home'),
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      id: 'wallet',
      label: 'Wallet',
      isActive: currentTab === 'wallet',
      onClick: () => setCurrentTab('wallet'),
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      ),
    },
    {
      id: 'pay',
      label: 'Pay',
      isActive: currentTab === 'pay',
      onClick: () => setCurrentTab('pay'),
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      id: 'rewards',
      label: 'Rewards',
      isActive: currentTab === 'rewards',
      onClick: () => setCurrentTab('rewards'),
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      isActive: currentTab === 'settings',
      onClick: () => setCurrentTab('settings'),
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <div className="pb-20 md:pb-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-b-3xl mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">Parent Dashboard</h1>
                  <p className="text-pink-100">Your family spending hub</p>
                </div>
                <button className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.5 1.5H5.75C4.23122 1.5 3 2.73122 3 4.25V15.25C3 16.7688 4.23122 18 5.75 18H14.25C15.7688 18 17 16.7688 17 15.25V10.5M6.5 5.5H13.5M6.5 9.5H13.5M6.5 13.5H10.5M15.5 3V7.5M13.25 5.75H17.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
              {/* Balance Cards */}
              <BalanceCard
                familyBalance={parentData.familyBalance}
                monthlySpending={parentData.monthlySpending}
                currency={parentData.currency}
                onAddMoney={() => alert('Add Money - Coming Soon')}
              />

              {/* Quick Actions */}
              <QuickActions actions={quickActions} />

              {/* Recharge Section */}
              <RechargeSection items={rechargeItems} />

              {/* Children Section */}
              <ChildrenSection
                children={parentData.children}
                onAddChild={() => alert('Add Child - Coming Soon')}
                onChildClick={(child) => alert(`Manage ${child.name} - Coming Soon`)}
              />

              {/* Safety Alerts */}
              <SafetyAlerts
                message="All spending within normal patterns"
                type="success"
                onSettings={() => alert('Safety Settings - Coming Soon')}
              />
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="pb-20 md:pb-0 max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">Wallet</h2>
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-gray-600">Wallet feature coming soon</p>
            </div>
          </div>
        );

      case 'pay':
        return (
          <div className="pb-20 md:pb-0 max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">Pay</h2>
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-gray-600">Pay feature coming soon</p>
            </div>
          </div>
        );

      case 'rewards':
        return (
          <div className="pb-20 md:pb-0 max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">Rewards</h2>
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-gray-600">Rewards feature coming soon</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="pb-20 md:pb-0 max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-gray-600">Settings feature coming soon</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left - Profile Icon */}
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition"
            title="Profile"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Center - Brand Logo and Title */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
              <span className="text-sm font-bold">H</span>
            </div>
            <span className="text-xl font-black">HapoPay</span>
          </div>

          {/* Right - Search, Notifications, and Logout */}
          <div className="flex items-center gap-4">
            {/* Search Icon */}
            <button
              onClick={() => setShowSearchNotice(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition"
              title="Search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Notifications Icon */}
            <button
              onClick={() => setShowNotifications((current) => !current)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition"
              title="Notifications"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-bold transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Profile Dropdown Menu */}
        {showProfileMenu && (
          <div className="absolute top-full left-6 mt-2 bg-white text-gray-900 rounded-lg shadow-xl p-3 w-48 z-50">
            <div className="border-b pb-3 mb-3">
              <p className="font-bold">{parentData.name}</p>
            </div>
          </div>
        )}
      </nav>

      {showSearchNotice && (
        <section className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Search</h2>
                <p className="mt-1 text-sm text-gray-500">Search functionality coming soon! You will be able to search for transactions, children, and more.</p>
              </div>
              <button
                onClick={() => setShowSearchNotice(false)}
                className="inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-900"
              >
                OK
              </button>
            </div>
          </div>
        </section>
      )}

      {showNotifications && (
        <section className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
                <p className="mt-1 text-sm text-gray-500">Money requests from your children</p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-dashed border-gray-200 bg-gray-50 py-14 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
                <svg className="h-10 w-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </div>
              <h3 className="mt-8 text-xl font-semibold text-gray-900">No pending notifications</h3>
              <p className="mt-2 text-sm text-gray-500">All requests have been processed</p>
            </div>
          </div>
        </section>
      )}

      {renderContent()}
      <BottomNavigation items={navItems} />
    </div>
  );
};