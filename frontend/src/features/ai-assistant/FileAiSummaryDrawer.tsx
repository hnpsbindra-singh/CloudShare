import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bot,
  Check,
  Copy,
  FileText,
  RotateCw,
  Sparkles,
  X,
} from 'lucide-react';
import { folderApi } from '../../api/folder.api';
import { getApiErrorMessage } from '../../config/api';
import { useExplorerStore } from '../../stores/explorerStore';
import { formatDate, getFileCategory } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';

export const FileAiSummaryDrawer: React.FC = () => {
  const { selectedFile, isAiDrawerOpen, closeAiDrawer } = useExplorerStore();
  const [copied, setCopied] = useState(false);

  const fileId = selectedFile?.id;

  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['fileSummary', fileId],
    queryFn: () => folderApi.summariseFile(fileId!),
    enabled: !!fileId && isAiDrawerOpen,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    retry: 1,
  });

  if (!isAiDrawerOpen || !selectedFile) return null;

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const category = getFileCategory(selectedFile.name);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-950/40 backdrop-blur-sm transition-opacity"
        onClick={closeAiDrawer}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white dark:bg-surface-900 border-l border-surface-200 dark:border-surface-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-surface-900 dark:text-surface-100 flex items-center space-x-2">
                <span>Spring AI Analysis</span>
              </h3>
              <p className="text-xs text-surface-400">
                Multimodal file summarization powered by OpenRouter
              </p>
            </div>
          </div>

          <button
            onClick={closeAiDrawer}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Metadata Card */}
        <div className="px-5 py-3.5 bg-surface-50 dark:bg-surface-950/50 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5 min-w-0">
            <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <div className="truncate">
              <p className="font-semibold text-surface-900 dark:text-surface-100 truncate">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-surface-400">
                Uploaded {formatDate(selectedFile.creationTime)}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300">
            {category}
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading || isFetching ? (
            <div className="space-y-4 py-8">
              <div className="flex items-center space-x-3 text-brand-600 dark:text-brand-400 animate-pulse">
                <Bot className="w-6 h-6 animate-spin" />
                <span className="text-sm font-semibold">
                  Analyzing document contents with Spring AI...
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded-lg w-full animate-pulse" />
                <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded-lg w-11/12 animate-pulse" />
                <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded-lg w-4/5 animate-pulse" />
                <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded-lg w-3/4 animate-pulse" />
              </div>
            </div>
          ) : isError ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 space-y-2">
              <p className="font-bold">AI Analysis Failed</p>
              <p>{getApiErrorMessage(error)}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                leftIcon={<RotateCw className="w-3.5 h-3.5" />}
              >
                Retry Analysis
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-950/60 border border-surface-200 dark:border-surface-800 text-sm leading-relaxed text-surface-800 dark:text-surface-200 font-sans shadow-sm whitespace-pre-wrap">
                {summary}
              </div>

              {/* Informative Spring AI badge */}
              <div className="p-3.5 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200/50 dark:border-brand-900/40 text-[11px] text-brand-700 dark:text-brand-300">
                <p className="font-semibold mb-0.5">🧠 Conversational Memory Active</p>
                <p className="opacity-90">
                  This summary is linked to conversation ID <code className="font-mono text-[10px]">{selectedFile.id}</code> in Spring AI.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-surface-200 dark:border-surface-800 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            leftIcon={<RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
          >
            Regenerate
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCopy}
            disabled={!summary || isLoading}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied to Clipboard' : 'Copy Summary'}
          </Button>
        </div>
      </div>
    </div>
  );
};
