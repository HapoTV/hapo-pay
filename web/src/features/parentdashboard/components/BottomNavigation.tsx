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
    <nav className="bg-white dark:bg-[#1A1830] border-b border-gray-200 dark:border-[#2A2740] shadow-lg md:border-b-0 md:border-r md:h-full transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-10 md:px-6">
        <div className="space-y-6">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`w-full flex items-center gap-5 rounded-3xl px-4 py-4 text-left transition ${
                item.isActive
                  ? 'bg-[#7C5CFC]/15 text-[#6D4AFF] dark:text-[#B39DFF]'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="w-7 h-7 text-current">
                {item.icon}
              </div>

              <span className="text-base font-medium">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};