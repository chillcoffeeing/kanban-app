import * as authApi from "@/services/auth";
import {
  setTokens,
  clearTokens,
  getAccessToken,
  ApiError,
} from "@/services/api";
import { useToastStore } from "@/stores/toastStore";

export function createAuthActions(set: any, get: any) {
  return {
    login: async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      setTokens(res.accessToken, res.refreshToken);
      window.location.href = "/boards";
    },

    register: async (email: string, name: string, password: string, extra?: { username?: string; displayName?: string; jobTitle?: string; company?: string }) => {
      const res = await authApi.register({ email, name, password, ...extra });
      setTokens(res.accessToken, res.refreshToken);
      window.location.href = "/boards";
    },

    hydrate: async () => {
      const token = getAccessToken();
      if (!token) return;
      try {
        const user = await authApi.account();
        set({ user, token, isAuthenticated: true });
      } catch (err) {
        if (
          err instanceof ApiError &&
          (err.status === 401 || err.status === 403)
        ) {
          clearTokens();
          set({ user: null, token: null, isAuthenticated: false });
        }
      }
    },

    logout: async () => {
      const refresh = localStorage.getItem("canvan_refresh_token");
      if (refresh) {
        try {
          await authApi.logout(refresh);
        } catch { /* ignore */
        }
      }
      clearTokens();
      set({ user: null, token: null, isAuthenticated: false });
      window.location.href = "/";
    },
  };
}
