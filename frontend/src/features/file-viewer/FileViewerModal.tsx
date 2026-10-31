import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Download,
  ExternalLink,
  FileAudio,
  FileCode,
  FileText,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';
import { folderApi } from '../../api/folder.api';
import { useExplorerStore } from '../../stores/explorerStore';
import { formatDate, getFileCategory } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';

export const FileViewerModal: React.FC = () => {
  const { selectedFile, isFileViewerOpen, closeFileViewer, openAiDrawer } = useExplorerStore();

  const fileId = selectedFile?.id;

  const { data: fileData, isLoading } = useQuery({
    queryKey: ['fileUrl', fileId],
    queryFn: () => folderApi.getFileUrl(fileId!),
    enabled: !!fileId && isFileViewerOpen,
    staleTime: 10 * 60 * 1000,
  });

  if (!isFileViewerOpen || !selectedFile) return null;

  const category = getFileCategory(selectedFile.name);
  const fileUrl = fileData?.url;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-16 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-xs text-surface-400">Loading asset from Cloudinary CDN...</p>
        </div>
      );
    }

    if (!fileUrl) {
      return (
        <div className="p-12 text-center text-xs text-surface-400">
          Unable to resolve secure download link.
        </div>
      );
    }

    switch (category) {
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center p-8 space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-inner">
              <FileAudio className="w-10 h-10 animate-pulse" />
            </div>
            <audio controls src={fileUrl} className="w-full max-w-md rounded-xl">
              Your browser does not support the audio player.
            </audio>
          </div>
        );

      case 'image':
        return (
          <div className="flex items-center justify-center max-h-[60vh] overflow-hidden rounded-xl bg-surface-950/5 dark:bg-surface-950/40 p-2">
            <img
              src={fileUrl}
              alt={selectedFile.name}
              className="max-h-[58vh] max-w-full object-contain rounded-lg shadow-sm"
            />
          </div>
        );

      case 'video':
        return (
          <div className="flex items-center justify-center max-h-[60vh] overflow-hidden rounded-xl bg-surface-950/10">
            <video controls src={fileUrl} className="max-h-[58vh] w-full rounded-lg">
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'pdf':
        return (
          <div className="w-full h-[60vh] rounded-xl overflow-hidden border border-surface-200 dark:border-surface-800">
            <iframe src={fileUrl} title={selectedFile.name} className="w-full h-full" />
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="p-4 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-500">
              {category === 'code' ? <FileCode className="w-10 h-10 text-sky-500" /> : <FileText className="w-10 h-10" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{selectedFile.name}</p>
              <p className="text-xs text-surface-400 mt-1">Preview not directly streamable in browser.</p>
            </div>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Asset</span>
            </a>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm" onClick={closeFileViewer} />

      <div className="relative w-full max-w-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-800">
          <div className="min-w-0 flex-1 pr-4">
            <h3 className="text-base font-bold text-surface-900 dark:text-surface-100 truncate">
              {selectedFile.name}
            </h3>
            <p className="text-xs text-surface-400">
              Uploaded {formatDate(selectedFile.creationTime)} by {selectedFile.ownerName}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                closeFileViewer();
                openAiDrawer(selectedFile);
              }}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
            >
              AI Summary
            </Button>

            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-surface-500 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                title="Open raw CDN link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={closeFileViewer}
              className="p-2 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Preview Box */}
        <div className="p-4 flex-1 overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
};
