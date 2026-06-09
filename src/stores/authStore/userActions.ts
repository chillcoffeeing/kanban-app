import { UsersService } from "@/services/users";
import { handleError } from "@/shared/utils/errorHandler";
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
        const result = await UsersService.updateProfile({
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
      } catch (err) {
        set({
          user: {
            ...current,
            profile: { ...current.profile, profile: updatedProfileJson },
          },
        });
        handleError(err, "Error al actualizar perfil");
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
        const result = await UsersService.updatePreferences({
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
      } catch (err) {
        set({
          user: {
            ...current,
            preference: { ...current.preference, settings: updatedSettings },
          },
        });
        handleError(err, "Error al actualizar preferencias");
      }
    },
  };
}
