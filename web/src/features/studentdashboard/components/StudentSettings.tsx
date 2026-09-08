import React, { useState } from 'react';

interface Props {
    darkMode: boolean;
    setDarkMode: (val: boolean) => void;
    onLogout: () => void;
}

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
    <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors duration-300 relative ${value ? 'bg-purple-600' : 'bg-slate-600'}`}>
        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${value ? 'left-6' : 'left-0.5'}`} />
    </button>
);

const StudentSettings: React.FC<Props> = ({ darkMode, setDarkMode, onLogout }) => {
    const [txnAlerts, setTxnAlerts] = useState(true);
    const [flaggedPurchases, setFlaggedPurchases] = useState(true);
    const [allowanceReminders, setAllowanceReminders] = useState(false);
    const [biometric, setBiometric] = useState(true);
    const [parentPin, setParentPin] = useState(true);
    const [spendingAlerts, setSpendingAlerts] = useState(true);

    const card = darkMode ? 'bg-[#1a1a2e] border-slate-800' : 'bg-white border-slate-200';
    const label = darkMode ? 'text-white' : 'text-slate-900';
    const sublabel = darkMode ? 'text-slate-400' : 'text-slate-500';
    const section = darkMode ? 'text-slate-500' : 'text-slate-400';
    const iconColor = darkMode ? 'text-slate-400' : 'text-slate-500';

    return (
        <div className="px-4 py-4 space-y-4">
            {/* Appearance */}
            <div className={`rounded-3xl border ${card} p-4 space-y-4`}>
                <p className={`text-xs uppercase tracking-widest font-semibold ${section}`}>Appearance</p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className={iconColor}>🌙</span>
                        <span className={`font-semibold ${label}`}>Dark Mode</span>
                    </div>
                    <Toggle value={darkMode} onChange={setDarkMode} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setDarkMode(true)}
                        className={`rounded-2xl p-4 flex flex-col items-center gap-2 border-2 transition ${darkMode ? 'border-purple-500 bg-purple-500/10' : 'border-transparent bg-slate-800'}`}>
                        <div className="w-6 h-1 bg-purple-400 rounded-full" />
                        <span className="text-white text-sm">Dark</span>
                    </button>
                    <button
                        onClick={() => setDarkMode(false)}
                        className={`rounded-2xl p-4 flex flex-col items-center gap-2 border-2 transition ${!darkMode ? 'border-purple-500 bg-purple-500/10' : 'border-transparent bg-slate-700'}`}>
                        <div className="w-6 h-1 bg-white rounded-full" />
                        <span className="text-white text-sm">Light</span>
                    </button>
                </div>
            </div>

            {/* Notifications */}
            <div className={`rounded-3xl border ${card} p-4 space-y-4`}>
                <p className={`text-xs uppercase tracking-widest font-semibold ${section}`}>Notifications</p>

                {[
                    { icon: '🔔', label: 'Transaction alerts', desc: 'Get notified on every purchase', value: txnAlerts, onChange: setTxnAlerts },
                    { icon: '🛡️', label: 'Flagged purchases', desc: 'Immediate alerts for blocked items', value: flaggedPurchases, onChange: setFlaggedPurchases },
                    { icon: '🔔', label: 'Allowance reminders', desc: 'Weekly top-up reminder', value: allowanceReminders, onChange: setAllowanceReminders },
                ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className={iconColor}>{item.icon}</span>
                            <div>
                                <p className={`text-sm font-semibold ${label}`}>{item.label}</p>
                                <p className={`text-xs ${sublabel}`}>{item.desc}</p>
                            </div>
                        </div>
                        <Toggle value={item.value} onChange={item.onChange} />
                    </div>
                ))}
            </div>

            {/* Security */}
            <div className={`rounded-3xl border ${card} p-4 space-y-4`}>
                <p className={`text-xs uppercase tracking-widest font-semibold ${section}`}>Security</p>

                {[
                    { icon: '🔒', label: 'Biometric unlock', desc: 'Touch ID or Face ID required', value: biometric, onChange: setBiometric },
                    { icon: '🛡️', label: 'Parent PIN', desc: '4-digit PIN for parent access', value: parentPin, onChange: setParentPin },
                    { icon: '🔔', label: 'Spending alerts', desc: 'Alert when near spending limit', value: spendingAlerts, onChange: setSpendingAlerts },
                ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className={iconColor}>{item.icon}</span>
                            <div>
                                <p className={`text-sm font-semibold ${label}`}>{item.label}</p>
                                <p className={`text-xs ${sublabel}`}>{item.desc}</p>
                            </div>
                        </div>
                        <Toggle value={item.value} onChange={item.onChange} />
                    </div>
                ))}
            </div>

            {/* Logout */}
            <button
                onClick={onLogout}
                className="w-full bg-rose-600/20 border border-rose-500/30 text-rose-400 py-3 rounded-2xl font-semibold hover:bg-rose-600/30 transition">
                Log Out
            </button>
        </div>
    );
};

export default StudentSettings;