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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:relative md:shadow-none md:border-t-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-5 gap-0">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center py-3 md:py-4 px-2 transition-colors ${
                item.isActive
                  ? 'text-pink-500 border-t-2 md:border-t-0 md:border-b-2 border-pink-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="w-6 h-6 md:w-5 md:h-5 mb-1">
                {item.icon}
              </div>
              <span className="text-xs md:text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};