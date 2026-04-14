import { useActivityStore, ACTIVITY_TYPES } from '@/stores/activityStore'
import type { ActivityType } from '@/shared/types/domain'
import {
  Kanban,
  Stack,
  FileText,
  ArrowsLeftRight,
  Trash,
  Tag,
  CalendarBlank,
  CheckCircle,
  UserPlus,
  UserMinus,
  NotePencil,
} from '@phosphor-icons/react'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'

const ICON_MAP: Partial<Record<ActivityType, PhosphorIcon>> = {
  [ACTIVITY_TYPES.BOARD_CREATED]: Kanban,
  [ACTIVITY_TYPES.BOARD_RENAMED]: NotePencil,
  [ACTIVITY_TYPES.STAGE_CREATED]: Stack,
  [ACTIVITY_TYPES.STAGE_RENAMED]: NotePencil,
  [ACTIVITY_TYPES.STAGE_DELETED]: Trash,
  [ACTIVITY_TYPES.CARD_CREATED]: FileText,
  [ACTIVITY_TYPES.CARD_UPDATED]: NotePencil,
  [ACTIVITY_TYPES.CARD_MOVED]: ArrowsLeftRight,
  [ACTIVITY_TYPES.CARD_DELETED]: Trash,
  [ACTIVITY_TYPES.CARD_LABEL_ADDED]: Tag,
  [ACTIVITY_TYPES.CARD_LABEL_REMOVED]: Tag,
  [ACTIVITY_TYPES.CARD_DATE_SET]: CalendarBlank,
  [ACTIVITY_TYPES.CARD_CHECKLIST_ADDED]: CheckCircle,
  [ACTIVITY_TYPES.CARD_CHECKLIST_TOGGLED]: CheckCircle,
  [ACTIVITY_TYPES.MEMBER_JOINED_CARD]: UserPlus,
  [ACTIVITY_TYPES.MEMBER_LEFT_CARD]: UserMinus,
  [ACTIVITY_TYPES.MEMBER_INVITED]: UserPlus,
  [ACTIVITY_TYPES.MEMBER_REMOVED]: UserMinus,
}

const COLOR_MAP: Partial<Record<ActivityType, string>> = {
  [ACTIVITY_TYPES.CARD_DELETED]: 'text-red-500 bg-red-50',
  [ACTIVITY_TYPES.STAGE_DELETED]: 'text-red-500 bg-red-50',
  [ACTIVITY_TYPES.MEMBER_REMOVED]: 'text-red-500 bg-red-50',
  [ACTIVITY_TYPES.MEMBER_LEFT_CARD]: 'text-amber-500 bg-amber-50',
  [ACTIVITY_TYPES.CARD_MOVED]: 'text-blue-500 bg-blue-50',
  [ACTIVITY_TYPES.MEMBER_INVITED]: 'text-green-500 bg-green-50',
  [ACTIVITY_TYPES.MEMBER_JOINED_CARD]: 'text-green-500 bg-green-50',
  [ACTIVITY_TYPES.CARD_CREATED]: 'text-green-500 bg-green-50',
  [ACTIVITY_TYPES.STAGE_CREATED]: 'text-green-500 bg-green-50',
}

function formatRelative(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Ahora'
  if (diffMin < 60) return `hace ${diffMin}m`
  if (diffHr < 24) return `hace ${diffHr}h`
  if (diffDay < 7) return `hace ${diffDay}d`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

interface ActivityFeedProps {
  isOpen: boolean
  onClose: () => void
}

export function ActivityFeed({ isOpen, onClose }: ActivityFeedProps) {
  const activities = useActivityStore((s) => s.activities)

  return (
    <div
      className={`fixed right-0 top-0 z-40 flex h-full w-80 flex-col border-l border-surface-200 bg-white shadow-xl transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-surface-900">Actividad</h3>
        <button
          onClick={onClose}
          className="cursor-pointer rounded-lg px-2 py-1 text-xs text-surface-500 hover:bg-surface-100"
        >
          Cerrar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-surface-400">
            <Kanban size={40} weight="duotone" className="mb-2" />
            <p className="text-sm">Sin actividad aún</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {activities.map((activity) => {
              const Icon = ICON_MAP[activity.type] || FileText
              const colorClass = COLOR_MAP[activity.type] || 'text-primary-500 bg-primary-50'

              return (
                <div key={activity.id} className="flex gap-3 px-4 py-3">
                  <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                    <Icon size={18} weight="duotone" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-700 leading-snug">
                      <span className="font-medium text-surface-900">{activity.user}</span>{' '}
                      {activity.detail}
                    </p>
                    <p className="mt-0.5 text-xs text-surface-400">{formatRelative(activity.timestamp)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
