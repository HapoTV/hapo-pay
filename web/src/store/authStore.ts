import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  role: "parent" | "student" | null;
  setAuth: (token: string, role: "parent" | "student", refreshToken: string) => void;
  setTokens: (token: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      role: null,
      setAuth: (token, role, refreshToken) =>
        set({ token, refreshToken, role }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      clearAuth: () => set({ token: null, refreshToken: null, role: null }),
    }),
    {
      name: "hapopay-auth",
      version: 1,
      merge: (persistedState, currentState) => {
        const persisted =
          typeof persistedState === "object" && persistedState !== null
            ? (persistedState as Partial<AuthState>)
            : {};
        if (typeof persisted.token === "string" && persisted.token.startsWith("demo-")) {
          return currentState;
        }

        return {
          ...currentState,
          ...persisted,
          refreshToken: persisted.refreshToken ?? null,
        };
      },
    }
  )
);
