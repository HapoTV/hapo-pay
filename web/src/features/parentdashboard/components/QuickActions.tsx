import React from 'react';

interface QuickActionItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickActionItem[];
  title?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions, title = 'Quick Actions' }) => {
  return (
    <div className="mb-8 w-full">
      <h3 className="text-xl font-bold text-slate-950 mb-4 dark:text-white">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 justify-items-center">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="bg-white rounded-[1.5rem] p-2 border border-slate-200 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 flex flex-col items-center justify-center gap-1 text-center w-full max-w-[360px] min-h-[72px] dark:bg-[#1A1830] dark:border-[#2A2740] dark:shadow-none"
          >
            <div className="bg-[#f0ebff] text-[#713cff] rounded-full p-1.5 flex items-center justify-center w-9 h-9 dark:bg-[#2A2740] dark:text-[#B39DFF]">
              {action.icon}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-950 leading-tight dark:text-white">
                {action.title}
              </h4>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};