import React from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
}

interface BottomNavigationProps {
  items: NavItem[];
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ items }) => {
  return (
    <nav className="bg-white border-b border-slate-200 shadow-lg md:border-b-0 md:border-r md:h-full">
      <div className="max-w-7xl mx-auto px-4 py-10 md:px-6">
        <div className="space-y-6">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`w-full flex items-center gap-5 rounded-3xl px-4 py-4 text-left transition ${
                item.isActive
                  ? 'bg-rose-50 text-rose-500'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <div className="w-7 h-7 text-current">
                {item.icon}
              </div>
              <span className="text-base font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};