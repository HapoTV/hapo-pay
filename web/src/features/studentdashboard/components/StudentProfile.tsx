import React, { useState } from 'react';
import {
    User,
    Users,
    ShieldCheck,
    Settings2,
    Lock,
    Eye,
    EyeOff,
    Bell,
    MessageCircle,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';

interface Props {
    studentData: { name: string; currency: string; balance: number };
    onLogout: () => void;
    onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void> | void;
    onContactParent?: () => void;
}

const StudentProfile: React.FC<Props> = ({ studentData, onLogout, onChangePassword, onContactParent }) => {
    // Change password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Notification preferences state
    const [spendingAlerts, setSpendingAlerts] = useState(true);
    const [lowBalanceAlerts, setLowBalanceAlerts] = useState(true);

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
        <div className="pb-20 md:pb-0 max-w-7xl mx-auto px-4 py-5 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-500">Profile</p>
                    <h1 className="mt-2 text-xl font-semibold text-slate-950">My Profile</h1>
                </div>
                <p className="text-xs text-slate-500">View your account information and student details.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {studentData.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-950 text-base">{studentData.name}</p>
                        <p className="text-slate-500 text-sm">Student Account • <span className="text-emerald-600 font-semibold">Active</span></p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-rose-500">
                        <User className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-950">Personal Information</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    <div>
                        <p className="text-slate-500 text-xs mb-2">Full Name</p>
                        <input type="text" value={studentData.name} disabled className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-700 text-sm" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs mb-2">Username</p>
                        <input type="text" value="student@hapo.com" disabled className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-700 text-sm" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs mb-2">Account Email</p>
                        <input type="email" value="student@hapo.com" disabled className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-700 text-sm" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs mb-2">Password</p>
                        <input type="password" value="••••••••" disabled className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-700 text-sm" />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div>
                        <p className="text-slate-500 text-xs mb-2">Account Status</p>
                        <div className="bg-emerald-100 text-emerald-700 rounded-2xl p-3 text-center font-semibold text-sm">
                            Active
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs mb-2">Account Created</p>
                        <input type="text" value="Date" disabled className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-700 text-sm" />
                    </div>
                </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-rose-500">
                        <Lock className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-950">Change Password</h2>
                        <p className="text-slate-500 text-xs">Update the password you use to log in.</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label htmlFor="currentPassword" className="text-slate-500 text-xs mb-2 block">Current Password</label>
                            <div className="relative">
                                <input
                                    id="currentPassword"
                                    type={showCurrent ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    className="w-full bg-white border border-slate-200 rounded-2xl p-3 pr-11 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    aria-label={showCurrent ? 'Hide password' : 'Show password'}
                                >
                                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="text-slate-500 text-xs mb-2 block">New Password</label>
                            <div className="relative">
                                <input
                                    id="newPassword"
                                    type={showNew ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="At least 8 characters"
                                    className="w-full bg-white border border-slate-200 rounded-2xl p-3 pr-11 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    aria-label={showNew ? 'Hide password' : 'Show password'}
                                >
                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="text-slate-500 text-xs mb-2 block">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                    className="w-full bg-white border border-slate-200 rounded-2xl p-3 pr-11 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {passwordError && (
                        <div className="flex items-center gap-2 bg-rose-50 text-rose-600 rounded-2xl p-3 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{passwordError}</span>
                        </div>
                    )}
                    {passwordSuccess && (
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-2xl p-3 text-sm">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span>Your password has been updated.</span>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-rose-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Updating…' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-rose-500">
                        <Bell className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-950">Notification Preferences</h2>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-3">
                        <div>
                            <p className="text-slate-950 text-sm font-medium">Spending Alerts</p>
                            <p className="text-slate-500 text-xs">Get notified every time you spend.</p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={spendingAlerts}
                            onClick={() => setSpendingAlerts((v) => !v)}
                            className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${spendingAlerts ? 'bg-rose-500' : 'bg-slate-300'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${spendingAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-3">
                        <div>
                            <p className="text-slate-950 text-sm font-medium">Low Balance Alerts</p>
                            <p className="text-slate-500 text-xs">Get notified when your balance is running low.</p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={lowBalanceAlerts}
                            onClick={() => setLowBalanceAlerts((v) => !v)}
                            className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${lowBalanceAlerts ? 'bg-rose-500' : 'bg-slate-300'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${lowBalanceAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-rose-500">
                        <Users className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-950">Parent Information</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    <div>
                        <p className="text-slate-500 text-xs mb-2">Parent's Full Name</p>
                        <input type="text" value="Parent Name" disabled className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-700 text-sm" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs mb-2">Emergency Contact</p>
                        <input type="text" value="Phone Number" disabled className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-700 text-sm" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs mb-2">Parent's Email</p>
                        <input type="email" value="parent@email.com" disabled className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-700 text-sm" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs mb-2">Relationship</p>
                        <input type="text" value="Parent/Guardian" disabled className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-700 text-sm" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-rose-500">
                        <Settings2 className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-950">Account Settings</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <p className="text-slate-500 text-xs mb-2">Weekly Spending Limit</p>
                        <input type="text" value="R100.00" disabled className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-700 text-sm" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs mb-2">Daily Spending Limit</p>
                        <input type="text" value="R20.00" disabled className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-700 text-sm" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs mb-2">Current Balance</p>
                        <input type="text" value={`R${studentData.balance}.00`} disabled className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-700 text-sm font-semibold" />
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-rose-500">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-950 text-base mb-2">Account Security</h3>
                        <p className="text-slate-500 text-sm mb-3">
                            You can update your password above. For changes to your spending limits or personal details, please contact your parent/guardian.
                        </p>
                        {onContactParent && (
                            <button
                                onClick={onContactParent}
                                className="inline-flex items-center gap-2 text-rose-500 font-semibold text-sm hover:text-rose-600 transition"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Message Parent
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={onLogout}
                className="w-full bg-rose-500 text-white py-3 rounded-full font-semibold hover:bg-rose-600 transition"
            >
                Logout
            </button>
        </div>
    );
};

export default StudentProfile;
