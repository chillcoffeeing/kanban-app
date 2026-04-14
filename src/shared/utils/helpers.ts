import type { UserDisplayPrefs } from '@/shared/types/user'

export function generateId(): string {
  return crypto.randomUUID()
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

type DateLike = string | number | Date | null | undefined

interface FormatOptions {
  dateFormat?: UserDisplayPrefs['dateFormat']
  timezone?: string
  locale?: string
  withTime?: boolean
  timeFormat?: UserDisplayPrefs['timeFormat']
}

const localeFor = (
  language: 'es' | 'en' | string | undefined,
  format: UserDisplayPrefs['dateFormat'] | undefined
): string => {
  if (language === 'en') return format === 'MDY' ? 'en-US' : 'en-GB'
  return 'es-ES'
}

export function formatDate(date: DateLike, opts: FormatOptions = {}): string {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''

  const { dateFormat = 'DMY', timezone, withTime, timeFormat = '24h', locale } =
    opts

  if (dateFormat === 'YMD') {
    const fmt = new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: timezone,
    })
    const datePart = fmt.format(d)
    if (!withTime) return datePart
    const time = new Intl.DateTimeFormat('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h',
      timeZone: timezone,
    }).format(d)
    return `${datePart} ${time}`
  }

  const resolvedLocale = locale || localeFor('es', dateFormat)
  const datePart = new Intl.DateTimeFormat(resolvedLocale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: timezone,
  }).format(d)

  if (!withTime) return datePart

  const timePart = new Intl.DateTimeFormat(resolvedLocale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: timeFormat === '12h',
    timeZone: timezone,
  }).format(d)
  return `${datePart} · ${timePart}`
}

export function isOverdue(date: DateLike): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

export function classNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ')
}
