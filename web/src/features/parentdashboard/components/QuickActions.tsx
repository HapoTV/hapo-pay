import React from 'react';

interface QuickActionItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickActionItem[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="bg-white rounded-2xl p-6 border-l-4 border-pink-500 shadow-sm hover:shadow-md hover:scale-105 transition transform flex flex-col items-center text-center"
          >
            <div className="bg-pink-100 rounded-lg p-4 mb-3 w-12 h-12 flex items-center justify-center">
              {action.icon}
            </div>
            <h4 className="text-sm font-semibold text-gray-900 leading-tight">
              {action.title}
            </h4>
          </button>
        ))}
      </div>
    </div>
  );
};