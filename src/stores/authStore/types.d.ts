import type { User } from "@/shared/types/user";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /** Internal counter to force re-renders when guest settings change. */
  _guestBump?: number;

  /** Authenticate against the backend using email/password. */
  login: (email: string, password: string) => Promise<void>;
  /** Create a new account and log in. */
  register: (email: string, name: string, password: string) => Promise<void>;
  /** Re-hydrate the session from persisted tokens on app boot. */
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User> | ((u: User) => User)) => void;
  updateProfile: (patch: Partial<User["profile"]>) => Promise<void>;
  updatePreferences: (patch: Partial<User["preferences"]>) => Promise<void>;
}
