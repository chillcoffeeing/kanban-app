import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { subscribeWithSelector } from "zustand/middleware";
import { TokenManager } from "@/services/api";
import type { AuthState } from "./types";
import { createAuthActions } from "./authActions";
import { createUserActions } from "./userActions";

export const useAuthStore = create<AuthState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      user: null,
      token: TokenManager.getAccess(),
      isAuthenticated: !!TokenManager.getAccess(),
      ...createAuthActions(set, get),
      ...createUserActions(set, get),
    })),
    { name: "authStore" },
  ),
);
