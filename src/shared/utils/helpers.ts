export function generateId(): string {
  return crypto.randomUUID();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

type DateLike = string | number | Date | null | undefined;

interface FormatOptions {
  dateFormat?: string;
  timezone?: string;
  locale?: string;
  withTime?: boolean;
  timeFormat?: string;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = JSON.stringify([locale, options]);
  let fmt = formatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, fmt);
  }
  return fmt;
}

const localeFor = (
  language: "es" | "en" | string | undefined,
  format: string | undefined,
): string => {
  if (language === "en") return format === "MDY" ? "en-US" : "en-GB";
  return "es-ES";
};

interface FormatOptions {
  dateFormat?: string;
  timezone?: string;
  locale?: string;
  withTime?: boolean;
  timeFormat?: string;
}

export function formatDate(date: DateLike, opts: FormatOptions = {}): string {
  if (!date) return "";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "";

  const {
    dateFormat = "DMY",
    timezone,
    withTime,
    timeFormat = "24h",
    locale,
  } = opts;

  if (dateFormat === "YMD") {
    const fmt = getFormatter("sv-SE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: timezone,
    });
    const datePart = fmt.format(parsedDate);
    if (!withTime) return datePart;
    const time = getFormatter("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: timeFormat === "12h",
      timeZone: timezone,
    }).format(parsedDate);
    return `${datePart} ${time}`;
  }

  const resolvedLocale = locale || localeFor("es", dateFormat);
  const datePart = getFormatter(resolvedLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: timezone,
  }).format(parsedDate);

  if (!withTime) return datePart;

  const timePart = getFormatter(resolvedLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: timeFormat === "12h",
    timeZone: timezone,
  }).format(parsedDate);
  return `${datePart} · ${timePart}`;
}

export function isOverdue(date: DateLike): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

export function classNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
