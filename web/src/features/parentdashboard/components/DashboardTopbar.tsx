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
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-4 shadow-lg">
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
              {onSearch && (
                <button
                  type="button"
                  onClick={onSearch}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition"
                  title="Search"
                >
                  <SearchIcon className="w-6 h-6" />
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
