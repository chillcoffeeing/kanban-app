import type {
  UserDisplayPrefs,
  UserNotificationPrefs,
  UserPrivacyPrefs,
  UserPreferences,
} from "@/shared/types/user";

export interface PreferencesPatch {
  display?: Partial<UserDisplayPrefs>;
  notifications?: Partial<UserNotificationPrefs>;
  privacy?: Partial<UserPrivacyPrefs>;
}

export interface SettingsView {
  // Display flat
  theme: UserDisplayPrefs["theme"];
  background: string;
  density: UserDisplayPrefs["density"];
  language: UserDisplayPrefs["language"];
  timezone: string;
  timeFormat: UserDisplayPrefs["timeFormat"];
  dateFormat: UserDisplayPrefs["dateFormat"];
  reducedMotion: boolean;
  showCompletedCards: boolean;

  // Composite groups
  notifications: UserNotificationPrefs;
  privacy: UserPrivacyPrefs;

  setTheme: (v: UserDisplayPrefs["theme"]) => void;
  setBackground: (v: string) => void;
  setDensity: (v: UserDisplayPrefs["density"]) => void;
  setLanguage: (v: UserDisplayPrefs["language"]) => void;
  setTimezone: (v: string) => void;
  setTimeFormat: (v: UserDisplayPrefs["timeFormat"]) => void;
  setDateFormat: (v: UserDisplayPrefs["dateFormat"]) => void;
  setReducedMotion: (v: boolean) => void;
  setShowCompletedCards: (v: boolean) => void;

  setNotification: <K extends keyof UserNotificationPrefs>(
    key: K,
    value: UserNotificationPrefs[K],
  ) => void;
  setPrivacy: <K extends keyof UserPrivacyPrefs>(
    key: K,
    value: UserPrivacyPrefs[K],
  ) => void;

  reset: () => void;
}
