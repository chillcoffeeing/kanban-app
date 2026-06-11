import { AuthService } from "@/services/auth";
import { TokenManager, ApiError } from "@/services/api";

export function createAuthActions(set: any, get: any) {
  return {
    login: async (email: string, password: string) => {
      const res = await AuthService.login(email, password);
      TokenManager.set(res.accessToken, res.refreshToken);
      await get().hydrate();
    },

    register: async (email: string, name: string, password: string, extra?: { username?: string; displayName?: string; jobTitle?: string; company?: string }) => {
      const res = await AuthService.register({ email, name, password, ...extra });
      TokenManager.set(res.accessToken, res.refreshToken);
      await get().hydrate();
    },

    hydrate: async () => {
      let token = TokenManager.getAccess();

      if (!token) {
        const refreshToken = TokenManager.getRefresh();
        if (refreshToken) {
          try {
            const res = await AuthService.refresh(refreshToken);
            TokenManager.set(res.accessToken, res.refreshToken);
            token = res.accessToken;
          } catch {
            TokenManager.clear();
            set({ user: null, token: null, isAuthenticated: false });
            return;
          }
        } else {
          return;
        }
      }

      try {
        const user = await AuthService.account();
        set({ user, token, isAuthenticated: true });
      } catch (err) {
        if (
          err instanceof ApiError &&
          (err.status === 401 || err.status === 403)
        ) {
          TokenManager.clear();
          set({ user: null, token: null, isAuthenticated: false });
        }
      }
    },

    logout: async () => {
      const refresh = TokenManager.getRefresh();
      if (refresh) {
        try {
          await AuthService.logout(refresh);
        } catch { /* ignore */
        }
      }
      TokenManager.clear();
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
}
