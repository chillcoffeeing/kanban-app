import { api } from "./api";
import type { AuthResponse, UserResponse } from "@/shared/types";

export function login(email: string, password: string) {
  return api<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

interface RegisterOptions {
  email: string;
  name: string;
  password: string;
  username?: string;
  displayName?: string;
  jobTitle?: string;
  company?: string;
}

export function register(opts: RegisterOptions) {
  return api<AuthResponse>("/auth/register", {
    method: "POST",
    body: opts,
    auth: false,
  });
}

export function account() {
  return api<UserResponse>("/auth/account");
}

export function logout(refreshToken: string) {
  return api<void>("/auth/logout", {
    method: "POST",
    body: { refreshToken },
  });
}
