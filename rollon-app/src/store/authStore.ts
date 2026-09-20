import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useDatabaseStore } from './databaseStore';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (response.ok) {
            const data = await response.json();
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }

          throw new Error('API Login failed');
        } catch {
          // Local Database Fallback — DEV ONLY.
          // Production must never silently fall back to fake auth.
          if (!import.meta.env.DEV) {
            set({ isLoading: false });
            return false;
          }

          const localUser = await useDatabaseStore.getState().verifyPassword(email, password);

          if (localUser) {
            console.warn('Backend offline: Using local database fallback for login.');
            set({
              user: {
                id: localUser.id,
                name: localUser.name,
                email: localUser.email,
                role: localUser.role as 'user' | 'admin',
                avatar: localUser.avatar,
              },
              token: crypto.randomUUID(),
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }

          set({ isLoading: false });
          return false;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });

          if (!response.ok) {
            throw new Error('Registration failed');
          }

          const data = await response.json();
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch {
          // Local Database Fallback — DEV ONLY.
          if (!import.meta.env.DEV) {
            set({ isLoading: false });
            return false;
          }

          const dbUsers = useDatabaseStore.getState().users;

          if (dbUsers.some((u) => u.email === email)) {
            set({ isLoading: false });
            return false;
          }

          const newUser = {
            id: 'user-' + Date.now(),
            name,
            email,
            password,
            role: 'user' as const,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(' ', '')}`,
          };
          await useDatabaseStore.getState().addUser(newUser);

          // Also create a Customer record so they show up in the Admin Dashboard
          useDatabaseStore.getState().addCustomer({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: '',
            totalSpent: 0,
            orders: 0,
            createdAt: new Date().toISOString(),
          });

          set({
            user: {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
              avatar: newUser.avatar,
            },
            token: crypto.randomUUID(),
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateProfile: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) return;

        try {
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const user = await response.json();
            set({ user, isAuthenticated: true });
          } else {
            get().logout();
          }
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'rollon-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);