import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { folderApi } from '../../../api/folder.api';
import { getApiErrorMessage } from '../../../config/api';
import { FileItem, FolderItem } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FolderItem | FileItem | null;
  isFolder: boolean;
  currentFolderId: string | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  item,
  isFolder,
  currentFolderId,
}) => {
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const name = item ? (isFolder ? (item as FolderItem).folderName : (item as FileItem).name) : '';

  const mutation = useMutation({
    mutationFn: () => {
      if (!item) throw new Error('No item to delete');
      return isFolder ? folderApi.deleteFolder(item.id) : folderApi.deleteFile(item.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folderContents', currentFolderId] });
      queryClient.invalidateQueries({ queryKey: ['storageUsage'] });
      setError('');
      onClose();
    },
    onError: (err) => {
      setError(getApiErrorMessage(err));
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isFolder ? 'Delete Folder' : 'Delete File'}
      maxWidth="sm"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </div>
        )}

        <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <p className="font-semibold mb-1">
              Are you sure you want to delete <span className="underline font-bold">"{name}"</span>?
            </p>
            <p>
              {isFolder
                ? 'Any files or subfolders inside will be safely moved to your Home directory before this folder is removed.'
                : 'This will permanently delete the asset from Cloudinary CDN and recover your storage quota.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Confirm Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
