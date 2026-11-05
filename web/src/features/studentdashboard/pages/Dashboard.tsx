import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Gamepad2, Home, Settings, Star } from 'lucide-react';
import {
    authApi,
    getApiErrorMessage,
    getCollectionItems,
    studentApi,
    type WalletTransaction,
} from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { BottomNavigation, DashboardTopbar } from '@/features/parentdashboard/components';
import StudentHome from '../components/StudentHome';
import StudentRewards from '../components/StudentRewards';
import StudentGames from '../components/StudentGames';
import StudentProfile from '../components/StudentProfile';

interface StudentDashboardData {
    name: string;
    email: string;
    balance: number;
    monthlySpending: number;
    currency: string;
    transactions: WalletTransaction[];
}

type TabType = 'home' | 'pay' | 'rewards' | 'games' | 'settings';

const VerifyIdentity: React.FC<{ onVerified: () => void; onCancel: () => void }> = ({ onVerified, onCancel }) => {
    const [pinMode, setPinMode] = useState(false);
    const [pin, setPin] = useState('');

    const enterPin = (digit: string) => {
        const nextPin = pin + digit;
        setPin(nextPin);
        if (nextPin.length === 4) onVerified();
    };

    return (
        <div className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-white">Verify identity</h2>
            {!pinMode ? (
                <>
                    <p className="text-slate-300 text-sm text-center">Choose a method to confirm this payment.</p>
                    <button onClick={onVerified} className="w-full rounded-2xl bg-violet-600 px-5 py-4 font-semibold text-white">Use biometrics</button>
                    <button onClick={() => setPinMode(true)} className="w-full rounded-2xl bg-slate-800 px-5 py-4 font-semibold text-white">Enter PIN</button>
                </>
            ) : (
                <>
                    <p className="text-slate-300 text-sm">Enter your 4-digit PIN</p>
                    <div className="flex gap-3" aria-label={`${pin.length} of 4 PIN digits entered`}>
                        {[0, 1, 2, 3].map((digit) => <span key={digit} className={`h-3 w-3 rounded-full border ${pin.length > digit ? 'border-violet-400 bg-violet-400' : 'border-slate-400'}`} />)}
                    </div>
                    <div className="grid w-full max-w-xs grid-cols-3 gap-3">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'cancel'].map((key) => (
                            <button key={key} onClick={() => key === 'back' ? setPin(pin.slice(0, -1)) : key === 'cancel' ? (setPinMode(false), setPin('')) : enterPin(key)} className="h-12 rounded-xl bg-slate-800 text-lg font-semibold text-white">
                                {key === 'back' ? 'Delete' : key === 'cancel' ? 'Cancel' : key}
                            </button>
                        ))}
                    </div>
                </>
            )}
            <button onClick={onCancel} className="text-sm text-slate-400 hover:text-white">Cancel payment</button>
        </div>
    );
};

const QRPayment: React.FC<{ onBack: () => void; balance: number; currency: string }> = ({ onBack, balance, currency }) => (
    <div className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6">
        <button onClick={onBack} className="self-start text-violet-300 text-sm font-medium">Back</button>
        <h2 className="text-2xl font-bold text-white">Scan to Pay</h2>
        <p className="text-slate-300 text-sm text-center">Show this QR code to the merchant</p>
        <div className="rounded-3xl border-2 border-violet-200 bg-white p-6 shadow-lg">
            <div className="grid h-48 w-48 grid-cols-5 gap-1" aria-label="Payment QR code">
                {Array.from({ length: 25 }).map((_, index) => (
                    <div key={index} className={`rounded-sm ${[0, 1, 3, 4, 5, 8, 10, 12, 13, 16, 18, 20, 21, 23, 24].includes(index) ? 'bg-slate-900' : 'bg-white'}`} />
                ))}
            </div>
        </div>
        <div className="w-full max-w-xs rounded-2xl bg-slate-800 p-4 text-center">
            <p className="mb-1 text-xs text-slate-300">Available Balance</p>
            <p className="text-2xl font-bold text-violet-300">{currency} {balance.toFixed(2)}</p>
        </div>
        <p className="text-xs text-slate-400">QR code expires in 5 minutes</p>
    </div>
);

export const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const [currentTab, setCurrentTab] = useState<TabType>('home');
    const [verified, setVerified] = useState(false);
    const [studentData, setStudentData] = useState<StudentDashboardData>({
        name: '',
        email: '',
        balance: 0,
        monthlySpending: 0,
        currency: 'R',
        transactions: [],
    });
    const [profileError, setProfileError] = useState('');
    const [profileLoadAttempt, setProfileLoadAttempt] = useState(0);
    const [walletDataError, setWalletDataError] = useState('');
    const [walletDataLoading, setWalletDataLoading] = useState(true);
    const [walletDataLoadAttempt, setWalletDataLoadAttempt] = useState(0);

    useEffect(() => {
        let active = true;

        authApi.getProfile()
            .then(({ data }) => {
                if (!active) return;
                if (data.data.role !== 'student') {
                    throw new Error('This account is not registered as a student.');
                }
                setStudentData((current) => ({
                    ...current,
                    name: data.data.full_name,
                    email: data.data.email,
                }));
                setProfileError('');
            })
            .catch((error: unknown) => {
                if (active) {
                    setProfileError(getApiErrorMessage(error, 'Unable to load your profile.'));
                }
            });

        return () => {
            active = false;
        };
    }, [profileLoadAttempt]);

    useEffect(() => {
        let active = true;
        setWalletDataLoading(true);
        setWalletDataError('');

        Promise.allSettled([
            studentApi.getWallet(),
            studentApi.getTransactions(),
        ]).then(([walletResult, transactionsResult]) => {
            if (!active) return;

            const errors: string[] = [];
            let walletBalance: number | null = null;
            let currency = 'R';

            if (walletResult.status === 'fulfilled') {
                const wallet = getCollectionItems(walletResult.value.data)[0];
                if (!wallet) {
                    errors.push('Wallet: no wallet was returned for this account.');
                } else {
                    const balance = Number(wallet.balance);
                    if (Number.isFinite(balance)) {
                        walletBalance = balance;
                        currency = wallet.currency === 'ZAR' ? 'R' : wallet.currency;
                    } else {
                        errors.push('Wallet: the response contained an invalid balance.');
                    }
                }
            } else {
                errors.push(`Wallet: ${getApiErrorMessage(walletResult.reason, 'Unable to load wallet data.')}`);
            }

            if (transactionsResult.status === 'fulfilled') {
                const transactions = getCollectionItems(transactionsResult.value.data);
                const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
                const monthlySpending = transactions
                    .filter((transaction) => {
                        const createdAt = new Date(transaction.created_at).getTime();
                        return transaction.status === 'completed'
                            && ['payment', 'withdrawal'].includes(transaction.type)
                            && Number.isFinite(createdAt)
                            && createdAt >= thirtyDaysAgo;
                    })
                    .reduce((total, transaction) => {
                        const amount = Number(transaction.amount);
                        return Number.isFinite(amount) ? total + amount : total;
                    }, 0);

                setStudentData((current) => ({
                    ...current,
                    transactions,
                    monthlySpending,
                }));
            } else {
                errors.push(`Transactions: ${getApiErrorMessage(transactionsResult.reason, 'Unable to load transactions.')}`);
            }

            if (walletBalance !== null) {
                setStudentData((current) => ({ ...current, balance: walletBalance, currency }));
            }

            setWalletDataError(errors.join(' '));
            setWalletDataLoading(false);
        });

        return () => {
            active = false;
        };
    }, [walletDataLoadAttempt]);

    const handleLogout = async () => {
        const refreshToken = useAuthStore.getState().refreshToken;
        try {
            if (refreshToken) await authApi.logout(refreshToken);
        } catch (error) {
            console.error('Unable to revoke the session on the server.', error);
        } finally {
            clearAuth();
            navigate('/login');
        }
    };

    const handleTabChange = (tab: TabType) => {
        if (tab === 'pay') setVerified(false);
        setCurrentTab(tab);
    };

    const navItems = [
        { id: 'home', label: 'Home', icon: <Home />, onClick: () => handleTabChange('home'), isActive: currentTab === 'home' },
        { id: 'pay', label: 'Pay', icon: <CreditCard />, onClick: () => handleTabChange('pay'), isActive: currentTab === 'pay' },
        { id: 'rewards', label: 'Rewards', icon: <Star />, onClick: () => handleTabChange('rewards'), isActive: currentTab === 'rewards' },
        { id: 'games', label: 'Games', icon: <Gamepad2 />, onClick: () => handleTabChange('games'), isActive: currentTab === 'games' },
        { id: 'settings', label: 'Settings', icon: <Settings />, onClick: () => handleTabChange('settings'), isActive: currentTab === 'settings' },
    ];

    const renderContent = () => {
        switch (currentTab) {
            case 'home':
                return <StudentHome studentData={{ ...studentData, isLoading: walletDataLoading }} />;
            case 'pay':
                return verified
                    ? <QRPayment
                        onBack={() => setVerified(false)}
                        balance={studentData.balance}
                        currency={studentData.currency}
                    />
                    : <VerifyIdentity onVerified={() => setVerified(true)} onCancel={() => handleTabChange('home')} />;
            case 'rewards':
                return <StudentRewards />;
            case 'games':
                return <StudentGames />;
            case 'settings':
                return <StudentProfile studentData={studentData} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0D0B1A] text-white">
            <DashboardTopbar title="Student Dashboard" onLogout={handleLogout} />
            <div className="flex flex-col md:flex-row">
                <aside className="w-full flex-shrink-0 md:w-64">
                    <BottomNavigation items={navItems} />
                </aside>
                <main className="flex-1">
                    {profileError && (
                        <div role="alert" className="mx-4 mt-4 flex items-center justify-between gap-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                            <span>{profileError}</span>
                            <button
                                type="button"
                                onClick={() => setProfileLoadAttempt((attempt) => attempt + 1)}
                                className="shrink-0 font-semibold underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    {(walletDataError || walletDataLoading) && (
                        <div
                            role={walletDataError ? 'alert' : 'status'}
                            className={`mx-4 mt-4 flex items-center justify-between gap-4 rounded-xl px-4 py-3 text-sm ${
                                walletDataError
                                    ? 'border border-amber-300 bg-amber-50 text-amber-900'
                                    : 'border border-slate-300 bg-slate-50 text-slate-700'
                            }`}
                        >
                            <span>{walletDataError || 'Loading your wallet and transactions…'}</span>
                            {walletDataError && (
                                <button
                                    type="button"
                                    onClick={() => setWalletDataLoadAttempt((attempt) => attempt + 1)}
                                    className="shrink-0 font-semibold underline"
                                >
                                    Retry
                                </button>
                            )}
                        </div>
                    )}
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};