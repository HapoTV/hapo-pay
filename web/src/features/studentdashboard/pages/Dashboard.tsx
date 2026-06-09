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

type TabType = 'home' | 'rewards' | 'games' | 'profile';

export const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const [currentTab, setCurrentTab] = useState<TabType>('home');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSearchNotice, setShowSearchNotice] = useState(false);

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    const navItems = [
        {
            id: 'home',
            label: 'Home',
            isActive: currentTab === 'home',
            onClick: () => setCurrentTab('home'),
            icon: (
                <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
            ),
        },
        {
            id: 'rewards',
            label: 'Rewards',
            isActive: currentTab === 'rewards',
            onClick: () => setCurrentTab('rewards'),
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
            onClick: () => setCurrentTab('games'),
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
            onClick: () => setCurrentTab('profile'),
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
                onSearch={() => setShowSearchNotice(true)}
                onToggleNotifications={() => setShowNotifications((v) => !v)}
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