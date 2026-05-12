import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/stores/authStore";
import type { UserPreferenceJson } from "@/shared/types/api";
import { BACKGROUNDS, STATIC_BACKGROUNDS, ANIMATED_BACKGROUNDS } from "./constants";

const defaults: UserPreferenceJson = {
  theme: "light",
  background: "plain",
  density: "comfortable",
  language: "es",
  timezone: "",
  timeFormat: "24h",
  dateFormat: "DMY",
  reducedMotion: false,
  showCompletedCards: true,
  emailEnabled: true,
  pushEnabled: false,
  mentions: true,
  cardAssigned: true,
  cardDueSoon: true,
  boardInvites: true,
  weeklyDigest: false,
  profileVisibility: "workspace",
  showEmail: false,
  showActivity: true,
  allowDM: true,
  analyticsOptOut: false,
};

export interface SettingsState {
  theme: string;
  background: string;
  density: string;
  language: string;
  timezone: string;
  timeFormat: string;
  dateFormat: string;
  reducedMotion: boolean;
  showCompletedCards: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  mentions: boolean;
  cardAssigned: boolean;
  cardDueSoon: boolean;
  boardInvites: boolean;
  weeklyDigest: boolean;
  profileVisibility: string;
  showEmail: boolean;
  showActivity: boolean;
  allowDM: boolean;
  analyticsOptOut: boolean;

  apply: (patch: Partial<UserPreferenceJson>) => Promise<void>;
  reset: () => Promise<void>;

  setTheme: (v: string) => void;
  setBackground: (v: string) => void;
  setDensity: (v: string) => void;
  setLanguage: (v: string) => void;
  setTimezone: (v: string) => void;
  setTimeFormat: (v: string) => void;
  setDateFormat: (v: string) => void;
  setReducedMotion: (v: boolean) => void;
  setShowCompletedCards: (v: boolean) => void;
  setEmailEnabled: (v: boolean) => void;
  setPushEnabled: (v: boolean) => void;
  setMentions: (v: boolean) => void;
  setCardAssigned: (v: boolean) => void;
  setCardDueSoon: (v: boolean) => void;
  setBoardInvites: (v: boolean) => void;
  setWeeklyDigest: (v: boolean) => void;
  setProfileVisibility: (v: string) => void;
  setShowEmail: (v: boolean) => void;
  setShowActivity: (v: boolean) => void;
  setAllowDM: (v: boolean) => void;
  setAnalyticsOptOut: (v: boolean) => void;
}

function initFromUser(): Partial<SettingsState> {
  const user = useAuthStore.getState().user;
  return (user?.preference?.settings ?? {}) as Partial<SettingsState>;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    (set, get) => {
      const sync = () => {
        const user = useAuthStore.getState().user;
        const settings = user?.preference?.settings;
        if (settings) {
          set({ ...defaults, ...settings });
        } else {
          try {
            const raw = localStorage.getItem('kanban-appearance');
            if (raw) {
              const saved = JSON.parse(raw);
              set({ ...defaults, ...saved });
              return;
            }
          } catch { /* ignore */ }
          set({ ...defaults });
        }
      };

      useAuthStore.subscribe(
        (s: any) => s.user?.id,
        (userId: string | undefined, prevUserId: string | undefined) => {
          if (userId !== prevUserId) sync();
        },
      );

      const apply = async (patch: Partial<UserPreferenceJson>) => {
        set({ ...patch } as Partial<SettingsState>);
        if ('theme' in patch) {
          localStorage.setItem('kanban-public-theme', patch.theme!);
          window.dispatchEvent(new Event('public-theme-change'));
        }
        const user = useAuthStore.getState().user;
        if (user) {
          await useAuthStore.getState().updatePreferences(patch);
        }
      };

      return {
        ...defaults,
        ...initFromUser(),

        apply,
        reset: () => apply({ ...defaults }),

        setTheme: (v) => apply({ theme: v as any }),
        setBackground: (v) => apply({ background: v }),
        setDensity: (v) => apply({ density: v as any }),
        setLanguage: (v) => apply({ language: v as any }),
        setTimezone: (v) => apply({ timezone: v }),
        setTimeFormat: (v) => apply({ timeFormat: v as any }),
        setDateFormat: (v) => apply({ dateFormat: v as any }),
        setReducedMotion: (v) => apply({ reducedMotion: v }),
        setShowCompletedCards: (v) => apply({ showCompletedCards: v }),
        setEmailEnabled: (v) => apply({ emailEnabled: v }),
        setPushEnabled: (v) => apply({ pushEnabled: v }),
        setMentions: (v) => apply({ mentions: v }),
        setCardAssigned: (v) => apply({ cardAssigned: v }),
        setCardDueSoon: (v) => apply({ cardDueSoon: v }),
        setBoardInvites: (v) => apply({ boardInvites: v }),
        setWeeklyDigest: (v) => apply({ weeklyDigest: v }),
        setProfileVisibility: (v) => apply({ profileVisibility: v as any }),
        setShowEmail: (v) => apply({ showEmail: v }),
        setShowActivity: (v) => apply({ showActivity: v }),
        setAllowDM: (v) => apply({ allowDM: v }),
        setAnalyticsOptOut: (v) => apply({ analyticsOptOut: v }),
      } as SettingsState;
    },
    { name: "settingsStore" },
  ),
);

export { BACKGROUNDS, STATIC_BACKGROUNDS, ANIMATED_BACKGROUNDS };
