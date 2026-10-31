import React, { useState } from 'react';
import { Folder, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { FolderItem } from '../../../types';
import { formatDate } from '../../../utils/formatters';

interface FolderCardProps {
  folder: FolderItem;
  onOpen: (folder: FolderItem) => void;
  onRename: (folder: FolderItem) => void;
  onDelete: (folder: FolderItem) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onOpen,
  onRename,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      onDoubleClick={() => onOpen(folder)}
      className="group relative flex items-center justify-between p-3.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl hover:border-brand-500/50 hover:shadow-md hover:shadow-brand-500/5 transition-all select-none cursor-pointer"
    >
      <div
        className="flex items-center space-x-3 min-w-0 flex-1"
        onClick={() => onOpen(folder)}
      >
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
          <Folder className="w-5 h-5 fill-current" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">
            {folder.folderName}
          </p>
          <p className="text-[11px] text-surface-400 truncate">
            {formatDate(folder.creationTime)}
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
              }}
            />
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-8 z-30 w-36 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95"
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onRename(folder);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-surface-400" />
                <span>Rename</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(folder);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
