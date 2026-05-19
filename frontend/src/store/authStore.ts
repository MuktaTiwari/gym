import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, User } from "../types/auth.types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (user: User, accessToken: string, refreshToken: string) => {
        set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
      },
      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken, isAuthenticated: true });
      },
      logoutAction: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
      },
      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },
    }),
    {
      name: "fitcore-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
