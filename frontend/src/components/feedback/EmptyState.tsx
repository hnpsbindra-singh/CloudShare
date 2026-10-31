import React from 'react';
import { FolderOpen, Search, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  type?: 'folder' | 'search' | 'ai';
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'folder',
  title,
  description,
  action,
}) => {
  const configs = {
    folder: {
      icon: <FolderOpen className="w-10 h-10 text-surface-400" />,
      defaultTitle: 'This folder is empty',
      defaultDesc: 'Upload files or create subfolders to start organizing your assets.',
    },
    search: {
      icon: <Search className="w-10 h-10 text-surface-400" />,
      defaultTitle: 'No matches found',
      defaultDesc: 'Try adjusting your search keywords to find what you are looking for.',
    },
    ai: {
      icon: <Sparkles className="w-10 h-10 text-brand-500" />,
      defaultTitle: 'No file selected for AI Analysis',
      defaultDesc: 'Select any document, code file, or audio to generate an instant multimodal summary.',
    },
  };

  const current = configs[type];

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-surface-300 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/30">
      <div className="p-4 rounded-2xl bg-surface-100 dark:bg-surface-800/80 mb-4 ring-1 ring-surface-200 dark:ring-surface-700">
        {current.icon}
      </div>
      <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-1">
        {title || current.defaultTitle}
      </h3>
      <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm mb-6">
        {description || current.defaultDesc}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
