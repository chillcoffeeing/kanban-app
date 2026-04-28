import type { SettingsView } from "./types";
import { createSettingsActions } from "./settingsActions";
import { BACKGROUNDS } from "./constants";

export function useSettingsStore(): SettingsView {
  const { prefs, apply, ...actions } = createSettingsActions();

  return {
    theme: prefs.display.theme,
    background: prefs.display.background,
    density: prefs.display.density,
    language: prefs.display.language,
    timezone: prefs.display.timezone,
    timeFormat: prefs.display.timeFormat,
    dateFormat: prefs.display.dateFormat,
    reducedMotion: prefs.display.reducedMotion,
    showCompletedCards: prefs.display.showCompletedCards,
    notifications: prefs.notifications,
    privacy: prefs.privacy,

    ...actions,
  };
}

export { BACKGROUNDS };
