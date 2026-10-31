import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FolderPlus,
  Upload,
} from 'lucide-react';
import { folderApi } from '../../api/folder.api';
import { FileItem, FolderItem } from '../../types';
import { useExplorerStore } from '../../stores/explorerStore';
import { EmptyState } from '../../components/feedback/EmptyState';
import { FolderGridSkeleton } from '../../components/feedback/Skeleton';
import { Button } from '../../components/ui/Button';
import { FileAiSummaryDrawer } from '../ai-assistant/FileAiSummaryDrawer';
import { FileViewerModal } from '../file-viewer/FileViewerModal';
import { CreateFolderModal } from './components/CreateFolderModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { FileCard } from './components/FileCard';
import { FileRow } from './components/FileRow';
import { FolderCard } from './components/FolderCard';
import { RenameModal } from './components/RenameModal';
import { UploadModal } from './components/UploadModal';

export const ExplorerView: React.FC = () => {
  const {
    currentFolderId,
    breadcrumbs,
    searchQuery,
    viewMode,
    setCurrentFolder,
    openFileViewer,
    openAiDrawer,
  } = useExplorerStore();

  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [selectedItemToRename, setSelectedItemToRename] = useState<FolderItem | FileItem | null>(null);
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);

  const [selectedItemToDelete, setSelectedItemToDelete] = useState<FolderItem | FileItem | null>(null);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);

  const currentFolderName = breadcrumbs[breadcrumbs.length - 1]?.name || 'My Files';

  // TanStack Query: switches between search results and folder contents
  const isSearchActive = !!searchQuery.trim();

  const { data: contents, isLoading, isError } = useQuery({
    queryKey: isSearchActive
      ? ['folderSearch', searchQuery]
      : ['folderContents', currentFolderId],
    queryFn: () =>
      isSearchActive
        ? folderApi.search(searchQuery.trim())
        : folderApi.getContents(currentFolderId || undefined),
    staleTime: 30000,
  });

  const folders = contents?.allFolders || [];
  const files = contents?.allFiles || [];
  const isEmpty = folders.length === 0 && files.length === 0;

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-200/80 dark:border-surface-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 flex items-center space-x-2.5">
            <span>{isSearchActive ? `Search: "${searchQuery}"` : currentFolderName}</span>
          </h1>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            {isSearchActive
              ? `Found ${folders.length} folder(s) and ${files.length} file(s)`
              : `${folders.length} folders, ${files.length} files`}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateFolderOpen(true)}
            leftIcon={<FolderPlus className="w-4 h-4 text-amber-500" />}
          >
            New Folder
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload File
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <FolderGridSkeleton />
      ) : isError ? (
        <div className="p-8 text-center text-sm text-rose-500">
          Failed to load assets. Please ensure you are logged in.
        </div>
      ) : isEmpty ? (
        <EmptyState
          type={isSearchActive ? 'search' : 'folder'}
          action={
            !isSearchActive && (
              <div className="flex items-center space-x-3">
                <Button size="sm" variant="outline" onClick={() => setIsCreateFolderOpen(true)}>
                  Create Folder
                </Button>
                <Button size="sm" onClick={() => setIsUploadOpen(true)}>
                  Upload File
                </Button>
              </div>
            )
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="space-y-8">
          {/* Folders Section */}
          {folders.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-surface-500">
                Folders ({folders.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onOpen={(f) => setCurrentFolder(f.id, f.folderName)}
                    onRename={(f) => {
                      setSelectedItemToRename(f);
                      setIsRenamingFolder(true);
                    }}
                    onDelete={(f) => {
                      setSelectedItemToDelete(f);
                      setIsDeletingFolder(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-surface-500">
                Files ({files.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                {files.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onOpen={openFileViewer}
                    onAiSummarize={openAiDrawer}
                    onRename={(f) => {
                      setSelectedItemToRename(f);
                      setIsRenamingFolder(false);
                    }}
                    onDelete={(f) => {
                      setSelectedItemToDelete(f);
                      setIsDeletingFolder(false);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800 text-[11px] font-bold uppercase tracking-wider text-surface-400 bg-surface-50 dark:bg-surface-950/50">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4 hidden md:table-cell">Type</th>
                <th className="py-3 px-4 hidden sm:table-cell">Owner</th>
                <th className="py-3 px-4 hidden lg:table-cell">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {folders.map((folder) => (
                <FileRow
                  key={folder.id}
                  item={folder}
                  isFolder={true}
                  onOpen={() => setCurrentFolder(folder.id, folder.folderName)}
                  onRename={() => {
                    setSelectedItemToRename(folder);
                    setIsRenamingFolder(true);
                  }}
                  onDelete={() => {
                    setSelectedItemToDelete(folder);
                    setIsDeletingFolder(true);
                  }}
                />
              ))}
              {files.map((file) => (
                <FileRow
                  key={file.id}
                  item={file}
                  isFolder={false}
                  onOpen={() => openFileViewer(file)}
                  onAiSummarize={() => openAiDrawer(file)}
                  onRename={() => {
                    setSelectedItemToRename(file);
                    setIsRenamingFolder(false);
                  }}
                  onDelete={() => {
                    setSelectedItemToDelete(file);
                    setIsDeletingFolder(false);
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals & Slide-outs */}
      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      <RenameModal
        isOpen={!!selectedItemToRename}
        onClose={() => setSelectedItemToRename(null)}
        item={selectedItemToRename}
        isFolder={isRenamingFolder}
        currentFolderId={currentFolderId}
      />

      <DeleteConfirmModal
        isOpen={!!selectedItemToDelete}
        onClose={() => setSelectedItemToDelete(null)}
        item={selectedItemToDelete}
        isFolder={isDeletingFolder}
        currentFolderId={currentFolderId}
      />

      <FileAiSummaryDrawer />
      <FileViewerModal />
    </div>
  );
};
