import React from 'react';
import { Home, LayoutGrid, Star, Settings } from 'lucide-react';

export type TabId = 'home' | 'pay' | 'rewards' | 'settings';

interface Props {
    active: TabId;
    onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'pay', label: 'Pay', icon: LayoutGrid },
    { id: 'rewards', label: 'Rewards', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
];

const BottomNav: React.FC<Props> = ({ active, onChange }) => (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-around py-2">
            {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = active === tab.id;

                if (tab.id === 'pay') {
                    return (
                        <button key={tab.id} onClick={() => onChange(tab.id)} className="flex flex-col items-center gap-1 -mt-3">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-violet-600 flex items-center justify-center shadow-lg">
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <span className={`text-[11px] font-medium ${isActive ? 'text-violet-400' : 'text-slate-400'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                }

                return (
                    <button key={tab.id} onClick={() => onChange(tab.id)} className="flex flex-col items-center gap-1 py-1 px-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isActive ? 'bg-violet-600' : ''}`}>
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        </div>
                        <span className={`text-[11px] font-medium ${isActive ? 'text-violet-400' : 'text-slate-400'}`}>
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    </nav>
);

export default BottomNav;