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

  apply: (patch: PreferencesPatch) => Promise<void>;

  setTheme: (v: UserDisplayPrefs["theme"]) => Promise<void>;
  setBackground: (v: string) => Promise<void>;
  setDensity: (v: UserDisplayPrefs["density"]) => Promise<void>;
  setLanguage: (v: UserDisplayPrefs["language"]) => Promise<void>;
  setTimezone: (v: string) => Promise<void>;
  setTimeFormat: (v: UserDisplayPrefs["timeFormat"]) => Promise<void>;
  setDateFormat: (v: UserDisplayPrefs["dateFormat"]) => Promise<void>;
  setReducedMotion: (v: boolean) => Promise<void>;
  setShowCompletedCards: (v: boolean) => Promise<void>;

  setNotification: <K extends keyof UserNotificationPrefs>(
    key: K,
    value: UserNotificationPrefs[K],
  ) => Promise<void>;
  setPrivacy: <K extends keyof UserPrivacyPrefs>(
    key: K,
    value: UserPrivacyPrefs[K],
  ) => Promise<void>;

  reset: () => Promise<void>;
}
