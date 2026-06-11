import { ApiClient } from "./api";
import type { AuthResponse, UserResponse } from "@/shared/types";

interface RegisterOptions {
  email: string;
  name: string;
  password: string;
  username?: string;
  displayName?: string;
  jobTitle?: string;
  company?: string;
}

export class AuthService {
  static login(email: string, password: string) {
    return ApiClient.post<AuthResponse>("/auth/login", { email, password }, { auth: false });
  }

  static register(opts: RegisterOptions) {
    return ApiClient.post<AuthResponse>("/auth/register", opts, { auth: false });
  }

  static account() {
    return ApiClient.get<UserResponse>("/auth/account");
  }

  static refresh(refreshToken: string) {
    return ApiClient.post<AuthResponse>("/auth/refresh", { refreshToken }, { auth: false });
  }

  static logout(refreshToken: string) {
    return ApiClient.post<void>("/auth/logout", { refreshToken });
  }
}
