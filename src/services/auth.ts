import { api } from './api'

export interface BackendUser {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
  roles?: string[]
  profile?: Record<string, unknown>
  preferences?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
  lastLoginAt?: string | null
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: BackendUser
}

export function login(email: string, password: string) {
  return api<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
}

export function register(email: string, name: string, password: string) {
  return api<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { email, name, password },
    auth: false,
  })
}

export function account() {
  return api<BackendUser>('/auth/account')
}

export function logout(refreshToken: string) {
  return api<void>('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
  })
}
