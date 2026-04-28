/**
 * Tipos de dominio del producto (Board / Stage / Card / Activity).
 * Usa junto con `user.ts` (auth).
 */

import { BackendCardMember } from "./api";

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  position: number;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  labels: Label[];
  checklist: ChecklistItem[];
  members: BackendCardMember[];
  dueDate: string | null;
  startDate: string | null;
  createdAt: string;
  position: number;
}

export interface Stage {
  id: string;
  name: string;
  cards: Card[];
  createdAt: string;
}

export type Permission =
  | "create_stage"
  | "create_card"
  | "modify_card"
  | "delete_card"
  | "invite_member";

export type MemberRole = "owner" | "admin" | "member";

export interface BoardMember {
  userId: string;
  email: string;
  permissions: Permission[];
  role: MemberRole;
  id: string;
  boardId: string;
  invitedAt: string;
  user?: {
    name: string;
    avatarUrl: string | null;
    createdAt: string;
  };
}

export interface BoardPreferences {
  visibility: "workspace" | "private";
  commentPermission: "members" | "workspace" | "disabled";
  memberPermission: "members" | "admins";
  workspaceEdit: boolean;
  showCompletedOnCard: boolean;
  coversEnabled: boolean;
}

export interface Board {
  id: string;
  name: string;
  background: string;
  ownerId: string;
  members: BoardMember[];
  stages: Stage[];
  labels: Label[];
  preferences?: BoardPreferences;
  createdAt: string;
}

/* -------------------------- Activity feed --------------------------- */

export type ActivityType =
  | "board_created"
  | "board_renamed"
  | "stage_created"
  | "stage_renamed"
  | "stage_deleted"
  | "card_created"
  | "card_updated"
  | "card_moved"
  | "card_deleted"
  | "card_label_added"
  | "card_label_removed"
  | "card_date_set"
  | "card_checklist_added"
  | "card_checklist_toggled"
  | "member_joined_card"
  | "member_left_card"
  | "member_invited"
  | "member_removed";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  user: string;
  detail: string;
  meta: Record<string, unknown>;
  timestamp: string;
}
