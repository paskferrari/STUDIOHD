import { create } from 'zustand';

interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  roles: string[];
  level: number;
  xp: number;
  streak_days: number;
  onboarding_completed: boolean;
  goals: string[];
  is_admin: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
