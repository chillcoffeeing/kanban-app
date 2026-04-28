import { updateUser as patchUser, type User } from "@/shared/types/user";
import { persistUser } from "./utils";

export function createUserActions(set: any, get: any) {
  return {
    updateUser: (patch: Partial<User> | ((user: User) => User)) => {
      const current = get().user;
      if (!current) return;
      const user =
        typeof patch === "function"
          ? patch(current)
          : patchUser(current, patch);
      persistUser(user);
      set({ user });
    },

    updateProfile: (profilePatch: Partial<User["profile"]>) => {
      get().updateUser({ profile: profilePatch as User["profile"] });
    },

    updatePreferences: (prefsPatch: Partial<User["preferences"]>) => {
      get().updateUser({ preferences: prefsPatch as User["preferences"] });
    },
  };
}
