import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { DashboardTopbar } from '@/features/parentdashboard/components';
import { BottomNavigation } from '@/features/parentdashboard/components';
import StudentHome from '../components/StudentHome';
import StudentRewards from '../components/StudentRewards';
import StudentGames from '../components/StudentGames';
import StudentProfile from '../components/StudentProfile';

const mockStudentData = {
    name: 'Lilitha Klaas',
    balance: 530.0,
    monthlySpending: 0.0,
    currency: 'R',
    recentActivity: [],
    transactionHistory: [],
};

type TabType = 'home' | 'rewards' | 'games' | 'profile' | 'pay';

// Verify Identity Screen
const VerifyIdentity: React.FC<{ onVerified: () => void; onCancel: () => void }> = ({ onVerified, onCancel }) => {
    const [pinMode, setPinMode] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handlePin = (digit: string) => {
        if (pin.length < 4) {
            const newPin = pin + digit;
            setPin(newPin);
            if (newPin.length === 4) {
                setTimeout(() => { onVerified(); }, 500);
            }
        }
    };

    const handleDelete = () => setPin(pin.slice(0, -1));

    if (pinMode) {
        return (
            <div className="max-w-md mx-auto px-4 py-10 flex flex-col items-center space-y-6">
                <button onClick={() => { setPinMode(false); setPin(''); setError(''); }}
                    className="self-start text-purple-600 text-sm font-medium">← Back</button>
                <h2 className="text-2xl font-bold text-slate-900">Enter PIN</h2>
                <p className="text-slate-500 text-sm">Enter your 4-digit PIN to confirm</p>

                <div className="flex gap-4 my-4">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`w-4 h-4 rounded-full border-2 ${pin.length > i ? 'bg-purple-600 border-purple-600' : 'border-slate-300'}`} />
                    ))}
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, i) => (
                        <button key={i}
                            onClick={() => key === '⌫' ? handleDelete() : key !== '' ? handlePin(key) : null}
                            className={`h-14 rounded-2xl text-xl font-semibold transition ${key === '' ? '' : 'bg-white border border-slate-200 shadow-sm hover:bg-purple-50 hover:border-purple-300 text-slate-900'}`}>
                            {key}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto px-4 py-10 flex flex-col items-center space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Verify Identity</h2>
            <p className="text-slate-500 text-sm text-center">Use your fingerprint or face to confirm</p>

            {/* Touch ID Button */}
            <button
                onClick={onVerified}
                className="w-32 h-32 rounded-full bg-purple-600 flex flex-col items-center justify-center shadow-lg shadow-purple-300 hover:bg-purple-700 transition mt-4"
                style={{ boxShadow: '0 0 0 12px rgba(147,51,234,0.15)' }}>
                <span className="text-4xl">👆</span>
                <span className="text-white text-sm font-semibold mt-1">Touch ID</span>
            </button>

            <p className="text-slate-400 text-sm">Tap the sensor to authenticate</p>

            <div className="flex items-center gap-3 w-full max-w-xs">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 uppercase tracking-widest">Or use another method</span>
                <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="w-full max-w-xs space-y-3">
                <button
                    onClick={onVerified}
                    className="w-full flex items-center gap-4 bg-[#1a1a2e] text-white px-5 py-4 rounded-2xl hover:bg-[#2a2a3e] transition">
                    <span className="text-2xl">👁️</span>
                    <span className="font-medium">Face Recognition</span>
                </button>
                <button
                    onClick={() => setPinMode(true)}
                    className="w-full flex items-center gap-4 bg-[#1a1a2e] text-white px-5 py-4 rounded-2xl hover:bg-[#2a2a3e] transition">
                    <span className="text-2xl">🔢</span>
                    <span className="font-medium">Enter PIN</span>
                </button>
            </div>

            <button onClick={onCancel} className="text-slate-400 text-sm hover:text-slate-600 mt-2">Cancel</button>
        </div>
    );
};

// QR Payment Screen (shown after verification)
const QRPayment: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="max-w-md mx-auto px-4 py-10 flex flex-col items-center space-y-6">
        <button onClick={onBack} className="self-start text-purple-600 text-sm font-medium">← Back</button>
        <h2 className="text-2xl font-bold text-slate-900">Scan to Pay</h2>
        <p className="text-slate-500 text-sm text-center">Show this QR code to the merchant</p>

        <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-lg">
            <div className="grid grid-cols-5 gap-1 w-48 h-48">
                {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={`rounded-sm ${[0, 1, 3, 4, 5, 8, 10, 12, 13, 16, 18, 20, 21, 23, 24].includes(i) ? 'bg-slate-900' : 'bg-white'}`} />
                ))}
            </div>
        </div>

        <div className="bg-purple-50 rounded-2xl p-4 w-full max-w-xs text-center">
            <p className="text-xs text-slate-500 mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-purple-600">R530.00</p>
        </div>

        <p className="text-slate-400 text-xs text-center">QR code expires in 5 minutes</p>
    </div>
);

export const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const [currentTab, setCurrentTab] = useState<TabType>('home');
    const [verified, setVerified] = useState(false);

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    const handleTabChange = (tab: TabType) => {
        if (tab === 'pay') setVerified(false);
        setCurrentTab(tab);
    };

    const navItems = [
        {
            id: 'home',
            label: 'Home',
            isActive: currentTab === 'home',
            onClick: () => handleTabChange('home'),
            icon: (
                <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
            ),
        },
        {
            id: 'pay',
            label: 'Pay',
            isActive: currentTab === 'pay',
            onClick: () => handleTabChange('pay'),
            icon: (
                <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
            ),
        },
        {
            id: 'rewards',
            label: 'Rewards',
            isActive: currentTab === 'rewards',
            onClick: () => handleTabChange('rewards'),
            icon: (
                <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ),
        },
        {
            id: 'games',
            label: 'My Games',
            isActive: currentTab === 'games',
            onClick: () => handleTabChange('games'),
            icon: (
                <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
            ),
        },
        {
            id: 'profile',
            label: 'Profile',
            isActive: currentTab === 'profile',
            onClick: () => handleTabChange('profile'),
            icon: (
                <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
            ),
        },
    ];

    const renderContent = () => {
        switch (currentTab) {
            case 'home':
                return <StudentHome studentData={mockStudentData} />;
            case 'pay':
                return verified
                    ? <QRPayment onBack={() => setVerified(false)} />
                    : <VerifyIdentity onVerified={() => setVerified(true)} onCancel={() => handleTabChange('home')} />;
            case 'rewards':
                return <StudentRewards />;
            case 'games':
                return <StudentGames />;
            case 'profile':
                return <StudentProfile studentData={mockStudentData} onLogout={handleLogout} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <DashboardTopbar
                title="Student Dashboard"
                onSearch={() => { }}
                onToggleNotifications={() => { }}
                onLogout={handleLogout}
            />
            <div className="flex flex-col md:flex-row">
                <aside className="w-full md:w-64 flex-shrink-0">
                    <BottomNavigation items={navItems} />
                </aside>
                <main className="flex-1">{renderContent()}</main>
            </div>
        </div>
    );
};