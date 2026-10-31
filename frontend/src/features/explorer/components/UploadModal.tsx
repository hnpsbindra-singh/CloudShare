import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, FileUp, UploadCloud, X } from 'lucide-react';
import { folderApi } from '../../../api/folder.api';
import { userApi } from '../../../api/user.api';
import { getApiErrorMessage } from '../../../config/api';
import { useExplorerStore } from '../../../stores/explorerStore';
import { formatBytes } from '../../../utils/formatters';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { currentFolderId } = useExplorerStore();
  const queryClient = useQueryClient();

  const { data: storage } = useQuery({
    queryKey: ['storageUsage'],
    queryFn: userApi.getStorageUsage,
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!selectedFile) throw new Error('No file selected');
      return folderApi.uploadFile(selectedFile, currentFolderId || undefined, (percent) => {
        setProgress(percent);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folderContents', currentFolderId] });
      queryClient.invalidateQueries({ queryKey: ['storageUsage'] });
      resetAndClose();
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ['storageUsage'] });
      setErrorMessage(getApiErrorMessage(err));
    },
  });

  const resetAndClose = () => {
    setSelectedFile(null);
    setProgress(0);
    setErrorMessage('');
    onClose();
  };

  const handleFileSelect = (file: File) => {
    setErrorMessage('');
    const used = storage?.storageUsed ?? 0;
    const limit = storage?.storageLimit ?? 1073741824;

    if (used + file.size > limit) {
      setErrorMessage(
        `File size (${formatBytes(file.size)}) exceeds your remaining storage quota (${formatBytes(
          limit - used
        )}).`
      );
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Upload Asset"
      description="Upload documents, code, audio, or media directly to CloudShare"
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="flex items-start space-x-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!selectedFile ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              isDragOver
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
                : 'border-surface-300 dark:border-surface-700 hover:border-brand-400 bg-surface-50 dark:bg-surface-950/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
            <div className="p-3 rounded-2xl bg-white dark:bg-surface-900 shadow-sm border border-surface-200 dark:border-surface-800 mb-3">
              <UploadCloud className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            </div>
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">
              Click to select or drag & drop
            </p>
            <p className="text-xs text-surface-400 mt-1">
              Supports Audio, Source Code, PDFs, Images, and Documents (up to 800MB)
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-950/60 border border-surface-200 dark:border-surface-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400">
                  <FileUp className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-surface-900 dark:text-surface-100 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-surface-400">{formatBytes(selectedFile.size)}</p>
                </div>
              </div>

              {!uploadMutation.isPending && (
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1 rounded-md text-surface-400 hover:text-surface-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {uploadMutation.isPending && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-medium text-surface-500">
                  <span>Uploading to Cloudinary...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetAndClose}
            disabled={uploadMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!selectedFile || uploadMutation.isPending}
            isLoading={uploadMutation.isPending}
            onClick={() => uploadMutation.mutate()}
          >
            Upload File
          </Button>
        </div>
      </div>
    </Modal>
  );
};
