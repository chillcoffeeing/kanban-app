import { usersApi } from "@/services/users";
import type { UserResponse, UserProfileJson, UserPreferenceJson } from "@/shared/types/api";

export function createUserActions(set: any, get: any) {
  return {
    updateProfile: async (profilePatch: Partial<UserProfileJson>) => {
      const current = get().user as UserResponse | null;
      if (!current) return;

      const updatedProfileJson = {
        ...current.profile?.profile,
        ...profilePatch,
      };

      try {
        const result = await usersApi.updateProfile({
          profile: updatedProfileJson,
        });

        set({
          user: {
            ...current,
            profile: {
              ...current.profile,
              profile: result?.profile ?? updatedProfileJson,
            },
          },
        });
      } catch {
        set({
          user: {
            ...current,
            profile: { ...current.profile, profile: updatedProfileJson },
          },
        });
      }
    },

    updatePreferences: async (prefsPatch: Partial<UserPreferenceJson>) => {
      const current = get().user as UserResponse | null;
      if (!current) return;

      const updatedSettings = {
        ...current.preference?.settings,
        ...prefsPatch,
      };

      try {
        const result = await usersApi.updatePreferences({
          settings: updatedSettings,
        });

        set({
          user: {
            ...current,
            preference: {
              ...current.preference,
              settings: result?.settings ?? updatedSettings,
            },
          },
        });
      } catch {
        set({
          user: {
            ...current,
            preference: { ...current.preference, settings: updatedSettings },
          },
        });
      }
    },
  };
}
