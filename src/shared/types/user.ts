import { generateId } from '@/shared/utils/helpers'

export type AuthProvider =
  | 'local'
  | 'google'
  | 'github'
  | 'facebook'
  | 'apple'
  | 'microsoft'
  | 'x'

export const AUTH_PROVIDERS = {
  LOCAL: 'local',
  GOOGLE: 'google',
  GITHUB: 'github',
  FACEBOOK: 'facebook',
  APPLE: 'apple',
  MICROSOFT: 'microsoft',
  X: 'x',
} as const satisfies Record<string, AuthProvider>

export type UserRole = 'owner' | 'admin' | 'member' | 'guest'

export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  GUEST: 'guest',
} as const satisfies Record<string, UserRole>

export interface LinkedProvider {
  provider: AuthProvider
  providerId: string
  email: string | null
  avatarUrl: string | null
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  scopes: string[]
  linkedAt: string
}

export interface UserNotificationPrefs {
  emailEnabled: boolean
  pushEnabled: boolean
  mentions: boolean
  cardAssigned: boolean
  cardDueSoon: boolean
  boardInvites: boolean
  weeklyDigest: boolean
}

export interface UserPrivacyPrefs {
  profileVisibility: 'public' | 'workspace' | 'private'
  showEmail: boolean
  showActivity: boolean
  allowDM: boolean
  analyticsOptOut: boolean
}

export interface UserDisplayPrefs {
  theme: 'light' | 'dark' | 'midnight' | 'solarized' | 'system'
  background: string
  density: 'comfortable' | 'compact'
  language: 'es' | 'en'
  timezone: string
  timeFormat: '12h' | '24h'
  dateFormat: 'DMY' | 'MDY' | 'YMD'
  reducedMotion: boolean
  showCompletedCards: boolean
}

export interface UserSocialLinks {
  website: string | null
  twitter: string | null
  github: string | null
  linkedin: string | null
  instagram: string | null
}

export interface UserProfile {
  displayName: string
  bio: string | null
  avatarUrl: string | null
  coverUrl: string | null
  jobTitle: string | null
  company: string | null
  location: string | null
  socials: UserSocialLinks
}

export interface UserPreferences {
  display: UserDisplayPrefs
  notifications: UserNotificationPrefs
  privacy: UserPrivacyPrefs
}

export interface User {
  id: string
  email: string
  emailVerified: boolean
  name: string
  username: string | null
  primaryProvider: AuthProvider
  linkedProviders: LinkedProvider[]
  roles: UserRole[]
  profile: UserProfile
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  metadata: Record<string, unknown>
}

export const DEFAULT_DISPLAY_PREFS: UserDisplayPrefs = {
  theme: 'light',
  background: 'plain',
  density: 'comfortable',
  language: 'es',
  timezone:
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'UTC',
  timeFormat: '24h',
  dateFormat: 'DMY',
  reducedMotion: false,
  showCompletedCards: true,
}

export const DEFAULT_NOTIFICATION_PREFS: UserNotificationPrefs = {
  emailEnabled: true,
  pushEnabled: false,
  mentions: true,
  cardAssigned: true,
  cardDueSoon: true,
  boardInvites: true,
  weeklyDigest: false,
}

export const DEFAULT_PRIVACY_PREFS: UserPrivacyPrefs = {
  profileVisibility: 'workspace',
  showEmail: false,
  showActivity: true,
  allowDM: true,
  analyticsOptOut: false,
}

export const DEFAULT_SOCIAL_LINKS: UserSocialLinks = {
  website: null,
  twitter: null,
  github: null,
  linkedin: null,
  instagram: null,
}

export const DEFAULT_PROFILE: UserProfile = {
  displayName: '',
  bio: null,
  avatarUrl: null,
  coverUrl: null,
  jobTitle: null,
  company: null,
  location: null,
  socials: { ...DEFAULT_SOCIAL_LINKS },
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  display: { ...DEFAULT_DISPLAY_PREFS },
  notifications: { ...DEFAULT_NOTIFICATION_PREFS },
  privacy: { ...DEFAULT_PRIVACY_PREFS },
}

function mergePreferences(
  base: UserPreferences,
  incoming: Partial<UserPreferences> = {}
): UserPreferences {
  return {
    display: { ...base.display, ...(incoming.display || {}) },
    notifications: {
      ...base.notifications,
      ...(incoming.notifications || {}),
    },
    privacy: { ...base.privacy, ...(incoming.privacy || {}) },
  }
}

function mergeProfile(
  base: UserProfile,
  incoming: Partial<UserProfile> = {}
): UserProfile {
  return {
    ...base,
    ...incoming,
    socials: { ...base.socials, ...(incoming?.socials || {}) },
  }
}

export interface CreateUserInput extends Partial<User> {
  provider?: LinkedProvider
}

export function createUser(partial: CreateUserInput = {}): User {
  const now = new Date().toISOString()
  const primaryProvider = partial.primaryProvider || 'local'
  const linked: LinkedProvider[] = partial.linkedProviders?.length
    ? partial.linkedProviders
    : partial.provider
      ? [partial.provider]
      : [
          {
            provider: primaryProvider,
            providerId: partial.id || generateId(),
            email: partial.email || null,
            avatarUrl: partial.profile?.avatarUrl || null,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            scopes: [],
            linkedAt: now,
          },
        ]

  return {
    id: partial.id || generateId(),
    email: partial.email || '',
    emailVerified: partial.emailVerified ?? false,
    name: partial.name || partial.email?.split('@')[0] || 'Usuario',
    username: partial.username ?? null,
    primaryProvider,
    linkedProviders: linked,
    roles: partial.roles?.length ? partial.roles : ['member'],
    profile: mergeProfile(
      { ...DEFAULT_PROFILE, displayName: partial.name || '' },
      partial.profile
    ),
    preferences: mergePreferences(DEFAULT_PREFERENCES, partial.preferences),
    createdAt: partial.createdAt || now,
    updatedAt: now,
    lastLoginAt: partial.lastLoginAt || now,
    metadata: partial.metadata || {},
  }
}

export function updateUser(user: User, patch: Partial<User> = {}): User {
  return {
    ...user,
    ...patch,
    profile: patch.profile
      ? mergeProfile(user.profile, patch.profile)
      : user.profile,
    preferences: patch.preferences
      ? mergePreferences(user.preferences, patch.preferences)
      : user.preferences,
    updatedAt: new Date().toISOString(),
  }
}
