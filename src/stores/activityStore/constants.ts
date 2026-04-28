import type { ActivityType } from "@/shared/types/domain";

export const ACTIVITY_TYPES = {
  BOARD_CREATED: "board_created",
  BOARD_RENAMED: "board_renamed",
  STAGE_CREATED: "stage_created",
  STAGE_RENAMED: "stage_renamed",
  STAGE_DELETED: "stage_deleted",
  CARD_CREATED: "card_created",
  CARD_UPDATED: "card_updated",
  CARD_MOVED: "card_moved",
  CARD_DELETED: "card_deleted",
  CARD_LABEL_ADDED: "card_label_added",
  CARD_LABEL_REMOVED: "card_label_removed",
  CARD_DATE_SET: "card_date_set",
  CARD_CHECKLIST_ADDED: "card_checklist_added",
  CARD_CHECKLIST_TOGGLED: "card_checklist_toggled",
  MEMBER_JOINED_CARD: "member_joined_card",
  MEMBER_LEFT_CARD: "member_left_card",
  MEMBER_INVITED: "member_invited",
  MEMBER_REMOVED: "member_removed",
} as const satisfies Record<string, ActivityType>;
