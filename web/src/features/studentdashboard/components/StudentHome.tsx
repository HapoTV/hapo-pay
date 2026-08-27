import React from 'react';

interface StudentData {
    name: string;
    balance: number;
    monthlySpending: number;
    currency: string;
    recentActivity: Array<{ title?: string; amount?: number; type?: string; time?: string }>;
    transactionHistory: Array<{ title?: string; amount?: number; type?: string; time?: string }>;
}

interface Props {
    studentData: StudentData;
}

const StudentHome: React.FC<Props> = ({ studentData }) => {
    const { name, balance, monthlySpending, currency, recentActivity, transactionHistory } = studentData;

    const quickActions = [
        {
            label: 'Scan QR',
            subtitle: 'Pay instantly',
            icon: (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 7.5V5.25A2.25 2.25 0 0 1 5.25 3H7.5M16.5 3h2.25A2.25 2.25 0 0 1 21 5.25V7.5M21 16.5v2.25A2.25 2.25 0 0 1 18.75 21H16.5M7.5 21H5.25A2.25 2.25 0 0 1 3 18.75V16.5M8.25 8.25h7.5v7.5h-7.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            tone: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
        },
        {
            label: 'Request',
            subtitle: 'Ask for money',
            icon: (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            tone: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        },
        {
            label: 'Transfer',
            subtitle: 'Move funds',
            icon: (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 7h12a2 2 0 0 1 2 2v8M3 7l3-3m-3 3 3 3M21 17H9a2 2 0 0 1-2-2V7M21 17l-3 3m3-3-3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            tone: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        },
    ];

    const activityList = recentActivity?.length ? recentActivity : [
        { title: 'No recent activity', amount: 0, type: 'neutral', time: 'Today' },
    ];

    const transactionList = transactionHistory?.length ? transactionHistory : [
        { title: 'No transactions yet', amount: 0, type: 'neutral', time: 'This month' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-5 pb-24 space-y-5 bg-slate-950 min-h-screen text-slate-100">
            <div className="rounded-[28px] border border-violet-500/20 bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-600 p-5 shadow-[0_20px_60px_-15px_rgba(139,92,246,0.55)]">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-violet-100/80">Student</p>
                        <h1 className="mt-2 text-2xl font-bold text-white">Welcome back, {name}</h1>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg shadow-inner ring-1 ring-white/20 backdrop-blur-sm">
                        👋
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/15 bg-black/10 p-3 backdrop-blur-sm">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-violet-100/75">Balance</p>
                        <p className="mt-3 text-2xl font-bold text-white">{currency}{balance.toFixed(2)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-black/10 p-3 backdrop-blur-sm">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-violet-100/75">Monthly spend</p>
                        <p className="mt-3 text-2xl font-bold text-white">{currency}{monthlySpending.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-[26px] border border-slate-800 bg-slate-900/80 p-4">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-white">Quick actions</h2>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Fast</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {quickActions.map((action) => (
                        <button
                            key={action.label}
                            type="button"
                            className={`rounded-2xl border p-3 text-left transition hover:translate-y-[-1px] ${action.tone}`}
                        >
                            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950/40">
                                {action.icon}
                            </div>
                            <p className="text-sm font-semibold text-white">{action.label}</p>
                            <p className="mt-1 text-[11px] text-slate-300">{action.subtitle}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="rounded-[26px] border border-slate-800 bg-slate-900/80 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-white">Recent activity</h2>
                    <button type="button" className="text-xs font-medium text-violet-400">View all</button>
                </div>

                <div className="space-y-3">
                    {activityList.map((item, index) => {
                        const positive = Number(item.amount ?? 0) >= 0;
                        return (
                            <div key={`${item.title ?? 'activity'}-${index}`} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${positive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                                    {positive ? '↗' : '↘'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-white">{item.title ?? 'Recent activity'}</p>
                                    <p className="text-xs text-slate-400">{item.time ?? 'Today'}</p>
                                </div>
                                <span className={`text-sm font-semibold ${positive ? 'text-emerald-300' : 'text-slate-300'}`}>
                                    {positive ? '+' : '-'}{currency}{Math.abs(Number(item.amount ?? 0)).toFixed(2)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="rounded-[26px] border border-slate-800 bg-slate-900/80 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-white">Transactions</h2>
                    <button type="button" className="text-xs font-medium text-violet-400">See more</button>
                </div>

                <div className="space-y-3">
                    {transactionList.map((item, index) => {
                        const positive = Number(item.amount ?? 0) >= 0;
                        return (
                            <div key={`${item.title ?? 'txn'}-${index}`} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${positive ? 'bg-violet-500/15 text-violet-300' : 'bg-slate-700 text-slate-300'}`}>
                                    {positive ? '✓' : '•'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-white">{item.title ?? 'No transaction history'}</p>
                                    <p className="text-xs text-slate-400">{item.time ?? 'This month'}</p>
                                </div>
                                <span className={`text-sm font-semibold ${positive ? 'text-violet-300' : 'text-slate-300'}`}>
                                    {positive ? '+' : '-'}{currency}{Math.abs(Number(item.amount ?? 0)).toFixed(2)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StudentHome;