import React, { useRef, useEffect, useState } from 'react';

interface StudentData {
    name: string;
    balance: number;
    monthlySpending: number;
    currency: string;
    recentActivity: unknown[];
    transactionHistory: unknown[];
}

interface Props {
    studentData: StudentData;
}

const StudentHome: React.FC<Props> = ({ studentData }) => {
    const { name, balance, monthlySpending, currency } = studentData;

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

    return (
        <div className="pb-20 md:pb-0 max-w-7xl mx-auto px-4 py-6 space-y-6">
            <p className="text-lg font-semibold text-slate-800">Welcome back, {name}!</p>

            {/* Balance Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-rose-100 p-2 rounded-xl">
                            <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                        </div>
                        <span className="text-xs text-slate-500">Available Balance</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{currency}{balance.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-2xl border-l-4 border-rose-500 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-rose-100 p-2 rounded-xl">
                            <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-xs text-slate-500">This Month</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{currency}{monthlySpending.toFixed(2)}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-base font-semibold text-slate-800 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        {
                            label: 'Scan QR to Pay',
                            icon: <svg className="w-6 h-6 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" /></svg>,
                            onClick: () => setShowQRModal(true),
                        },
                        {
                            label: 'Request Money',
                            icon: <svg className="w-6 h-6 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>,
                            onClick: () => setShowRequestModal(true),
                        },
                        {
                            label: 'Emergency Request',
                            icon: <svg className="w-6 h-6 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
                            onClick: () => setShowEmergencyModal(true),
                        },
                    ].map((action) => (
                        <button key={action.label} onClick={action.onClick}
                            className="bg-white rounded-2xl border-l-4 border-rose-500 p-3 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition">
                            <div className="bg-rose-100 p-2 rounded-xl">{action.icon}</div>
                            <span className="text-xs text-slate-700 font-medium text-center leading-tight">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h3 className="text-base font-semibold text-slate-800 mb-3">Recent Activity</h3>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                        <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="text-slate-600 font-medium text-sm">No recent activity</p>
                    <p className="text-slate-400 text-xs mt-2">Your activity from the last 3 days will appear here.</p>
                </div>
            </div>

            {/* Transaction History */}
            <div>
                <h3 className="text-base font-semibold text-slate-800 mb-3">Transaction History</h3>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                        <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="text-slate-600 font-medium text-sm">No transaction history</p>
                    <p className="text-slate-400 text-xs mt-2">Your transaction history will appear here.</p>
                </div>
            </div>

            {/* QR Scanner Modal */}
            {showQRModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" /></svg>
                                <h2 className="text-lg font-bold text-slate-900">Scan QR Code to Pay</h2>
                            </div>
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
                                <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
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