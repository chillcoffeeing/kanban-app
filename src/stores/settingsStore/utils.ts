import {
  DEFAULT_DISPLAY_PREFS,
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_PRIVACY_PREFS,
  type UserPreferences,
} from "@/shared/types/user";
import type { PreferencesPatch } from "./types";

const GUEST_KEY = "canvan_guest_settings";

export function readGuest(): UserPreferences | null {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || "null");
  } catch {
    return null;
  }
}

export function writeGuest(prefs: UserPreferences) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(prefs));
}

export function composeGuestPrefs(
  partial: PreferencesPatch = {},
): UserPreferences {
  const base: UserPreferences = readGuest() || {
    display: { ...DEFAULT_DISPLAY_PREFS },
    notifications: { ...DEFAULT_NOTIFICATION_PREFS },
    privacy: { ...DEFAULT_PRIVACY_PREFS },
  };
  return {
    display: { ...base.display, ...(partial.display || {}) },
    notifications: {
      ...base.notifications,
      ...(partial.notifications || {}),
    },
    privacy: { ...base.privacy, ...(partial.privacy || {}) },
  };
}
