import React, { useRef, useEffect, useState } from 'react';

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

    const [showQRModal, setShowQRModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [requestAmount, setRequestAmount] = useState('');
    const [requestReason, setRequestReason] = useState('');
    const [emergencyAmount, setEmergencyAmount] = useState('');
    const [emergencyReason, setEmergencyReason] = useState('');
    const [urgencyLevel, setUrgencyLevel] = useState('');

    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (showQRModal) {
            navigator.mediaDevices?.getUserMedia({ video: true })
                .then((stream) => {
                    if (videoRef.current) videoRef.current.srcObject = stream;
                })
                .catch(() => { });
        } else {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach((t) => t.stop());
                videoRef.current.srcObject = null;
            }
        }
    }, [showQRModal]);

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
            onClick: () => setShowQRModal(true),
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
            onClick: () => setShowRequestModal(true),
        },
        {
            label: 'Emergency',
            subtitle: 'Urgent request',
            icon: (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            tone: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
            onClick: () => setShowEmergencyModal(true),
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

            {/* Header Card */}
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

            {/* Quick Actions */}
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
                            onClick={action.onClick}
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

            {/* Recent Activity */}
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

            {/* Transaction History */}
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

            {/* QR Scanner Modal */}
            {showQRModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Scan QR Code to Pay</h2>
                            <button onClick={() => setShowQRModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
                        </div>
                        <div className="relative bg-black rounded-xl overflow-hidden aspect-square mb-4">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-48 h-48 border-2 border-purple-500 rounded-xl" />
                            </div>
                            <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                                ⚠️ Camera access denied or not available
                            </p>
                        </div>
                        <button onClick={() => setShowQRModal(false)}
                            className="w-full border border-slate-300 text-slate-700 py-2 rounded-lg hover:bg-slate-50 transition">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Request Money Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Request Money</h2>
                            <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Amount needed</label>
                                <input type="number" value={requestAmount} onChange={(e) => setRequestAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-rose-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reason (optional)</label>
                                <textarea value={requestReason} onChange={(e) => setRequestReason(e.target.value)}
                                    placeholder="What do you need this money for?"
                                    className="w-full border border-slate-300 rounded-lg p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowRequestModal(false)}
                                className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg hover:bg-slate-50 transition">
                                Cancel
                            </button>
                            <button onClick={() => { alert('Request sent!'); setShowRequestModal(false); setRequestAmount(''); setRequestReason(''); }}
                                className="flex-1 bg-rose-500 text-white py-2 rounded-lg hover:bg-rose-600 transition font-semibold">
                                Send Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Emergency Request Modal */}
            {showEmergencyModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-slate-900">Emergency Request</h2>
                            </div>
                            <button onClick={() => setShowEmergencyModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Emergency amount needed</label>
                                <input type="number" value={emergencyAmount} onChange={(e) => setEmergencyAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-rose-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Emergency reason</label>
                                <textarea value={emergencyReason} onChange={(e) => setEmergencyReason(e.target.value)}
                                    placeholder="Please describe the emergency situation..."
                                    className="w-full border border-slate-300 rounded-lg p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Urgency level</label>
                                <select value={urgencyLevel} onChange={(e) => setUrgencyLevel(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-rose-500">
                                    <option value="">Select urgency level</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowEmergencyModal(false)}
                                className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg hover:bg-slate-50 transition">
                                Cancel
                            </button>
                            <button onClick={() => { alert('Emergency request sent!'); setShowEmergencyModal(false); setEmergencyAmount(''); setEmergencyReason(''); setUrgencyLevel(''); }}
                                className="flex-1 bg-rose-500 text-white py-2 rounded-lg hover:bg-rose-600 transition font-semibold">
                                Send Emergency Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentHome;