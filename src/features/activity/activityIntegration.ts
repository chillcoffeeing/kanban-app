import { eventBus } from "@/shared/utils/eventBus";
import { useActivityStore } from "@/stores/activityStore";
import { useAuthStore } from "@/stores/authStore";
import type { ActivityType } from "@/shared/types/domain";

const ACTIVITY_EVENTS = {
  BOARD_RENAMED: "board:renamed",
  STAGE_CREATED: "stage:created",
  STAGE_RENAMED: "stage:renamed",
  STAGE_DELETED: "stage:deleted",
  CARD_CREATED: "card:created",
  CARD_UPDATED: "card:updated",
  CARD_MOVED: "card:moved",
  CARD_DELETED: "card:deleted",
  CARD_LABEL_ADDED: "card:label_added",
  CARD_LABEL_REMOVED: "card:label_removed",
  CARD_DATE_SET: "card:date_set",
  CARD_CHECKLIST_ADDED: "card:checklist_added",
  CARD_CHECKLIST_TOGGLED: "card:checklist_toggled",
  MEMBER_JOINED: "member:joined",
  MEMBER_LEFT: "member:left",
} as const;

function getUserName(): string {
  const user = useAuthStore.getState().user;
  return user?.profile?.profile?.displayName || user?.name || "Usuario";
}

function mapEventType(event: string): ActivityType | null {
  const map: Record<string, ActivityType> = {
    [ACTIVITY_EVENTS.BOARD_RENAMED]: "board_renamed",
    [ACTIVITY_EVENTS.STAGE_CREATED]: "stage_created",
    [ACTIVITY_EVENTS.STAGE_RENAMED]: "stage_renamed",
    [ACTIVITY_EVENTS.STAGE_DELETED]: "stage_deleted",
    [ACTIVITY_EVENTS.CARD_CREATED]: "card_created",
    [ACTIVITY_EVENTS.CARD_UPDATED]: "card_updated",
    [ACTIVITY_EVENTS.CARD_MOVED]: "card_moved",
    [ACTIVITY_EVENTS.CARD_DELETED]: "card_deleted",
    [ACTIVITY_EVENTS.CARD_LABEL_ADDED]: "card_label_added",
    [ACTIVITY_EVENTS.CARD_LABEL_REMOVED]: "card_label_removed",
    [ACTIVITY_EVENTS.CARD_DATE_SET]: "card_date_set",
    [ACTIVITY_EVENTS.CARD_CHECKLIST_ADDED]: "card_checklist_added",
    [ACTIVITY_EVENTS.CARD_CHECKLIST_TOGGLED]: "card_checklist_toggled",
    [ACTIVITY_EVENTS.MEMBER_JOINED]: "member_joined",
    [ACTIVITY_EVENTS.MEMBER_LEFT]: "member_removed",
  };
  return map[event] ?? null;
}

export function initActivityIntegration() {
  const cleanups: (() => void)[] = [];

  const handler = (event: string) => (payload: unknown) => {
    const p = payload as Record<string, unknown> | undefined;
    if (!p) return;

    const boardId = p.boardId as string;
    const detail = p.detail as string;
    const type = mapEventType(event);
    if (!boardId || !detail || !type) return;

    const userName = (p.userName as string) || getUserName();
    const membershipId = p.membershipId as string | undefined;
    useActivityStore.getState().log(boardId, {
      type,
      user: userName,
      detail,
      meta: p.meta as Record<string, unknown> | undefined,
      membershipId,
    });
  };

  for (const event of Object.values(ACTIVITY_EVENTS)) {
    cleanups.push(eventBus.on(event, handler(event)));
  }

  return () => cleanups.forEach((fn) => fn());
}
