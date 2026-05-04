import { createUser, type User } from "@/shared/types/user";
import type { BackendUser, BackendProfile, BackendPreferences } from "@/shared/types";

const USER_KEY = "canvan_user";
const REFRESH_KEY = "canvan_refresh_token";

export function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw);
    return stored?.preferences ? (stored as User) : createUser(stored);
  } catch {
    return null;
  }
}

export function persistUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function mapProfile(raw: BackendProfile | undefined): User["profile"] {
  if (!raw) {
    return {
      displayName: "",
      bio: null,
      avatarUrl: null,
      coverUrl: null,
      jobTitle: null,
      company: null,
      location: null,
      socials: {
        website: null,
        twitter: null,
        github: null,
        linkedin: null,
        instagram: null,
      },
    };
  }
  return {
    displayName: raw.displayName || "",
    bio: raw.bio,
    avatarUrl: null,
    coverUrl: raw.coverUrl,
    jobTitle: raw.jobTitle,
    company: raw.company,
    location: raw.location,
    socials: {
      website: raw.socialWebsite,
      twitter: raw.socialTwitter,
      github: raw.socialGithub,
      linkedin: raw.socialLinkedin,
      instagram: raw.socialInstagram,
    },
  };
}

function mapPreferences(raw: BackendPreferences | undefined): User["preferences"] {
  if (!raw) {
    return {
      display: {
        theme: "system",
        background: "",
        density: "comfortable",
        language: "en",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timeFormat: "12h",
        dateFormat: "MDY",
        reducedMotion: false,
        showCompletedCards: true,
      },
      notifications: {
        emailEnabled: true,
        pushEnabled: false,
        mentions: true,
        cardAssigned: true,
        cardDueSoon: true,
        boardInvites: true,
        weeklyDigest: false,
      },
      privacy: {
        profileVisibility: "private",
        showEmail: false,
        showActivity: false,
        allowDM: true,
        analyticsOptOut: false,
      },
    };
  }
  return {
    display: {
      theme: raw.theme as User["preferences"]["display"]["theme"],
      background: raw.background,
      density: raw.density as User["preferences"]["display"]["density"],
      language: raw.language as User["preferences"]["display"]["language"],
      timezone: raw.timezone,
      timeFormat: raw.timeFormat as User["preferences"]["display"]["timeFormat"],
      dateFormat: raw.dateFormat as User["preferences"]["display"]["dateFormat"],
      reducedMotion: raw.reducedMotion,
      showCompletedCards: raw.showCompletedCards,
    },
    notifications: {
      emailEnabled: raw.emailEnabled,
      pushEnabled: raw.pushEnabled,
      mentions: raw.mentions,
      cardAssigned: raw.cardAssigned,
      cardDueSoon: raw.cardDueSoon,
      boardInvites: raw.boardInvites,
      weeklyDigest: raw.weeklyDigest,
    },
    privacy: {
      profileVisibility: raw.profileVisibility as User["preferences"]["privacy"]["profileVisibility"],
      showEmail: raw.showEmail,
      showActivity: raw.showActivity,
      allowDM: raw.allowDM,
      analyticsOptOut: raw.analyticsOptOut,
    },
  };
}

export function fromBackend(raw: BackendUser): User {
  return createUser({
    id: raw.id,
    email: raw.email,
    name: raw.name,
    roles: (raw.roles as User["roles"]) ?? ["member"],
    profile: mapProfile(raw.profile as BackendProfile | undefined),
    preferences: mapPreferences(raw.preferences as BackendPreferences | undefined),
    createdAt: raw.createdAt,
    lastLoginAt: raw.lastLoginAt ?? new Date().toISOString(),
  });
}

export { USER_KEY, REFRESH_KEY };
