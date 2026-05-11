import { useEffect, useRef } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

const KEY = "kanban-appearance";

const FIELDS = [
  "theme", "background", "density", "language", "timezone",
  "timeFormat", "dateFormat", "reducedMotion", "showCompletedCards",
] as const;

function pick(s: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of FIELDS) out[k] = s[k];
  return out;
}

export function usePersistSettings(): void {
  const restored = useRef(false);

  if (!restored.current) {
    restored.current = true;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved && typeof saved.theme === "string") {
        useSettingsStore.setState((state) => ({ ...state, ...saved }));
      }
    } catch {
      /* ignore */
    }
  }

  const skipSave = useRef(true);

  useEffect(() => {
    const unsub = useSettingsStore.subscribe((state: unknown, prevState: unknown) => {
      const curr = pick(state as Record<string, unknown>);
      const prev = pick(prevState as Record<string, unknown>);

      if (JSON.stringify(curr) === JSON.stringify(prev)) return;

      if (skipSave.current) {
        skipSave.current = false;
        return;
      }

      try {
        localStorage.setItem(KEY, JSON.stringify(curr));
      } catch {
        /* quota exceeded */
      }
    });

    return unsub;
  }, []);
}
