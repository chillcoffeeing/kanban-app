import { useAuthStore } from './authStore'
import {
  DEFAULT_DISPLAY_PREFS,
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_PRIVACY_PREFS,
  type UserDisplayPrefs,
  type UserNotificationPrefs,
  type UserPrivacyPrefs,
  type UserPreferences,
} from '@/shared/types/user'

export const BACKGROUNDS: { id: string; label: string }[] = [
  { id: 'plain', label: 'Plano' },
  { id: 'dots', label: 'Puntos' },
  { id: 'grid', label: 'Cuadrícula' },
  { id: 'gradient-blue', label: 'Degradado Azul' },
  { id: 'gradient-sunset', label: 'Degradado Atardecer' },
  { id: 'gradient-forest', label: 'Degradado Bosque' },
]

const GUEST_KEY = 'canvan_guest_settings'

function readGuest(): UserPreferences | null {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || 'null')
  } catch {
    return null
  }
}

function writeGuest(prefs: UserPreferences) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(prefs))
}

interface PreferencesPatch {
  display?: Partial<UserDisplayPrefs>
  notifications?: Partial<UserNotificationPrefs>
  privacy?: Partial<UserPrivacyPrefs>
}

function composeGuestPrefs(partial: PreferencesPatch = {}): UserPreferences {
  const base: UserPreferences = readGuest() || {
    display: { ...DEFAULT_DISPLAY_PREFS },
    notifications: { ...DEFAULT_NOTIFICATION_PREFS },
    privacy: { ...DEFAULT_PRIVACY_PREFS },
  }
  return {
    display: { ...base.display, ...(partial.display || {}) },
    notifications: {
      ...base.notifications,
      ...(partial.notifications || {}),
    },
    privacy: { ...base.privacy, ...(partial.privacy || {}) },
  }
}

export interface SettingsView {
  // Display flat
  theme: UserDisplayPrefs['theme']
  background: string
  density: UserDisplayPrefs['density']
  language: UserDisplayPrefs['language']
  timezone: string
  timeFormat: UserDisplayPrefs['timeFormat']
  dateFormat: UserDisplayPrefs['dateFormat']
  reducedMotion: boolean
  showCompletedCards: boolean

  // Composite groups
  notifications: UserNotificationPrefs
  privacy: UserPrivacyPrefs

  setTheme: (v: UserDisplayPrefs['theme']) => void
  setBackground: (v: string) => void
  setDensity: (v: UserDisplayPrefs['density']) => void
  setLanguage: (v: UserDisplayPrefs['language']) => void
  setTimezone: (v: string) => void
  setTimeFormat: (v: UserDisplayPrefs['timeFormat']) => void
  setDateFormat: (v: UserDisplayPrefs['dateFormat']) => void
  setReducedMotion: (v: boolean) => void
  setShowCompletedCards: (v: boolean) => void

  setNotification: <K extends keyof UserNotificationPrefs>(
    key: K,
    value: UserNotificationPrefs[K]
  ) => void
  setPrivacy: <K extends keyof UserPrivacyPrefs>(
    key: K,
    value: UserPrivacyPrefs[K]
  ) => void

  reset: () => void
}

export function useSettingsStore(): SettingsView {
  const user = useAuthStore((s) => s.user)
  const updatePreferences = useAuthStore((s) => s.updatePreferences)
  // Re-render on guest bumps
  useAuthStore((s) => s._guestBump)

  const prefs: UserPreferences =
    user?.preferences ||
    readGuest() || {
      display: { ...DEFAULT_DISPLAY_PREFS },
      notifications: { ...DEFAULT_NOTIFICATION_PREFS },
      privacy: { ...DEFAULT_PRIVACY_PREFS },
    }

  const apply = (patch: PreferencesPatch) => {
    if (user) {
      updatePreferences(patch as Partial<UserPreferences>)
    } else {
      writeGuest(composeGuestPrefs(patch))
      useAuthStore.setState({ _guestBump: Date.now() })
    }
  }

  return {
    theme: prefs.display.theme,
    background: prefs.display.background,
    density: prefs.display.density,
    language: prefs.display.language,
    timezone: prefs.display.timezone,
    timeFormat: prefs.display.timeFormat,
    dateFormat: prefs.display.dateFormat,
    reducedMotion: prefs.display.reducedMotion,
    showCompletedCards: prefs.display.showCompletedCards,
    notifications: prefs.notifications,
    privacy: prefs.privacy,

    setTheme: (v) => apply({ display: { theme: v } }),
    setBackground: (v) => apply({ display: { background: v } }),
    setDensity: (v) => apply({ display: { density: v } }),
    setLanguage: (v) => apply({ display: { language: v } }),
    setTimezone: (v) => apply({ display: { timezone: v } }),
    setTimeFormat: (v) => apply({ display: { timeFormat: v } }),
    setDateFormat: (v) => apply({ display: { dateFormat: v } }),
    setReducedMotion: (v) => apply({ display: { reducedMotion: v } }),
    setShowCompletedCards: (v) =>
      apply({ display: { showCompletedCards: v } }),

    setNotification: (key, value) =>
      apply({ notifications: { [key]: value } as Partial<UserNotificationPrefs> }),
    setPrivacy: (key, value) =>
      apply({ privacy: { [key]: value } as Partial<UserPrivacyPrefs> }),

    reset: () =>
      apply({
        display: { ...DEFAULT_DISPLAY_PREFS },
        notifications: { ...DEFAULT_NOTIFICATION_PREFS },
        privacy: { ...DEFAULT_PRIVACY_PREFS },
      }),
  }
}
