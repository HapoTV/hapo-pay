import React from 'react';
import {
  CheckIcon,
  WarningIcon,
  XIcon,
  InfoCircleIcon,
} from '../../../components/icons';

interface SafetyAlertProps {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  onSettings?: () => void;
}

export const SafetyAlerts: React.FC<SafetyAlertProps> = ({
  message,
  type,
  onSettings,
}) => {
  const bgColors = {
    success:
      'bg-green-50 dark:bg-[#14291F] border-green-200 dark:border-[#22C55E]/30',
    warning:
      'bg-orange-50 dark:bg-[#3B1A16] border-orange-200 dark:border-[#F97316]/30',
    error:
      'bg-red-50 dark:bg-[#2E1416] border-red-200 dark:border-[#EF4444]/30',
    info:
      'bg-cyan-50 dark:bg-[#151F35] border-cyan-200 dark:border-[#3ED9C2]/30',
  };

  const iconColors = {
    success:
      'text-green-600 dark:text-[#4ADE80] bg-green-100 dark:bg-[#22C55E]/15',
    warning:
      'text-orange-600 dark:text-[#F97316] bg-orange-100 dark:bg-[#F97316]/15',
    error:
      'text-red-600 dark:text-[#F87171] bg-red-100 dark:bg-[#EF4444]/15',
    info:
      'text-cyan-600 dark:text-[#3ED9C2] bg-cyan-100 dark:bg-[#3ED9C2]/15',
  };

  const icons = {
    success: <CheckIcon className="w-5 h-5" />,
    warning: <WarningIcon className="w-5 h-5" />,
    error: <XIcon className="w-5 h-5" />,
    info: <InfoCircleIcon className="w-5 h-5" />,
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
          Safety Alerts
        </h3>
      </div>

      <div
        className={`border rounded-xl p-4 flex items-start gap-4 transition-colors duration-200 ${bgColors[type]}`}
      >
        <div
          className={`rounded-lg p-2 flex-shrink-0 ${iconColors[type]}`}
        >
          {icons[type]}
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
