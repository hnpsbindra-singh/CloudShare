import React from 'react';
import { LayoutGrid, List, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useExplorerStore } from '../../stores/explorerStore';
import { Breadcrumbs } from './Breadcrumbs';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileSidebar,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const { searchQuery, setSearchQuery, viewMode, toggleViewMode } = useExplorerStore();

  return (
    <header className="h-16 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block flex-1 max-w-md">
          <Breadcrumbs />
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-2">
        <div className="relative">
          <Search className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files & folders by name..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-surface-100 dark:bg-surface-800/80 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-surface-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-surface-900 dark:text-surface-100 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right controls: View Toggle & Theme Toggle */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        <button
          onClick={toggleViewMode}
          title={viewMode === 'grid' ? 'Switch to List view' : 'Switch to Grid view'}
          className="p-2 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          {viewMode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
        </button>

        <button
          onClick={onToggleDarkMode}
          title="Toggle Dark/Light Mode"
          className="p-2 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
