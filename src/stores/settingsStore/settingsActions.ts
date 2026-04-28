import { useAuthStore } from "@/stores/authStore";
import {
  DEFAULT_DISPLAY_PREFS,
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_PRIVACY_PREFS,
  type UserDisplayPrefs,
  type UserNotificationPrefs,
  type UserPreferences,
  type UserPrivacyPrefs,
} from "@/shared/types/user";
import { composeGuestPrefs, readGuest, writeGuest } from "./utils";
import type { PreferencesPatch } from "./types";

export function createSettingsActions() {
  const user = useAuthStore((state) => state.user);
  const updatePreferences = useAuthStore((state) => state.updatePreferences);
  // Re-render on guest bumps
  useAuthStore((state) => state._guestBump);

  const prefs: UserPreferences = user?.preferences ||
    readGuest() || {
      display: { ...DEFAULT_DISPLAY_PREFS },
      notifications: { ...DEFAULT_NOTIFICATION_PREFS },
      privacy: { ...DEFAULT_PRIVACY_PREFS },
    };

  const apply = (patch: PreferencesPatch) => {
    if (user) {
      updatePreferences(patch as Partial<UserPreferences>);
    } else {
      writeGuest(composeGuestPrefs(patch));
      useAuthStore.setState({ _guestBump: Date.now() });
    }
  };

  return {
    prefs,
    apply,

    // Display setters
    setTheme: (v: UserDisplayPrefs["theme"]) =>
      apply({ display: { theme: v } }),
    setBackground: (v: string) => apply({ display: { background: v } }),
    setDensity: (v: UserDisplayPrefs["density"]) =>
      apply({ display: { density: v } }),
    setLanguage: (v: UserDisplayPrefs["language"]) =>
      apply({ display: { language: v } }),
    setTimezone: (v: string) => apply({ display: { timezone: v } }),
    setTimeFormat: (v: UserDisplayPrefs["timeFormat"]) =>
      apply({ display: { timeFormat: v } }),
    setDateFormat: (v: UserDisplayPrefs["dateFormat"]) =>
      apply({ display: { dateFormat: v } }),
    setReducedMotion: (v: boolean) => apply({ display: { reducedMotion: v } }),
    setShowCompletedCards: (v: boolean) =>
      apply({ display: { showCompletedCards: v } }),

    // Notification setters
    setNotification: <K extends keyof UserNotificationPrefs>(
      key: K,
      value: UserNotificationPrefs[K],
    ) =>
      apply({
        notifications: { [key]: value } as Partial<UserNotificationPrefs>,
      }),

    // Privacy setters
    setPrivacy: <K extends keyof UserPrivacyPrefs>(
      key: K,
      value: UserPrivacyPrefs[K],
    ) => apply({ privacy: { [key]: value } as Partial<UserPrivacyPrefs> }),

    // Reset
    reset: () =>
      apply({
        display: { ...DEFAULT_DISPLAY_PREFS },
        notifications: { ...DEFAULT_NOTIFICATION_PREFS },
        privacy: { ...DEFAULT_PRIVACY_PREFS },
      }),
  };
}
