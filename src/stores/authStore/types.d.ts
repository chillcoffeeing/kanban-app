import type { UserResponse, UserProfileJson, UserPreferenceJson } from "@/shared/types/api";

export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  _guestBump?: number;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string, extra?: { username?: string; displayName?: string; jobTitle?: string; company?: string }) => Promise<void>;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfileJson>) => Promise<void>;
  updatePreferences: (patch: Partial<UserPreferenceJson>) => Promise<void>;
}
