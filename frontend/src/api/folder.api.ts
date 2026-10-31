import { apiClient } from '../config/api';
import { FileReturnDTO, FolderContents } from '../types';

export const folderApi = {
  getContents: async (parentId?: string): Promise<FolderContents> => {
    const response = await apiClient.get<FolderContents>('/folder', {
      params: parentId ? { parentId } : {},
    });
    return response.data;
  },

  createFolder: async (folderName: string, parentId?: string): Promise<string> => {
    const response = await apiClient.post<string>(
      '/folder',
      { folderName },
      { params: parentId ? { parentId } : {} }
    );
    return response.data;
  },

  renameFolder: async (folderId: string, name: string): Promise<string> => {
    const response = await apiClient.patch<string>(`/folder/${folderId}`, null, {
      params: { name },
    });
    return response.data;
  },

  deleteFolder: async (folderId: string): Promise<string> => {
    const response = await apiClient.delete<string>(`/folder/${folderId}`);
    return response.data;
  },

  uploadFile: async (
    file: File,
    folderId?: string,
    onProgress?: (percent: number) => void
  ): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<string>('/folder/upload', formData, {
      params: folderId ? { folderId } : {},
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return response.data;
  },

  getFileUrl: async (fileId: string): Promise<FileReturnDTO> => {
    const response = await apiClient.get<FileReturnDTO>(`/folder/file/${fileId}`);
    return response.data;
  },

  renameFile: async (fileId: string, name: string): Promise<string> => {
    const response = await apiClient.patch<string>(`/folder/file/${fileId}`, null, {
      params: { name },
    });
    return response.data;
  },

  deleteFile: async (fileId: string): Promise<string> => {
    const response = await apiClient.delete<string>(`/folder/file/${fileId}`);
    return response.data;
  },

  search: async (query: string): Promise<FolderContents> => {
    const response = await apiClient.get<FolderContents>('/folder/files/search', {
      params: { query },
    });
    return response.data;
  },

  summariseFile: async (fileId: string): Promise<string> => {
    const response = await apiClient.get<string>(`/folder/file/${fileId}/summarise`);
    return response.data;
  },
};
