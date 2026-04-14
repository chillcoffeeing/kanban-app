import { create } from 'zustand'
import { generateId } from '@/shared/utils/helpers'
import type { ActivityEntry, ActivityType } from '@/shared/types/domain'

function getStorageKey(boardId: string) {
  return `canvan_activity_${boardId}`
}

interface ActivityState {
  activities: ActivityEntry[]
  loadActivities: (boardId: string) => void
  log: (
    boardId: string,
    payload: {
      type: ActivityType
      user: string
      detail: string
      meta?: Record<string, unknown>
    }
  ) => void
  clearActivities: (boardId: string) => void
}

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [],

  loadActivities: (boardId) => {
    const raw = localStorage.getItem(getStorageKey(boardId))
    const activities: ActivityEntry[] = raw ? JSON.parse(raw) : []
    set({ activities })
  },

  log: (boardId, { type, user, detail, meta = {} }) => {
    const entry: ActivityEntry = {
      id: generateId(),
      type,
      user,
      detail,
      meta,
      timestamp: new Date().toISOString(),
    }
    set((state) => {
      const activities = [entry, ...state.activities].slice(0, 200)
      localStorage.setItem(getStorageKey(boardId), JSON.stringify(activities))
      return { activities }
    })
  },

  clearActivities: (boardId) => {
    localStorage.removeItem(getStorageKey(boardId))
    set({ activities: [] })
  },
}))

export const ACTIVITY_TYPES = {
  BOARD_CREATED: 'board_created',
  BOARD_RENAMED: 'board_renamed',
  STAGE_CREATED: 'stage_created',
  STAGE_RENAMED: 'stage_renamed',
  STAGE_DELETED: 'stage_deleted',
  CARD_CREATED: 'card_created',
  CARD_UPDATED: 'card_updated',
  CARD_MOVED: 'card_moved',
  CARD_DELETED: 'card_deleted',
  CARD_LABEL_ADDED: 'card_label_added',
  CARD_LABEL_REMOVED: 'card_label_removed',
  CARD_DATE_SET: 'card_date_set',
  CARD_CHECKLIST_ADDED: 'card_checklist_added',
  CARD_CHECKLIST_TOGGLED: 'card_checklist_toggled',
  MEMBER_JOINED_CARD: 'member_joined_card',
  MEMBER_LEFT_CARD: 'member_left_card',
  MEMBER_INVITED: 'member_invited',
  MEMBER_REMOVED: 'member_removed',
} as const satisfies Record<string, ActivityType>
