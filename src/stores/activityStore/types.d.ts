import type { ActivityEntry, ActivityType } from "@/shared/types/domain";

export interface ActivityState {
  activities: ActivityEntry[];
  loadActivities: (boardId: string) => void;
  log: (
    boardId: string,
    payload: {
      type: ActivityType;
      user: string;
      detail: string;
      meta?: Record<string, unknown>;
    },
  ) => void;
  clearActivities: (boardId: string) => void;
}
