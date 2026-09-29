import React from 'react';
import { User, Users, ShieldCheck, Settings2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface Props {
    studentData: { name: string; currency: string; balance: number };
    onLogout: () => void;
}

const StudentProfile: React.FC<Props> = ({ studentData, onLogout }) => {
    const { setTheme } = useTheme();

    return (
    <div className="pb-20 md:pb-0 max-w-7xl mx-auto px-4 py-5 space-y-5 bg-slate-100 text-slate-900 dark:bg-[#0D0B1A] dark:text-white">
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between dark:bg-[#1A1830] dark:border-[#2A2740]">
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-purple-600">Profile</p>
                <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">My Profile</h1>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-300">View your account information and student details.</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {studentData.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-base">{studentData.name}</p>
                    <p className="text-slate-600 dark:text-gray-300 text-sm">Student Account • <span className="text-emerald-500 dark:text-emerald-400 font-semibold">Active</span></p>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-600 dark:text-slate-400">Appearance</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-left text-slate-600 transition"
                >
                    <span className="text-sm font-medium">Dark</span>
                </button>
                <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-left text-slate-600 transition"
                >
                    <span className="text-sm font-medium">Light</span>
                </button>
            </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
                    <User className="w-5 h-5" />
                </div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Personal Information</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
                <div>
                    <p className="text-slate-600 dark:text-gray-300 text-xs mb-2">Full Name</p>
                    <input type="text" value={studentData.name} disabled className="w-full bg-[#0D0B1A] border border-[#2A2740] rounded-2xl p-3 text-white text-sm" />
                </div>
                <div>
                    <p className="text-slate-600 dark:text-gray-300 text-xs mb-2">Username</p>
                    <input type="text" value="student@hapo.com" disabled className="w-full bg-[#0D0B1A] border border-[#2A2740] rounded-2xl p-3 text-white text-sm" />
                </div>
                <div>
                    <p className="text-slate-600 dark:text-gray-300 text-xs mb-2">Account Email</p>
                    <input type="email" value="student@hapo.com" disabled className="w-full bg-[#0D0B1A] border border-[#2A2740] rounded-2xl p-3 text-white text-sm" />
                </div>
                <div>
                    <p className="text-slate-600 dark:text-gray-300 text-xs mb-2">Password</p>
                    <input type="password" value="••••••••" disabled className="w-full bg-[#0D0B1A] border border-[#2A2740] rounded-2xl p-3 text-white text-sm" />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 mt-4">
                <div>
                    <p className="text-slate-600 dark:text-gray-300 text-xs mb-2">Account Status</p>
                    <div className="bg-emerald-500/15 text-emerald-300 rounded-2xl p-3 text-center font-semibold text-sm">Active</div>
                </div>
                <div>
                    <p className="text-slate-600 dark:text-gray-300 text-xs mb-2">Account Created</p>
                    <input type="text" value="Date" disabled className="w-full bg-[#0D0B1A] border border-[#2A2740] rounded-2xl p-3 text-white text-sm" />
                </div>
            </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
                    <Users className="w-5 h-5" />
                </div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Parent Information</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
                <div>
                    <p className="text-slate-600 dark:text-gray-300 text-xs mb-2">Parent's Full Name</p>
                    <input type="text" value="Parent Name" disabled className="w-full bg-[#0D0B1A] border border-[#2A2740] rounded-2xl p-3 text-white text-sm" />
                </div>
                <div>
                    <p className="text-slate-600 dark:text-gray-300 text-xs mb-2">Emergency Contact</p>
                    <input type="text" value="Phone Number" disabled className="w-full bg-[#0D0B1A] border border-[#2A2740] rounded-2xl p-3 text-white text-sm" />
                </div>
                <div>
                    <p className="text-slate-600 dark:text-gray-300 text-xs mb-2">Parent's Email</p>
                    <input type="email" value="parent@email.com" disabled className="w-full bg-[#0D0B1A] border border-[#2A2740] rounded-2xl p-3 text-white text-sm" />
                </div>
                <div>
                    <p className="text-slate-600 dark:text-gray-300 text-xs mb-2">Relationship</p>
                    <input type="text" value="Parent/Guardian" disabled className="w-full bg-[#0D0B1A] border border-[#2A2740] rounded-2xl p-3 text-white text-sm" />
                </div>
            </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
                    <Settings2 className="w-5 h-5" />
                </div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Account Settings</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <div>
                    <p className="text-slate-600 dark:text-gray-300 text-xs mb-2">Weekly Spending Limit</p>
                    <input type="text" value="R100.00" disabled className="w-full bg-[#0D0B1A] border border-[#2A2740] rounded-2xl p-3 text-white text-sm" />
                </div>
                <div>
                    <p className="text-slate-600 dark:text-gray-300 text-xs mb-2">Daily Spending Limit</p>
                    <input type="text" value="R20.00" disabled className="w-full bg-[#0D0B1A] border border-[#2A2740] rounded-2xl p-3 text-white text-sm" />
                </div>
                <div>
                    <p className="text-slate-600 dark:text-gray-300 text-xs mb-2">Current Balance</p>
                    <input type="text" value={`R${studentData.balance}.00`} disabled className="w-full bg-[#0D0B1A] border border-[#2A2740] rounded-2xl p-3 text-white text-sm font-semibold" />
                </div>
            </div>
        </div>

        <div className="bg-[#0D0B1A] rounded-3xl border border-[#2A2740] p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-2">Account Security</h3>
                    <p className="text-slate-600 dark:text-gray-300 text-sm">Your account information is managed by your parent/guardian. If you need to update any personal information, please contact them.</p>
                </div>
            </div>
        </div>

        <button onClick={onLogout} className="w-full bg-purple-600 text-white py-3 rounded-full font-semibold hover:bg-purple-700 transition">
            Logout
        </button>
    </div>
    );
};

export default StudentProfile;