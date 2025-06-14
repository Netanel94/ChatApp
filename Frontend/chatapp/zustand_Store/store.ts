// store/userStore.ts
import { create, useStore } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  _id: string;
  username: string;
  password: string;
  BlockedList: [string];
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  clearUser: () => void;
  updateUser: (userData: any) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,
      setUser: (user) => set({ user, loading: false, error: null }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error, loading: false }),
      clearUser: () => set({ user: null, error: null }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : userData,
        })),
    }),
    {
      name: "user-storage",
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);
