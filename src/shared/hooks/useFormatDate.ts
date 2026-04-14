import { useCallback } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import { formatDate } from '@/shared/utils/helpers'

/**
 * Versión de `formatDate` aplicada a las preferencias del usuario actual.
 * Úsala en lugar de `formatDate` directo cuando quieras que el formato
 * respete `dateFormat` / `timeFormat` / `timezone` del perfil.
 */
export function useFormatDate() {
  const { dateFormat, timeFormat, timezone, language } = useSettingsStore()

  return useCallback(
    (date: string | number | Date | null | undefined, withTime = false) =>
      formatDate(date, {
        dateFormat,
        timeFormat,
        timezone,
        withTime,
        locale: language === 'en' ? 'en-US' : 'es-ES',
      }),
    [dateFormat, timeFormat, timezone, language]
  )
}
