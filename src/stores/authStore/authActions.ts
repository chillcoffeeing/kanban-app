import * as authApi from "@/services/auth";
import {
  setTokens,
  clearTokens,
  getAccessToken,
  ApiError,
} from "@/services/api";
import { fromBackend, persistUser, readStoredUser, USER_KEY } from "./utils";

export function createAuthActions(set: any, get: any) {
  return {
    login: async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      setTokens(res.accessToken, res.refreshToken);
      const user = fromBackend(res.user);
      persistUser(user);
      set({ user, token: res.accessToken, isAuthenticated: true });
    },

    register: async (email: string, name: string, password: string) => {
      const res = await authApi.register(email, name, password);
      setTokens(res.accessToken, res.refreshToken);
      const user = fromBackend(res.user);
      persistUser(user);
      set({ user, token: res.accessToken, isAuthenticated: true });
    },

    hydrate: async () => {
      const token = getAccessToken();
      if (!token) return;
      try {
        const raw = await authApi.account();
        const user = fromBackend(raw);
        persistUser(user);
        set({ user, token, isAuthenticated: true });
      } catch (err) {
        // Token inválido/expirado: limpiar sesión.
        if (
          err instanceof ApiError &&
          (err.status === 401 || err.status === 403)
        ) {
          clearTokens();
          localStorage.removeItem(USER_KEY);
          set({ user: null, token: null, isAuthenticated: false });
        }
      }
    },

    logout: async () => {
      const refresh = localStorage.getItem("canvan_refresh_token");
      if (refresh) {
        try {
          await authApi.logout(refresh);
        } catch {
          /* ignore */
        }
      }
      clearTokens();
      localStorage.removeItem(USER_KEY);
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
}
