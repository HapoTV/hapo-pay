import React from 'react';
import { Logo } from '../../../components/Logo';
import { CloseIcon, NotificationsIcon, LogoutIcon } from '../../../components/icons';
 
interface DashboardTopbarProps {
  title: string;
  onClose?: () => void;
  onToggleNotifications?: () => void;
  onLogout?: () => void;
  isDarkMode?: boolean;
  onToggleMode?: () => void;
}
 
export const DashboardTopbar: React.FC<DashboardTopbarProps> = ({
  title,
  onClose,
  onToggleNotifications,
  onLogout,
  isDarkMode = true,
  onToggleMode,
}) => {
  return (
    <nav
      className="sticky top-0 z-50 text-white px-6 py-4 shadow-lg border-b border-[#2A2740]"
      style={{ background: 'linear-gradient(135deg, #7C5CFC 0%, #3ED9C2 100%)' }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center h-10 overflow-visible">
          <Logo className="h-14 w-14 -mt-2 object-contain" alt="HapoPay logo" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {onClose ? (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-bold transition"
            >
              <CloseIcon className="w-5 h-5" />
              Close
            </button>
          ) : (
            <>
              {onToggleMode && (
                <button
                  type="button"
                  onClick={onToggleMode}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition"
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  aria-label="Toggle color mode"
                >
                  {isDarkMode ? (
                    // Sun icon — shown so the user can switch to light mode
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </svg>
                  ) : (
                    // Moon icon — shown so the user can switch to dark mode
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                  )}
                </button>
              )}
              {onToggleNotifications && (
                <button
                  type="button"
                  onClick={onToggleNotifications}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition"
                  title="Notifications"
                >
                  <NotificationsIcon className="w-6 h-6" />
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-bold transition"
                >
                  <LogoutIcon className="w-5 h-5" />
                  Logout
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
 