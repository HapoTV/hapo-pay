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

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  title = 'Quick Actions',
}) => {
  return (
    <div className="mb-8 w-full">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
        {title}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 justify-items-center">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="bg-white dark:bg-[#1A1830] rounded-[1.5rem] p-2 border border-gray-200 dark:border-[#2A2740] shadow-sm hover:shadow-md hover:border-[#7C5CFC]/40 transition transform hover:-translate-y-0.5 flex flex-col items-center justify-center gap-1 text-center w-full max-w-[360px] min-h-[72px]"
          >
            <div className="bg-[#7C5CFC]/15 text-[#7C5CFC] rounded-full p-1.5 flex items-center justify-center w-9 h-9">
              {action.icon}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
                {action.title}
              </h4>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
