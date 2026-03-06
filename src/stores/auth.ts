import { create } from 'zustand';

interface User {
  id: string;
  username: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  clearUser: () => set({ user: null, loading: false }),
  setLoading: (loading) => set({ loading }),
}));
