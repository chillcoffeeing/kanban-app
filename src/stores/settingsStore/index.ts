import type { SettingsView } from "./types";
import { createSettingsActions } from "./settingsActions";
import { BACKGROUNDS } from "./constants";

export function useSettingsStore(): SettingsView {
  return createSettingsActions();
}

export { BACKGROUNDS };
