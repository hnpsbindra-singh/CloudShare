import { apiClient } from '../config/api';
import { StorageDetails, UpdateProfilePayload, UserProfile } from '../types';

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/user/me');
    return response.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<string> => {
    const response = await apiClient.patch<string>('/user/me', payload);
    return response.data;
  },

  getStorageUsage: async (): Promise<StorageDetails> => {
    const response = await apiClient.get<StorageDetails>('/user/storageUsage');
    return response.data;
  },
};
