import { api } from "./api";
import type { BackendProfile, BackendPreferences, BackendUser } from "@/shared/types";

export const usersApi = {
  account: () => api<BackendUser>("/users/account"),

  getProfile: () => api<BackendProfile>("/users/profile"),

  getPreferences: () => api<BackendPreferences>("/users/preferences"),

  updateProfile: (body: {
    displayName?: string;
    bio?: string;
    coverUrl?: string | null;
    jobTitle?: string;
    company?: string;
    location?: string;
    socialWebsite?: string | null;
    socialTwitter?: string | null;
    socialGithub?: string | null;
    socialLinkedin?: string | null;
    socialInstagram?: string | null;
  }) => api<BackendProfile>("/users/account", { method: "PATCH", body }),

  updatePreferences: (body: {
    theme?: string;
    background?: string;
    density?: string;
    language?: string;
    timezone?: string;
    timeFormat?: string;
    dateFormat?: string;
    reducedMotion?: boolean;
    showCompletedCards?: boolean;
    emailEnabled?: boolean;
    pushEnabled?: boolean;
    mentions?: boolean;
    cardAssigned?: boolean;
    cardDueSoon?: boolean;
    boardInvites?: boolean;
    weeklyDigest?: boolean;
    profileVisibility?: string;
    showEmail?: boolean;
    showActivity?: boolean;
    allowDM?: boolean;
    analyticsOptOut?: boolean;
  }) => api<BackendPreferences>("/users/preferences", { method: "PATCH", body }),
};
