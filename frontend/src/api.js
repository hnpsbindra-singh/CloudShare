import axios from 'axios';

const BASE_URL = 'https://cloudshare-le1b.onrender.com';

const authAxios = axios.create({ baseURL: BASE_URL });

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => authAxios.post('/api/auth/register', data),
  verifyOtp: (data) => authAxios.post('/api/auth/verify-otp', data),
  login: (data) => authAxios.post('/api/auth/login', data),
  sendOtp: (username) => authAxios.post(`/api/auth/send-otp?username=${encodeURIComponent(username)}`),
  resetPassword: (data) => authAxios.put('/api/auth/verify-otp', data),
};

export const userAPI = {
  getProfile: () => api.get('/api/user/me'),
  updateProfile: (data) => api.patch('/api/user/me', data),
  getStorageUsage: () => api.get('/api/user/storageUsage'),
};

export const folderAPI = {
  getContents: (parentId) =>
    api.get('/api/folder', { params: parentId ? { parentId } : {} }),
  createFolder: (parentId, data) =>
    api.post('/api/folder', data, { params: parentId ? { parentId } : {} }),
  renameFolder: (folderId, name) =>
    api.patch(`/api/folder/${folderId}`, null, { params: { name } }),
  deleteFolder: (folderId) => api.delete(`/api/folder/${folderId}`),
  uploadFile: (file, folderId, onProgress) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/api/folder/upload', form, {
      params: folderId ? { folderId } : {},
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
  },
  getFileUrl: (fileId) => api.get(`/api/folder/file/${fileId}`),
  renameFile: (fileId, name) =>
    api.patch(`/api/folder/file/${fileId}`, null, { params: { name } }),
  deleteFile: (fileId) => api.delete(`/api/folder/file/${fileId}`),
  search: (query) => api.get('/api/folder/files/search', { params: { query } }),
};

export default api;
