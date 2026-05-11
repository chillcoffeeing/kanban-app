import { api } from "./api";
import type {
  UserResponse,
  UserProfileJson,
  UserPreferenceJson,
  UserProfile,
  UserPreference,
} from "@/shared/types";

export const usersApi = {
  account: () => api<UserResponse>("/users/account"),

  getProfile: () => api<UserProfile>("/users/profile"),

  getPreferences: () => api<UserPreference>("/users/preferences"),

  updateProfile: (body: { profile?: UserProfileJson }) =>
    api<UserProfile>("/users/account", { method: "PATCH", body }),

  updatePreferences: (body: { settings?: UserPreferenceJson }) =>
    api<UserPreference>("/users/preferences", { method: "PATCH", body }),
};
