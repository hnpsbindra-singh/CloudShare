import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

function isJwtExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    // URL-safe base64 normalization for Safari WebKit
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const payload = JSON.parse(atob(base64));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cloudshare_jwt');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // When uploading FormData, let the browser attach the multipart boundary automatically
  if (config.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type'];
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const token = localStorage.getItem('cloudshare_jwt');
    const isProfileCheck = error.config?.url?.includes('/user/me');

    // Only force logout if the token is truly expired or the core user identity check fails
    if (error.response?.status === 401 && (isJwtExpired(token) || isProfileCheck)) {
      localStorage.removeItem('cloudshare_jwt');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Robust error extractor supporting Spring Boot ResponseStatusException,
 * RFC 7807 ProblemDetail, validation constraints, and plain string responses.
 */
export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === 'string' && data.trim()) return data;

    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;

      // RFC 7807 ProblemDetail 'detail'
      if (typeof obj.detail === 'string' && obj.detail.trim()) {
        return obj.detail;
      }

      // Spring ResponseStatusException 'message' or 'reason'
      if (typeof obj.message === 'string' && obj.message.trim() && !obj.message.includes('No message available')) {
        return obj.message;
      }
      if (typeof obj.reason === 'string' && obj.reason.trim()) {
        return obj.reason;
      }

      // Spring validation errors list
      if (Array.isArray(obj.errors) && obj.errors.length > 0) {
        const first = obj.errors[0];
        if (typeof first === 'object' && first !== null && 'defaultMessage' in first) {
          return String(first.defaultMessage);
        }
        return String(first);
      }

      // Status text or error name
      if (typeof obj.error === 'string' && obj.error.trim()) {
        return obj.error;
      }
      if (typeof obj.title === 'string' && obj.title.trim()) {
        return obj.title;
      }
    }

    if (error.response?.status === 413) {
      return 'Not enough space: File exceeds your storage limit.';
    }
    if (error.response?.status === 504) {
      return 'Verification code has expired. Please request a new one.';
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'An unexpected error occurred. Please try again.';
};
