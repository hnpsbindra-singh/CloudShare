import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { folderApi } from '../../../api/folder.api';
import { getApiErrorMessage } from '../../../config/api';
import { FileItem, FolderItem } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FolderItem | FileItem | null;
  isFolder: boolean;
  currentFolderId: string | null;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  onClose,
  item,
  isFolder,
  currentFolderId,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (item) {
      setName(isFolder ? (item as FolderItem).folderName : (item as FileItem).name);
    }
  }, [item, isFolder]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!item) throw new Error('No item to rename');
      return isFolder
        ? folderApi.renameFolder(item.id, name.trim())
        : folderApi.renameFile(item.id, name.trim());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folderContents', currentFolderId] });
      setError('');
      onClose();
    },
    onError: (err) => {
      setError(getApiErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }
    mutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isFolder ? 'Rename Folder' : 'Rename File'}
      description="Update the name of this asset"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </div>
        )}

        <Input
          label="New Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />

        <div className="flex items-center justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={mutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
