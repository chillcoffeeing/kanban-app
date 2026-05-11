import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSettingsStore } from "@/stores/settingsStore";

export function useApplySettings() {
  const { theme, background, density, reducedMotion, language } =
    useSettingsStore(
      useShallow((s) => ({
        theme: s.theme,
        background: s.background,
        density: s.density,
        reducedMotion: s.reducedMotion,
        language: s.language,
      })),
    );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.density = density;
    root.dataset.reducedMotion = String(reducedMotion);
    root.lang = language;
    document.body.dataset.bg = background;
  }, [theme, background, density, reducedMotion, language]);
}
