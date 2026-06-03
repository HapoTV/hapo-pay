import React, { useState } from 'react';

export const SettingsPage: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const settingSections = [
    {
      id: 'account',
      title: 'Account Settings',
      items: [
        { label: 'Full Name', value: 'Olwethu Madubela', editable: true },
        { label: 'Email Address', value: 'olwethu.madubela.hapo@gmail.com', editable: true },
        { label: 'Phone Number', value: '+27 (0) 123 456 7890', editable: true },
      ],
    },
  ];

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-b-3xl mb-6">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-pink-100">Manage your account and preferences</p>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Account Settings */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Account Settings</h3>
          <div className="space-y-4">
            {settingSections[0].items.map((item, index) => (
              <div key={index} className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-600">{item.label}</p>
                  <p className="text-gray-900 font-medium">{item.value}</p>
                </div>
                {item.editable && (
                  <button className="text-pink-500 hover:text-pink-600 font-medium text-sm">
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Security</h3>
          <div className="space-y-4">
            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <button
                onClick={() => setTwoFactor(!twoFactor)}
                className={`relative inline-flex h-6 w-11 rounded-full ${
                  twoFactor ? 'bg-green-500' : 'bg-gray-300'
                } transition`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    twoFactor ? 'translate-x-6' : 'translate-x-1'
                  } mt-1`}
                />
              </button>
            </div>

            {/* Change Password */}
            <button className="w-full text-left py-3 text-pink-500 hover:text-pink-600 font-medium flex items-center justify-between">
              Change Password
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-4">
            {/* Push Notifications */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Spending alerts and updates</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 rounded-full ${
                  notifications ? 'bg-green-500' : 'bg-gray-300'
                } transition`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  } mt-1`}
                />
              </button>
            </div>

            {/* Email Alerts */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Alerts</p>
                <p className="text-sm text-gray-600">Weekly reports and summaries</p>
              </div>
              <button
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`relative inline-flex h-6 w-11 rounded-full ${
                  emailAlerts ? 'bg-green-500' : 'bg-gray-300'
                } transition`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    emailAlerts ? 'translate-x-6' : 'translate-x-1'
                  } mt-1`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Spending Limits */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Spending Limits</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Set daily/weekly spending limits for your children</p>
            <button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-medium transition">
              Configure Limits
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-red-900 mb-4">Danger Zone</h3>
          <div className="space-y-3">
            <button className="w-full bg-red-100 hover:bg-red-200 text-red-900 py-2 rounded-lg font-medium transition">
              Logout
            </button>
            <button className="w-full bg-red-100 hover:bg-red-200 text-red-900 py-2 rounded-lg font-medium transition">
              Delete Account
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 text-gray-600 text-sm">
          <p>HapoPay v1.0.0</p>
          <p className="mt-2">© 2024 HapoPay. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};