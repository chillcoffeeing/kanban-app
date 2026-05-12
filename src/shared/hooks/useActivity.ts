import { useActivityStore } from '@/stores/activityStore'
import { useAuthStore } from '@/stores/authStore'
import type { ActivityType } from '@/shared/types/domain'

export function useActivity(boardId: string | undefined) {
  const logActivity = useActivityStore((activityState) => activityState.log)
  const user = useAuthStore((state) => state.user)

  return (
    type: ActivityType,
    detail: string,
    meta: Record<string, unknown> = {}
  ) => {
    if (!boardId) return
    logActivity(boardId, {
      type,
      user: user?.profile?.profile?.displayName || user?.name || 'Usuario',
      detail,
      meta,
    })
  }
}
