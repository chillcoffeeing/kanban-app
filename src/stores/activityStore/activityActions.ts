import { generateId } from "@/shared/utils/helpers";
import type { ActivityEntry, ActivityType } from "@/shared/types/domain";
import { ActivityService } from "@/services/activity";
import { getStorageKey } from "./utils";

export function createActivityActions(set: any) {
  return {
    loadActivities: async (boardId: string) => {
      const raw = localStorage.getItem(getStorageKey(boardId));
      const local: ActivityEntry[] = raw ? JSON.parse(raw) : [];

      try {
        const remote = await ActivityService.listByBoard(boardId, { limit: 50 });
        const mapped: ActivityEntry[] = remote.map((r) => ({
          id: r.id,
          type: r.type as ActivityType,
          user: r.userName || "",
          detail: r.detail,
          meta: r.meta,
          timestamp: r.createdAt,
          membershipId: r.membershipId ?? undefined,
        }));
        set({ activities: mapped });
      } catch {
        set({ activities: local });
      }
    },

    log: (
      boardId: string,
      {
        type,
        user,
        detail,
        meta = {},
        membershipId,
      }: {
        type: ActivityType;
        user: string;
        detail: string;
        meta?: Record<string, unknown>;
        membershipId?: string;
      },
    ) => {
      const entry: ActivityEntry = {
        id: generateId(),
        type,
        user,
        detail,
        meta,
        timestamp: new Date().toISOString(),
        membershipId,
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
