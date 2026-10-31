import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useExplorerStore } from '../../stores/explorerStore';

export const Breadcrumbs: React.FC = () => {
  const { breadcrumbs, navigateToBreadcrumb } = useExplorerStore();

  return (
    <nav className="flex items-center space-x-1.5 text-xs sm:text-sm text-surface-500 overflow-x-auto py-1">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <React.Fragment key={item.id || 'root'}>
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-surface-400 flex-shrink-0" />}
            <button
              onClick={() => navigateToBreadcrumb(index)}
              className={`flex items-center space-x-1.5 px-2 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
                isLast
                  ? 'text-surface-900 dark:text-surface-100 font-semibold cursor-default'
                  : 'hover:text-brand-600 dark:hover:text-brand-400 hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}
            >
              {index === 0 && <Home className="w-3.5 h-3.5" />}
              <span>{item.name}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
