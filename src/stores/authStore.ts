import { create } from 'zustand'
import {
  createUser,
  updateUser as patchUser,
  type User,
} from '@/shared/types/user'
import * as authApi from '@/services/auth'
import {
  clearTokens,
  getAccessToken,
  setTokens,
  ApiError,
} from '@/services/api'

const USER_KEY = 'canvan_user'
const REFRESH_KEY = 'canvan_refresh_token'

function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    const stored = JSON.parse(raw)
    return stored?.preferences ? (stored as User) : createUser(stored)
  } catch {
    return null
  }
}

function persistUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function fromBackend(raw: authApi.BackendUser): User {
  return createUser({
    id: raw.id,
    email: raw.email,
    name: raw.name,
    roles: (raw.roles as User['roles']) ?? ['member'],
    profile: (raw.profile as unknown as User['profile']) ?? undefined,
    preferences: (raw.preferences as unknown as User['preferences']) ?? undefined,
    createdAt: raw.createdAt,
    lastLoginAt: raw.lastLoginAt ?? new Date().toISOString(),
  })
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  /** Internal counter to force re-renders when guest settings change. */
  _guestBump?: number

  /** Authenticate against the backend using email/password. */
  login: (email: string, password: string) => Promise<void>
  /** Create a new account and log in. */
  register: (email: string, name: string, password: string) => Promise<void>
  /** Re-hydrate the session from persisted tokens on app boot. */
  hydrate: () => Promise<void>
  logout: () => Promise<void>
  updateUser: (patch: Partial<User> | ((u: User) => User)) => void
  updateProfile: (patch: Partial<User['profile']>) => void
  updatePreferences: (patch: Partial<User['preferences']>) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: readStoredUser(),
  token: getAccessToken(),
  isAuthenticated: !!getAccessToken(),

  login: async (email, password) => {
    const res = await authApi.login(email, password)
    setTokens(res.accessToken, res.refreshToken)
    const user = fromBackend(res.user)
    persistUser(user)
    set({ user, token: res.accessToken, isAuthenticated: true })
  },

  register: async (email, name, password) => {
    const res = await authApi.register(email, name, password)
    setTokens(res.accessToken, res.refreshToken)
    const user = fromBackend(res.user)
    persistUser(user)
    set({ user, token: res.accessToken, isAuthenticated: true })
  },

  hydrate: async () => {
    const token = getAccessToken()
    if (!token) return
    try {
      const raw = await authApi.account()
      const user = fromBackend(raw)
      persistUser(user)
      set({ user, token, isAuthenticated: true })
    } catch (err) {
      // Token inválido/expirado: limpiar sesión.
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        clearTokens()
        localStorage.removeItem(USER_KEY)
        set({ user: null, token: null, isAuthenticated: false })
      }
    }
  },

  logout: async () => {
    const refresh = localStorage.getItem(REFRESH_KEY)
    if (refresh) {
      try {
        await authApi.logout(refresh)
      } catch {
        /* ignore */
      }
    }
    clearTokens()
    localStorage.removeItem(USER_KEY)
    set({ user: null, token: null, isAuthenticated: false })
  },

  updateUser: (patch) => {
    const current = get().user
    if (!current) return
    const user =
      typeof patch === 'function' ? patch(current) : patchUser(current, patch)
    persistUser(user)
    set({ user })
  },

  updateProfile: (profilePatch) => {
    get().updateUser({ profile: profilePatch as User['profile'] })
  },

  updatePreferences: (prefsPatch) => {
    get().updateUser({ preferences: prefsPatch as User['preferences'] })
  },
}))
