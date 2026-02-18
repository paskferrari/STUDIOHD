import { create } from 'zustand';
import { supabase } from '../lib/supabase';

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
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user, 
    isLoading: false 
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  
  checkAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userData = {
          user_id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!,
          picture: session.user.user_metadata?.picture || null,
          roles: [],
          level: 1,
          xp: 0,
          streak_days: 0,
          onboarding_completed: !!session.user.user_metadata?.onboarding_completed,
          goals: [],
          is_admin: false,
        };
        set({ user: userData, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
