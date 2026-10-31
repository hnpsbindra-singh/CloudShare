import { create } from 'zustand';
import { UserProfile } from '../types';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('cloudshare_jwt'),
  user: null,
  isAuthenticated: !!localStorage.getItem('cloudshare_jwt'),
  setToken: (token: string) => {
    localStorage.setItem('cloudshare_jwt', token);
    set({ token, isAuthenticated: true });
  },
  setUser: (user: UserProfile) => {
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('cloudshare_jwt');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
