import { create } from 'zustand';
import { FileItem } from '../types';

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

interface ExplorerState {
  currentFolderId: string | null;
  breadcrumbs: BreadcrumbItem[];
  searchQuery: string;
  selectedFile: FileItem | null;
  isFileViewerOpen: boolean;
  isAiDrawerOpen: boolean;
  viewMode: 'grid' | 'table';

  setCurrentFolder: (folderId: string | null, folderName?: string) => void;
  navigateToBreadcrumb: (index: number) => void;
  setSearchQuery: (query: string) => void;
  setSelectedFile: (file: FileItem | null) => void;
  openFileViewer: (file: FileItem) => void;
  closeFileViewer: () => void;
  openAiDrawer: (file: FileItem) => void;
  closeAiDrawer: () => void;
  toggleViewMode: () => void;
}

export const useExplorerStore = create<ExplorerState>((set, get) => ({
  currentFolderId: null,
  breadcrumbs: [{ id: null, name: 'Home' }],
  searchQuery: '',
  selectedFile: null,
  isFileViewerOpen: false,
  isAiDrawerOpen: false,
  viewMode: 'grid',

  setCurrentFolder: (folderId: string | null, folderName?: string) => {
    if (folderId === null) {
      set({
        currentFolderId: null,
        breadcrumbs: [{ id: null, name: 'Home' }],
        searchQuery: '',
      });
      return;
    }

    const { breadcrumbs } = get();
    const existingIndex = breadcrumbs.findIndex((b) => b.id === folderId);
    if (existingIndex !== -1) {
      set({
        currentFolderId: folderId,
        breadcrumbs: breadcrumbs.slice(0, existingIndex + 1),
        searchQuery: '',
      });
    } else {
      set({
        currentFolderId: folderId,
        breadcrumbs: [...breadcrumbs, { id: folderId, name: folderName || 'Folder' }],
        searchQuery: '',
      });
    }
  },

  navigateToBreadcrumb: (index: number) => {
    const { breadcrumbs } = get();
    if (index >= 0 && index < breadcrumbs.length) {
      const target = breadcrumbs[index];
      set({
        currentFolderId: target.id,
        breadcrumbs: breadcrumbs.slice(0, index + 1),
        searchQuery: '',
      });
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedFile: (file: FileItem | null) => set({ selectedFile: file }),

  openFileViewer: (file: FileItem) =>
    set({ selectedFile: file, isFileViewerOpen: true }),
  closeFileViewer: () => set({ isFileViewerOpen: false }),

  openAiDrawer: (file: FileItem) =>
    set({ selectedFile: file, isAiDrawerOpen: true }),
  closeAiDrawer: () => set({ isAiDrawerOpen: false }),

  toggleViewMode: () =>
    set((state) => ({ viewMode: state.viewMode === 'grid' ? 'table' : 'grid' })),
}));
