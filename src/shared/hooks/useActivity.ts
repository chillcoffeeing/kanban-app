import { useActivityStore } from '@/stores/activityStore'
import { useAuthStore } from '@/stores/authStore'
import type { ActivityType } from '@/shared/types/domain'

export function useActivity(boardId: string | undefined) {
  const logActivity = useActivityStore((s) => s.log)
  const user = useAuthStore((s) => s.user)

  return (
    type: ActivityType,
    detail: string,
    meta: Record<string, unknown> = {}
  ) => {
    if (!boardId) return
    logActivity(boardId, {
      type,
      user: user?.profile?.displayName || user?.name || 'Usuario',
      detail,
      meta,
    })
  }
}
