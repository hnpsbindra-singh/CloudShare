import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { folderApi } from '../../../api/folder.api';
import { getApiErrorMessage } from '../../../config/api';
import { useExplorerStore } from '../../../stores/explorerStore';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ isOpen, onClose }) => {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');
  const { currentFolderId } = useExplorerStore();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => folderApi.createFolder(folderName.trim(), currentFolderId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folderContents', currentFolderId] });
      setFolderName('');
      setError('');
      onClose();
    },
    onError: (err) => {
      setError(getApiErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }
    setError('');
    mutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Folder"
      description="Organize your files in a new directory"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </div>
        )}

        <Input
          label="Folder Name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="e.g. Design Assets, Research, Q3 Docs"
          autoFocus
          required
        />

        <div className="flex items-center justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={mutation.isPending}>
            Create Folder
          </Button>
        </div>
      </form>
    </Modal>
  );
};
