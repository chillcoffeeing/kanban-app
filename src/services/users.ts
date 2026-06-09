import { ApiClient } from "./api";
import type { UserResponse, UserProfile, UserPreference, UserProfileJson, UserPreferenceJson } from "@/shared/types";

export class UsersService {
  static account() {
    return ApiClient.get<UserResponse>("/users/account");
  }

  static getProfile() {
    return ApiClient.get<UserProfile>("/users/profile");
  }

  static getPreferences() {
    return ApiClient.get<UserPreference>("/users/preferences");
  }

  static updateProfile(data: { profile?: UserProfileJson }) {
    return ApiClient.patch<UserProfile>("/users/account", data);
  }

  static updatePreferences(data: { settings?: UserPreferenceJson }) {
    return ApiClient.patch<UserPreference>("/users/preferences", data);
  }
}
