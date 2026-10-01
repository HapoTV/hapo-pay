import React, { useState } from 'react';
import { MoonStar } from 'lucide-react';
import { authApi } from '@/api/client';
import { useTheme } from '@/context/ThemeContext';
import type { ParentUser } from '@/types/parent';

interface ParentProfileSectionProps {
  parentData: ParentUser;
  onLogout: () => void;
}

export const ParentProfileSection: React.FC<ParentProfileSectionProps> = ({
  parentData,
  onLogout,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [appNotificationsEnabled, setAppNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const closePasswordDialog = () => {
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordError('Enter your current password and a new password.');
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

    setIsSavingPassword(true);
    setPasswordError('');
    try {
      await authApi.changePassword({
        old_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setPasswordUpdated(true);
      closePasswordDialog();
    } catch {
      setPasswordError('Unable to change password. Check your current password and try again.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="pb-16 px-4 py-6 md:pb-0 md:px-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="mt-2 text-sm text-slate-500">View your account information and parent details.</p>
        </div>
        <p className="text-sm text-slate-500">Manage your profile and security preferences in one place.</p>
      </div>

      <div className="mb-5 rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 text-lg font-bold text-white">
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
        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
              <p className="text-sm text-slate-500">Your HapoPay parent profile details.</p>
            </div>
            <button type="button" disabled className="cursor-not-allowed rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400" title="Profile editing is not yet available">
              Unavailable
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
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Appearance</p>
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#2A2740] dark:bg-[#0D0B1A]">
            <div className="flex items-center gap-3">
              <MoonStar className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Dark mode</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Currently using {theme} theme</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label="Dark mode"
              onClick={toggleTheme}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-violet-600' : 'bg-slate-300'}`}
            >
              <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
              <p className="text-sm text-slate-500">Manage your alert preferences.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-3xl border border-slate-200 p-3">
              <div>
                <p className="font-medium text-slate-900">App notifications</p>
                <p className="text-xs text-slate-500">Spending alerts and updates.</p>
              </div>
              <button type="button" aria-pressed={appNotificationsEnabled} onClick={() => setAppNotificationsEnabled((enabled) => !enabled)} className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium transition ${appNotificationsEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {appNotificationsEnabled ? 'On' : 'Off'}
              </button>
            </div>
            <div className="flex items-center justify-between rounded-3xl border border-slate-200 p-3">
              <div>
                <p className="font-medium text-slate-900">Email notifications</p>
                <p className="text-xs text-slate-500">Weekly summaries and account alerts.</p>
              </div>
              <button type="button" aria-pressed={emailNotificationsEnabled} onClick={() => setEmailNotificationsEnabled((enabled) => !enabled)} className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium transition ${emailNotificationsEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {emailNotificationsEnabled ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Security</h2>
          <div className="space-y-3">
            <div className="flex flex-col gap-2 rounded-3xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-slate-900">Change password</p>
                <p className="text-xs text-slate-500">Update your password regularly.</p>
              </div>
              <button type="button" onClick={() => { setPasswordUpdated(false); setPasswordError(''); setShowChangePassword(true); }} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                Change password
              </button>
            </div>
            <div className="flex flex-col gap-2 rounded-3xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-slate-900">Two-factor authentication</p>
                <p className="text-xs text-slate-500">Require a second verification step when signing in.</p>
              </div>
              <button type="button" disabled className="cursor-not-allowed rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-400" title="Two-factor authentication is not yet available">
                Unavailable
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-400/40 dark:bg-[#1A1830]">
          <h2 className="mb-4 text-lg font-semibold text-red-900 dark:text-red-300">Danger zone</h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
            <button type="button" onClick={onLogout} className="w-full min-w-[120px] rounded-3xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-400/50 dark:bg-[#2B1C2A] dark:text-red-200 dark:hover:bg-[#352132] sm:w-auto sm:min-w-[130px]">
              Logout
            </button>
            <button type="button" disabled className="w-full min-w-[120px] cursor-not-allowed rounded-3xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-400 dark:border-red-400/50 dark:bg-[#2B1C2A] sm:w-auto sm:min-w-[130px]" title="Account deletion is not yet available">
              Delete account unavailable
            </button>
          </div>
        </section>
      </div>

      {passwordUpdated && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Password updated successfully.</p>}

      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="change-password-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 id="change-password-title" className="mb-1 text-2xl font-bold text-slate-900">Change Password</h2>
            <p className="mb-6 text-sm text-slate-500">Enter your current and new password.</p>
            {passwordError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{passwordError}</p>}
            <div className="space-y-4">
              <div>
                <label htmlFor="current-password" className="mb-2 block text-sm font-medium text-slate-900">Current Password</label>
                <input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
              <div>
                <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-slate-900">New Password</label>
                <input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
              <div>
                <label htmlFor="confirm-new-password" className="mb-2 block text-sm font-medium text-slate-900">Confirm New Password</label>
                <input id="confirm-new-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={closePasswordDialog} className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={handleChangePassword} disabled={isSavingPassword} className="flex-1 rounded-lg bg-pink-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60">
                {isSavingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
