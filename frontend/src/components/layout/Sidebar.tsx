import React from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Cloud, Folder, HardDrive, LogOut, User } from 'lucide-react';
import { userApi } from '../../api/user.api';
import { useAuthStore } from '../../stores/authStore';
import { useExplorerStore } from '../../stores/explorerStore';
import { formatBytes } from '../../utils/formatters';
import { ProgressBar } from '../ui/ProgressBar';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { logout, user } = useAuthStore();
  const { setCurrentFolder } = useExplorerStore();

  const { data: storage } = useQuery({
    queryKey: ['storageUsage'],
    queryFn: userApi.getStorageUsage,
    staleTime: 30000,
  });

  const handleNavHome = () => {
    setCurrentFolder(null);
    onCloseMobile?.();
  };

  const used = storage?.storageUsed ?? 0;
  const limit = storage?.storageLimit ?? 1073741824;

  return (
    <aside className="w-64 h-full flex flex-col bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-surface-100 dark:border-surface-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-surface-900 dark:text-surface-50">
              CloudShare
            </span>
            <span className="block text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400 tracking-wider">
              Asset Workspace
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavLink
          to="/"
          onClick={handleNavHome}
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
            }`
          }
        >
          <Folder className="w-4 h-4" />
          <span>My Files</span>
        </NavLink>

        <NavLink
          to="/profile"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
            }`
          }
        >
          <User className="w-4 h-4" />
          <span>Profile & Account</span>
        </NavLink>
      </div>

      {/* Storage Quota Card */}
      <div className="p-4 m-3 rounded-2xl bg-surface-50 dark:bg-surface-950/60 border border-surface-200/80 dark:border-surface-800 space-y-3">
        <div className="flex items-center space-x-2 text-surface-700 dark:text-surface-300">
          <HardDrive className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span className="text-xs font-semibold">Storage Quota</span>
        </div>

        <ProgressBar used={used} total={limit} />

        <div className="flex items-center justify-between text-[11px] text-surface-500">
          <span>{formatBytes(used)} used</span>
          <span>{formatBytes(limit)}</span>
        </div>
      </div>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 flex items-center justify-center font-semibold text-xs flex-shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-surface-900 dark:text-surface-100 truncate">
              {user?.name || 'Authenticated User'}
            </p>
            <p className="text-[11px] text-surface-400 truncate">{user?.username}</p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign out"
          className="p-1.5 rounded-lg text-surface-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
