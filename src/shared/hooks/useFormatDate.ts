import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSettingsStore } from "@/stores/settingsStore";
import { formatDate } from "@/shared/utils/helpers";

export function useFormatDate() {
  const { dateFormat, timeFormat, timezone, language } = useSettingsStore(
    useShallow((s) => ({
      dateFormat: s.dateFormat,
      timeFormat: s.timeFormat,
      timezone: s.timezone,
      language: s.language,
    })),
  );

  return useCallback(
    (date: string | number | Date | null | undefined, withTime = false) =>
      formatDate(date, {
        dateFormat,
        timeFormat,
        timezone,
        withTime,
        locale: language === "en" ? "en-US" : "es-ES",
      }),
    [dateFormat, timeFormat, timezone, language],
  );
}
