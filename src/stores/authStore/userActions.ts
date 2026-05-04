import { updateUser as patchUser, type User } from "@/shared/types/user";
import { persistUser } from "./utils";
import { usersApi } from "@/services/users";

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

    updateProfile: async (profilePatch: Partial<User["profile"]>) => {
      const current = get().user;
      if (!current) return;

      const profile = { ...current.profile, ...profilePatch };

      try {
        const result = await usersApi.updateProfile({
          displayName: profile.displayName,
          bio: profile.bio,
          coverUrl: profile.coverUrl,
          jobTitle: profile.jobTitle,
          company: profile.company,
          location: profile.location,
          socialWebsite: profile.socials?.website ?? null,
          socialTwitter: profile.socials?.twitter ?? null,
          socialGithub: profile.socials?.github ?? null,
          socialLinkedin: profile.socials?.linkedin ?? null,
          socialInstagram: profile.socials?.instagram ?? null,
        });

        const updatedUser: User = {
          ...current,
          profile: {
            displayName: result.displayName || "",
            bio: result.bio,
            avatarUrl: null,
            coverUrl: result.coverUrl,
            jobTitle: result.jobTitle,
            company: result.company,
            location: result.location,
            socials: {
              website: result.socialWebsite,
              twitter: result.socialTwitter,
              github: result.socialGithub,
              linkedin: result.socialLinkedin,
              instagram: result.socialInstagram,
            },
          },
        };
        persistUser(updatedUser);
        set({ user: updatedUser });
      } catch {
        const user = patchUser(current, { profile });
        persistUser(user);
        set({ user });
      }
    },

    updatePreferences: async (prefsPatch: Partial<User["preferences"]>) => {
      const current = get().user;
      if (!current) return;

      const preferences: User["preferences"] = {
        display: { ...current.preferences.display, ...prefsPatch.display },
        notifications: { ...current.preferences.notifications, ...prefsPatch.notifications },
        privacy: { ...current.preferences.privacy, ...prefsPatch.privacy },
      };

      try {
        const result = await usersApi.updatePreferences({
          theme: preferences.display.theme,
          background: preferences.display.background,
          density: preferences.display.density,
          language: preferences.display.language,
          timezone: preferences.display.timezone,
          timeFormat: preferences.display.timeFormat,
          dateFormat: preferences.display.dateFormat,
          reducedMotion: preferences.display.reducedMotion,
          showCompletedCards: preferences.display.showCompletedCards,
          emailEnabled: preferences.notifications.emailEnabled,
          pushEnabled: preferences.notifications.pushEnabled,
          mentions: preferences.notifications.mentions,
          cardAssigned: preferences.notifications.cardAssigned,
          cardDueSoon: preferences.notifications.cardDueSoon,
          boardInvites: preferences.notifications.boardInvites,
          weeklyDigest: preferences.notifications.weeklyDigest,
          profileVisibility: preferences.privacy.profileVisibility,
          showEmail: preferences.privacy.showEmail,
          showActivity: preferences.privacy.showActivity,
          allowDM: preferences.privacy.allowDM,
          analyticsOptOut: preferences.privacy.analyticsOptOut,
        });

        const mappedPrefs: User["preferences"] = {
          display: {
            theme: result.theme as User["preferences"]["display"]["theme"],
            background: result.background,
            density: result.density as User["preferences"]["display"]["density"],
            language: result.language as User["preferences"]["display"]["language"],
            timezone: result.timezone,
            timeFormat: result.timeFormat as User["preferences"]["display"]["timeFormat"],
            dateFormat: result.dateFormat as User["preferences"]["display"]["dateFormat"],
            reducedMotion: result.reducedMotion,
            showCompletedCards: result.showCompletedCards,
          },
          notifications: {
            emailEnabled: result.emailEnabled,
            pushEnabled: result.pushEnabled,
            mentions: result.mentions,
            cardAssigned: result.cardAssigned,
            cardDueSoon: result.cardDueSoon,
            boardInvites: result.boardInvites,
            weeklyDigest: result.weeklyDigest,
          },
          privacy: {
            profileVisibility: result.profileVisibility as User["preferences"]["privacy"]["profileVisibility"],
            showEmail: result.showEmail,
            showActivity: result.showActivity,
            allowDM: result.allowDM,
            analyticsOptOut: result.analyticsOptOut,
          },
        };

        const updatedUser: User = { ...current, preferences: mappedPrefs };
        persistUser(updatedUser);
        set({ user: updatedUser });
      } catch {
        const user = { ...current, preferences };
        persistUser(user);
        set({ user });
      }
    },
  };
}
