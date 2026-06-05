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
      <h3 className="text-xl font-bold text-slate-950 mb-4">Recharge</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 justify-items-center">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className="bg-white rounded-xl p-2.5 shadow-sm hover:shadow-md hover:scale-105 transition transform flex flex-col items-center text-center w-full max-w-[320px]"
          >
            <div className="bg-rose-100 rounded-lg p-2 mb-2 w-9 h-9 flex items-center justify-center">
              {item.icon}
            </div>
            <p className="text-[0.68rem] sm:text-xs font-semibold text-slate-950">
              {item.title}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};