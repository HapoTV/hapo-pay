import React, { useState } from 'react';
import {
    Moon,
    Bell,
    ShieldCheck,
    Fingerprint,
    KeyRound,
    Lock,
    Eye,
    EyeOff,
    LogOut,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Heart,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

interface Props {
    studentData: { name: string; currency: string; balance: number };
    onLogout: () => void;
    onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void> | void;
    onContactParent?: () => void;
}

const ToggleRow: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    checked: boolean;
    onChange: () => void;
}> = ({ icon, title, subtitle, checked, onChange }) => (
    <div className="flex items-center justify-between py-3">
        <div className="flex items-start gap-3">
            <span className="text-slate-400 mt-0.5">{icon}</span>
            <div>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
        </div>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${checked ? 'bg-violet-500' : 'bg-slate-700'}`}
        >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

const StudentProfile: React.FC<Props> = ({ studentData, onLogout, onChangePassword, onContactParent }) => {
    const { theme, setTheme } = useTheme();
    const darkMode = theme === 'dark';

    const [transactionAlerts, setTransactionAlerts] = useState(true);
    const [flaggedPurchases, setFlaggedPurchases] = useState(true);
    const [allowanceReminders, setAllowanceReminders] = useState(false);

    const [biometricUnlock, setBiometricUnlock] = useState(true);
    const [parentPin, setParentPin] = useState(true);
    const [spendingAlerts, setSpendingAlerts] = useState(true);

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess(false);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('Please fill in all fields.');
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }
        if (newPassword === currentPassword) {
            setPasswordError('New password must be different from your current password.');
            return;
        }

        try {
            setIsSubmitting(true);
            await onChangePassword?.(currentPassword, newPassword);
            setPasswordSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            setPasswordError('Could not update password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pb-24 max-w-7xl mx-auto px-4 py-5 space-y-5 bg-slate-950 min-h-screen">
            <div className="rounded-3xl p-4 shadow-sm bg-slate-900 border border-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0">
                    👨‍👩‍👧
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{studentData.name}'s Family</p>
                    <p className="text-xs text-slate-400">2 children · Premium plan</p>
                </div>
                <span className="text-xs font-bold text-white bg-gradient-to-r from-violet-500 to-indigo-500 px-3 py-1 rounded-full flex-shrink-0">
                    PRO
                </span>
            </div>

            <div className="rounded-3xl p-5 shadow-sm bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Appearance</p>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Moon className="w-4 h-4 text-violet-400" />
                        <span className="text-sm font-medium text-white">Dark Mode</span>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={darkMode}
                        onClick={() => setTheme(darkMode ? 'light' : 'dark')}
                        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${darkMode ? 'bg-violet-500' : 'bg-slate-700'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setTheme('dark')}
                        className={`rounded-2xl py-4 flex flex-col items-center gap-2 border transition ${darkMode ? 'border-violet-500 bg-violet-950/40' : 'border-slate-800 bg-slate-900'}`}
                    >
                        <Moon className={`w-4 h-4 ${darkMode ? 'text-violet-400' : 'text-slate-500'}`} />
                        <span className={`text-xs font-medium ${darkMode ? 'text-violet-300' : 'text-slate-500'}`}>Dark</span>
                    </button>
                    <button
                        onClick={() => setTheme('light')}
                        className={`rounded-2xl py-4 flex flex-col items-center gap-2 border transition ${!darkMode ? 'border-violet-500 bg-violet-950/40' : 'border-slate-800 bg-slate-900'}`}
                    >
                        <span className={`w-4 h-4 rounded-full ${!darkMode ? 'bg-violet-400' : 'bg-slate-600'}`} />
                        <span className={`text-xs font-medium ${!darkMode ? 'text-violet-300' : 'text-slate-500'}`}>Light</span>
                    </button>
                </div>
            </div>

            <div className="rounded-3xl p-5 shadow-sm bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Notifications</p>
                <div className="divide-y divide-slate-800">
                    <ToggleRow
                        icon={<Bell className="w-4 h-4" />}
                        title="Transaction alerts"
                        subtitle="Get notified on every purchase"
                        checked={transactionAlerts}
                        onChange={() => setTransactionAlerts(v => !v)}
                    />
                    <ToggleRow
                        icon={<ShieldCheck className="w-4 h-4" />}
                        title="Flagged purchases"
                        subtitle="Immediate alerts for blocked items"
                        checked={flaggedPurchases}
                        onChange={() => setFlaggedPurchases(v => !v)}
                    />
                    <ToggleRow
                        icon={<Bell className="w-4 h-4" />}
                        title="Allowance reminders"
                        subtitle="Weekly top-up reminder"
                        checked={allowanceReminders}
                        onChange={() => setAllowanceReminders(v => !v)}
                    />
                </div>
            </div>

            <div className="rounded-3xl p-5 shadow-sm bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Security</p>
                <div className="divide-y divide-slate-800">
                    <ToggleRow
                        icon={<Fingerprint className="w-4 h-4" />}
                        title="Biometric unlock"
                        subtitle="Touch ID or Face ID required"
                        checked={biometricUnlock}
                        onChange={() => setBiometricUnlock(v => !v)}
                    />
                    <ToggleRow
                        icon={<KeyRound className="w-4 h-4" />}
                        title="Parent PIN"
                        subtitle="4-digit PIN for parent access"
                        checked={parentPin}
                        onChange={() => setParentPin(v => !v)}
                    />
                    <ToggleRow
                        icon={<Bell className="w-4 h-4" />}
                        title="Spending alerts"
                        subtitle="Notify on unusual patterns"
                        checked={spendingAlerts}
                        onChange={() => setSpendingAlerts(v => !v)}
                    />
                </div>

                <button
                    onClick={() => setShowPasswordForm(v => !v)}
                    className="w-full flex items-center justify-between py-3 border-t border-slate-800 mt-1"
                >
                    <div className="flex items-center gap-3">
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-white">Change Password</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${showPasswordForm ? 'rotate-90' : ''}`} />
                </button>

                {showPasswordForm && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-2">
                        <div className="relative">
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Current password"
                                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                            <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New password (min 8 characters)"
                                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                            <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                            <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {passwordError && (
                            <div className="flex items-center gap-2 bg-rose-950/40 text-rose-400 rounded-2xl p-3 text-xs">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{passwordError}</span>
                            </div>
                        )}
                        {passwordSuccess && (
                            <div className="flex items-center gap-2 bg-emerald-950/40 text-emerald-400 rounded-2xl p-3 text-xs">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                <span>Your password has been updated.</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold py-3 rounded-2xl transition disabled:opacity-60"
                        >
                            {isSubmitting ? 'Updating…' : 'Update Password'}
                        </button>
                    </form>
                )}
            </div>

            {onContactParent && (
                <button
                    onClick={onContactParent}
                    className="w-full rounded-3xl p-4 shadow-sm bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                    <span className="text-sm font-medium text-white">Message Parent</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
            )}

            <div className="rounded-3xl p-6 shadow-sm bg-slate-900 border border-slate-800 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-violet-600 flex items-center justify-center text-white font-bold text-lg mb-3">
                    H
                </div>
                <p className="text-sm font-semibold text-white">HapoPay</p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    Version 2.4.1 · Built with love <Heart className="w-3 h-3 fill-violet-400 text-violet-400" />
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs text-violet-400">
                    <button className="hover:text-violet-300">Privacy Policy</button>
                    <span className="text-slate-700">·</span>
                    <button className="hover:text-violet-300">Terms of Service</button>
                    <span className="text-slate-700">·</span>
                    <button className="hover:text-violet-300">Support</button>
                </div>
            </div>

            <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 border border-orange-500/50 text-orange-400 py-3 rounded-2xl font-semibold hover:bg-orange-950/30 transition"
            >
                <LogOut className="w-4 h-4" />
                Sign Out
            </button>
        </div>
    );
};

export default StudentProfile;