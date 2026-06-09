import React from 'react';
import { CheckIcon, WarningIcon, XIcon, InfoCircleIcon, CogIcon } from '../../../components/icons';

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
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const iconColors = {
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    error: 'text-red-600 bg-red-100',
    info: 'text-blue-600 bg-blue-100',
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
        <h3 className="text-xl font-bold text-slate-950">Safety Alerts</h3>
        <button
          onClick={onSettings}
          className="text-slate-600 hover:text-slate-950 flex items-center gap-2 text-sm font-medium"
        >
          <CogIcon className="w-4 h-4" />
          Settings
        </button>
      </div>

      <div className={`border rounded-xl p-4 flex items-start gap-4 ${bgColors[type]}`}>
        <div className={`rounded-lg p-2 flex-shrink-0 ${iconColors[type]}`}>
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-950">{message}</p>
        </div>
      </div>
    </div>
  );
};