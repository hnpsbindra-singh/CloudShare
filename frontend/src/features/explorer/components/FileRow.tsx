import React from 'react';
import {
  Code,
  File,
  FileAudio,
  FileCode,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  MoreVertical,
  Pencil,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { FileItem, FolderItem } from '../../../types';
import { formatDate, getFileCategory } from '../../../utils/formatters';

interface FileRowProps {
  item: FolderItem | FileItem;
  isFolder: boolean;
  onOpen: () => void;
  onAiSummarize?: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export const FileRow: React.FC<FileRowProps> = ({
  item,
  isFolder,
  onOpen,
  onAiSummarize,
  onRename,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const name = isFolder ? (item as FolderItem).folderName : (item as FileItem).name;
  const category = !isFolder ? getFileCategory(name) : null;

  const renderIcon = () => {
    if (isFolder) {
      return <Folder className="w-5 h-5 text-amber-500 fill-current" />;
    }
    switch (category) {
      case 'audio': return <FileAudio className="w-5 h-5 text-violet-500" />;
      case 'code': return <Code className="w-5 h-5 text-sky-500" />;
      case 'image': return <FileImage className="w-5 h-5 text-emerald-500" />;
      case 'video': return <FileVideo className="w-5 h-5 text-rose-500" />;
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'document': return <FileCode className="w-5 h-5 text-indigo-500" />;
      default: return <File className="w-5 h-5 text-surface-400" />;
    }
  };

  return (
    <tr
      onClick={onOpen}
      className="group hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer border-b border-surface-100 dark:border-surface-800/80 transition-colors select-none text-xs sm:text-sm"
    >
      <td className="py-3 px-4 flex items-center space-x-3 min-w-[200px]">
        <div className="flex-shrink-0">{renderIcon()}</div>
        <span className="font-medium text-surface-900 dark:text-surface-100 truncate max-w-xs sm:max-w-md">
          {name}
        </span>
      </td>

      <td className="py-3 px-4 text-surface-500 hidden md:table-cell">
        {isFolder ? 'Folder' : (category ? category.toUpperCase() : 'FILE')}
      </td>

      <td className="py-3 px-4 text-surface-500 hidden sm:table-cell">
        {item.ownerName || '-'}
      </td>

      <td className="py-3 px-4 text-surface-400 hidden lg:table-cell">
        {formatDate(item.creationTime)}
      </td>

      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
          {!isFolder && onAiSummarize && (
            <button
              onClick={onAiSummarize}
              title="Summarize with AI"
              className="p-1.5 rounded-lg text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-30 w-32 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-xl py-1 text-xs">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onRename();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
                  >
                    <Pencil className="w-3.5 h-3.5 text-surface-400" />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};
