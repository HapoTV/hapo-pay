import React from 'react';

interface RechargeItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface RechargeSectionProps {
  items: RechargeItem[];
}

export const RechargeSection: React.FC<RechargeSectionProps> = ({ items }) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
        Recharge
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 justify-items-center">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className="bg-white dark:bg-[#1A1830] border border-gray-200 dark:border-[#2A2740] rounded-xl p-2.5 shadow-sm hover:shadow-md hover:scale-105 hover:border-[#7C5CFC]/40 transition transform flex flex-col items-center text-center w-full max-w-[320px]"
          >
            <div className="bg-[#7C5CFC]/15 rounded-lg p-2 mb-2 w-9 h-9 flex items-center justify-center">
              {item.icon}
            </div>

            <p className="text-[0.68rem] sm:text-xs font-semibold text-gray-900 dark:text-white">
              {item.title}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};