import { createUser, type User } from "@/shared/types/user";
import type { BackendUser } from "@/shared/types";

const USER_KEY = "canvan_user";
const REFRESH_KEY = "canvan_refresh_token";

export function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw);
    return stored?.preferences ? (stored as User) : createUser(stored);
  } catch {
    return null;
  }
}

export function persistUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function fromBackend(raw: BackendUser): User {
  return createUser({
    id: raw.id,
    email: raw.email,
    name: raw.name,
    roles: (raw.roles as User["roles"]) ?? ["member"],
    profile: (raw.profile as unknown as User["profile"]) ?? undefined,
    preferences:
      (raw.preferences as unknown as User["preferences"]) ?? undefined,
    createdAt: raw.createdAt,
    lastLoginAt: raw.lastLoginAt ?? new Date().toISOString(),
  });
}

export { USER_KEY, REFRESH_KEY };
