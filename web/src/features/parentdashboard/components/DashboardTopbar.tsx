import React from 'react';
import { Logo } from '../../../components/Logo';
import { CloseIcon, SearchIcon, NotificationsIcon, LogoutIcon } from '../../../components/icons';

interface DashboardTopbarProps {
  title: string;
  onClose?: () => void;
  onSearch?: () => void;
  onToggleNotifications?: () => void;
  onLogout?: () => void;
}

export const DashboardTopbar: React.FC<DashboardTopbarProps> = ({
  title,
  onClose,
  onSearch,
  onToggleNotifications,
  onLogout,
}) => {
  return (
    <nav className="sticky top-0 z-50 bg-white text-slate-900 border-b border-slate-200 px-3 py-3 shadow-sm transition-colors duration-200 dark:bg-[#1A1830] dark:text-white dark:border-[#2A2740] dark:shadow-lg sm:px-6 sm:py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-2 sm:gap-4">
        <div className="flex items-center h-10 overflow-visible">
          <Logo className="h-10 w-10 object-contain sm:h-14 sm:w-14 sm:-mt-2" alt="HapoPay logo" />
        </div>
        <div className="text-center">
          <h1 className="text-sm font-bold sm:text-lg">{title}</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {onClose ? (
            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold transition hover:bg-slate-200 dark:bg-white/20 dark:hover:bg-white/30 sm:px-4 sm:text-sm"
            >
              <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Close</span>
            </button>
          ) : (
            <>
              {onSearch && (
                <button
                  type="button"
                  onClick={onSearch}
                  className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 transition hover:bg-slate-200 dark:bg-white/20 dark:hover:bg-white/30 sm:h-10 sm:w-10"
                  title="Search"
                >
                  <SearchIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                </button>
              )}

              {onToggleNotifications && (
                <button
                  type="button"
                  onClick={onToggleNotifications}
                  className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 transition hover:bg-slate-200 dark:bg-white/20 dark:hover:bg-white/30 sm:h-10 sm:w-10"
                  title="Notifications"
                >
                  <NotificationsIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold transition hover:bg-slate-200 dark:bg-white/20 dark:hover:bg-white/30 sm:px-4 sm:text-sm"
                >
                  <LogoutIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};