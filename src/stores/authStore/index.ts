import { create } from "zustand";
import { getAccessToken } from "@/services/api";
import type { AuthState } from "./types";
import { readStoredUser } from "./utils";
import { createAuthActions } from "./authActions";
import { createUserActions } from "./userActions";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: readStoredUser(),
  token: getAccessToken(),
  isAuthenticated: !!getAccessToken(),

  ...createAuthActions(set, get),
  ...createUserActions(set, get),
}));
