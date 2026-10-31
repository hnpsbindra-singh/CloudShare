import React, { useState } from 'react';
import {
  Code,
  File,
  FileAudio,
  FileCode,
  FileImage,
  FileText,
  FileVideo,
  MoreVertical,
  Pencil,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { FileItem } from '../../../types';
import { formatDate, getFileCategory } from '../../../utils/formatters';

interface FileCardProps {
  file: FileItem;
  onOpen: (file: FileItem) => void;
  onAiSummarize: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onOpen,
  onAiSummarize,
  onRename,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const category = getFileCategory(file.name);

  const getCategoryTheme = () => {
    switch (category) {
      case 'audio':
        return {
          icon: <FileAudio className="w-8 h-8 text-violet-500" />,
          bg: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400',
          badge: 'Audio',
        };
      case 'code':
        return {
          icon: <Code className="w-8 h-8 text-sky-500" />,
          bg: 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400',
          badge: 'Source Code',
        };
      case 'image':
        return {
          icon: <FileImage className="w-8 h-8 text-emerald-500" />,
          bg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
          badge: 'Image',
        };
      case 'video':
        return {
          icon: <FileVideo className="w-8 h-8 text-rose-500" />,
          bg: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
          badge: 'Video',
        };
      case 'pdf':
        return {
          icon: <FileText className="w-8 h-8 text-red-500" />,
          bg: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
          badge: 'PDF',
        };
      case 'document':
        return {
          icon: <FileCode className="w-8 h-8 text-indigo-500" />,
          bg: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
          badge: 'Document',
        };
      default:
        return {
          icon: <File className="w-8 h-8 text-surface-400" />,
          bg: 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400',
          badge: 'File',
        };
    }
  };

  const theme = getCategoryTheme();

  return (
    <div
      onClick={() => onOpen(file)}
      className="group relative flex flex-col justify-between p-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/5 transition-all select-none cursor-pointer"
    >
      {/* Top row: Badge & Menu */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${theme.bg}`}>
          {theme.badge}
        </span>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
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
                className="absolute right-0 top-7 z-30 w-36 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95"
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onAiSummarize(file);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 font-medium transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Summary</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onRename(file);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-surface-400" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(file);
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

      {/* Center Icon preview */}
      <div className="flex items-center justify-center py-6 group-hover:scale-105 transition-transform duration-200">
        <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-950/60 ring-1 ring-surface-100 dark:ring-surface-800">
          {theme.icon}
        </div>
      </div>

      {/* Bottom meta & One-Click AI pill */}
      <div className="space-y-2 pt-2 border-t border-surface-100 dark:border-surface-800/80">
        <div>
          <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-[11px] text-surface-400 mt-0.5">
            {formatDate(file.creationTime)}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAiSummarize(file);
          }}
          className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/70 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors border border-brand-200/50 dark:border-brand-800/50"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Summarize with AI</span>
        </button>
      </div>
    </div>
  );
};
