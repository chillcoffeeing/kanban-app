import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSettingsStore } from "@/stores/settingsStore";
import { formatDate } from "@/shared/utils/helpers";

export function useFormatDate() {
  const { dateFormat, timeFormat, language } = useSettingsStore(
    useShallow((settings) => ({
      dateFormat: settings.dateFormat,
      timeFormat: settings.timeFormat,
      language: settings.language,
    })),
  );

  return useCallback(
    (date: string | number | Date | null | undefined, withTime = false) =>
      formatDate(date, {
        dateFormat,
        timeFormat,
        withTime,
        locale: language,
      }),
    [dateFormat, timeFormat, language],
  );
}
