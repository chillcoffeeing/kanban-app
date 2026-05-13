import { format, isBefore, startOfDay } from "date-fns";
import { es, enUS, type Locale } from "date-fns/locale";

export function generateId(): string {
  return crypto.randomUUID();
}

type DateLike = string | number | Date | null | undefined;

const LOCALE_MAP: Record<string, Locale> = { es, en: enUS };

function resolveLocale(locale?: string): Locale {
  const key = locale?.startsWith("en") ? "en" : "es";
  return LOCALE_MAP[key] ?? es;
}

export function formatDate(
  date: DateLike,
  {
    dateFormat = "DMY",
    withTime,
    timeFormat = "24h",
    locale,
  }: {
    dateFormat?: string;
    withTime?: boolean;
    timeFormat?: string;
    locale?: string;
  } = {},
): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  const l = resolveLocale(locale);

  const datePatterns: Record<string, string> = {
    DMY: "d MMM yyyy",
    MDY: "MMM d, yyyy",
    YMD: "yyyy-MM-dd",
  };
  const pattern = datePatterns[dateFormat] ?? datePatterns.DMY;
  const timePattern = timeFormat === "12h" ? " h:mm a" : " HH:mm";

  return format(d, pattern + (withTime ? timePattern : ""), { locale: l });
}

export function isOverdue(date: DateLike): boolean {
  if (!date) return false;
  return isBefore(new Date(date), startOfDay(new Date()));
}

export function classNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
