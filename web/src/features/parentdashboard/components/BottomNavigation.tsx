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
    <nav className="bg-white dark:bg-[#1A1830] border-b border-gray-200 dark:border-[#2A2740] shadow-lg transition-colors duration-200 md:border-b-0 md:border-r md:min-h-full md:h-full">
      <div className="max-w-7xl mx-auto px-3 py-3 md:px-6 md:py-10">
        <div className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:space-y-6 md:gap-0 md:overflow-visible md:pb-0">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex min-w-[120px] items-center justify-center gap-2 rounded-3xl px-3 py-3 text-left transition md:w-full md:justify-start md:gap-5 md:px-4 md:py-4 ${
                item.isActive
                  ? 'bg-[#7C5CFC]/15 text-gray-900 font-medium dark:text-[#B39DFF]'
                  : 'text-gray-900 font-medium dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="w-5 h-5 shrink-0 text-current md:w-7 md:h-7">
                {item.icon}
              </div>

              <span className="text-sm font-medium md:text-base">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};