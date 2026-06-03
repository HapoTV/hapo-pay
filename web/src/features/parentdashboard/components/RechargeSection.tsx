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
      <h3 className="text-xl font-bold text-gray-900 mb-4">Recharge</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md hover:scale-105 transition transform flex flex-col items-center text-center"
          >
            <div className="bg-pink-100 rounded-lg p-3 mb-3 w-12 h-12 flex items-center justify-center">
              {item.icon}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-gray-900">
              {item.title}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};