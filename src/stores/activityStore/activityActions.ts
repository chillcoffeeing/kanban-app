import { generateId } from "@/shared/utils/helpers";
import type { ActivityEntry, ActivityType } from "@/shared/types/domain";
import { getStorageKey } from "./utils";

export function createActivityActions(set: any) {
  return {
    loadActivities: (boardId: string) => {
      const raw = localStorage.getItem(getStorageKey(boardId));
      const activities: ActivityEntry[] = raw ? JSON.parse(raw) : [];
      set({ activities });
    },

    log: (
      boardId: string,
      {
        type,
        user,
        detail,
        meta = {},
      }: {
        type: ActivityType;
        user: string;
        detail: string;
        meta?: Record<string, unknown>;
      },
    ) => {
      const entry: ActivityEntry = {
        id: generateId(),
        type,
        user,
        detail,
        meta,
        timestamp: new Date().toISOString(),
      };
      set((state: any) => {
        const activities = [entry, ...state.activities].slice(0, 200);
        localStorage.setItem(
          getStorageKey(boardId),
          JSON.stringify(activities),
        );
        return { activities };
      });
    },

    clearActivities: (boardId: string) => {
      localStorage.removeItem(getStorageKey(boardId));
      set({ activities: [] });
    },
  };
}
