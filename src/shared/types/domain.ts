/**
 * Tipos de dominio del producto (Board / Stage / Card / Attachment / Activity).
 * Usa junto con `user.ts` (auth).
 */

export interface Label {
  name: string
  value: string // hex color
}

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
  uploadedBy: string | null
  uploadedAt: string // ISO
}

export interface Card {
  id: string
  title: string
  description: string
  labels: Label[]
  checklist: ChecklistItem[]
  members: string[]
  dueDate: string | null
  startDate: string | null
  attachments: Attachment[]
  coverAttachmentId: string | null
  createdAt: string
}

export interface Stage {
  id: string
  name: string
  cards: Card[]
  createdAt: string
}

export type Permission =
  | 'create_stage'
  | 'create_card'
  | 'modify_card'
  | 'delete_card'
  | 'invite_member'
  | 'modify_board'

export type MemberRole = 'owner' | 'admin' | 'member'

export interface BoardMember {
  userId: string
  email?: string
  permissions: Permission[]
  role: MemberRole
}

export interface BoardPreferences {
  visibility: 'workspace' | 'private'
  commentPermission: 'members' | 'workspace' | 'disabled'
  memberPermission: 'members' | 'admins'
  workspaceEdit: boolean
  showCompletedOnCard: boolean
  coversEnabled: boolean
}

export interface Board {
  id: string
  name: string
  background: string
  ownerId: string
  members: BoardMember[]
  stages: Stage[]
  preferences?: BoardPreferences
  createdAt: string
}

/* -------------------------- Activity feed --------------------------- */

export type ActivityType =
  | 'board_created'
  | 'board_renamed'
  | 'stage_created'
  | 'stage_renamed'
  | 'stage_deleted'
  | 'card_created'
  | 'card_updated'
  | 'card_moved'
  | 'card_deleted'
  | 'card_label_added'
  | 'card_label_removed'
  | 'card_date_set'
  | 'card_checklist_added'
  | 'card_checklist_toggled'
  | 'member_joined_card'
  | 'member_left_card'
  | 'member_invited'
  | 'member_removed'

export interface ActivityEntry {
  id: string
  type: ActivityType
  user: string
  detail: string
  meta: Record<string, unknown>
  timestamp: string
}
