import { apiClient } from '../config/api';
import {
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyOtpPayload,
} from '../types';

export const authApi = {
  login: async (payload: LoginPayload): Promise<string> => {
    const response = await apiClient.post<string>('/auth/login', payload);
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<string> => {
    const response = await apiClient.post<string>('/auth/register', payload);
    return response.data;
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<string> => {
    const response = await apiClient.post<string>('/auth/verify-otp', payload);
    return response.data;
  },

  sendResetOtp: async (username: string): Promise<string> => {
    const response = await apiClient.post<string>('/auth/send-otp', null, {
      params: { username },
    });
    return response.data;
  },

  verifyResetPassword: async (payload: ResetPasswordPayload): Promise<string> => {
    const response = await apiClient.put<string>('/auth/verify-otp', payload);
    return response.data;
  },
};
