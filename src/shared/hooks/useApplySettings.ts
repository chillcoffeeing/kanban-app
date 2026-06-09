import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAuthStore } from "@/stores/authStore";
import { PUBLIC_THEME_KEY } from "@/shared/utils/constants";

export function useApplySettings() {
  const { theme, background, density, reducedMotion, language } =
    useSettingsStore(
      useShallow((settings) => ({
        theme: settings.theme,
        background: settings.background,
        density: settings.density,
        reducedMotion: settings.reducedMotion,
        language: settings.language,
      })),
    );
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [publicTheme, setPublicTheme] = useState(() =>
    localStorage.getItem(PUBLIC_THEME_KEY) || "light",
  );

  useEffect(() => {
    const handler = () =>
      setPublicTheme(localStorage.getItem(PUBLIC_THEME_KEY) || "light");
    window.addEventListener("public-theme-change", handler);
    return () => window.removeEventListener("public-theme-change", handler);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const effectiveTheme = isAuthenticated ? theme : publicTheme;
    root.dataset.theme = effectiveTheme;
    root.dataset.density = density;
    root.dataset.reducedMotion = String(reducedMotion);
    root.lang = language;
    document.body.dataset.bg = isAuthenticated ? background : "plain";
  }, [theme, background, density, reducedMotion, language, isAuthenticated, publicTheme]);
}
