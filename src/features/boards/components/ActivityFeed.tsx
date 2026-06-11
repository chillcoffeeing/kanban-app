import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useActivityStore } from '@/stores/activityStore'
import { useBoardStore } from '@/stores/boardStore'
import { MemberAvatar } from '@/shared/components/MemberAvatar'
import {
  KanbanIcon,
  ArrowSquareOutIcon,
} from '@phosphor-icons/react'
import { useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

interface ActivityFeedProps {
  isOpen: boolean
  onClose: () => void
}

export function ActivityFeed({ isOpen, onClose }: ActivityFeedProps) {
  const activities = useActivityStore((activityState) => activityState.activities)
  const currentBoard = useBoardStore((s) => s.currentBoard)
  const loadCard = useBoardStore((s) => s.loadCard)
  const [searchParams, setSearchParams] = useSearchParams()

  const getRelativeTime = useMemo(() => {
    return (timestamp: string): string =>
      formatDistanceToNow(new Date(timestamp), { locale: es, addSuffix: true })
  }, [])

  const handleCardClick = useCallback((cardId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("card-id", cardId);
    setSearchParams(params, { replace: false });
    loadCard(cardId);
  }, [searchParams, setSearchParams, loadCard])

  return (
    <div
       className={`fixed right-0 top-0 z-40 flex h-full w-80 flex-col border-l border-neutral-light bg-surface shadow-xl transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between border-b border-neutral-light px-4 py-3">
        <h3 className="text-sm font-semibold text-neutral-dark">Actividad</h3>
        <button
          onClick={onClose}
           className="cursor-pointer rounded-lg px-2 py-1 text-xs text-neutral-dark/70 hover:bg-neutral-light-hover transition-colors"
        >
          Cerrar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-dark/40">
            <KanbanIcon size={40} weight="duotone" className="mb-2 opacity-40" />
            <p className="text-sm">Sin actividad aún</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-light/50">
            {activities.map((activity) => {
              const cardId = activity.type !== "card_deleted"
                ? (activity.meta?.cardId as string | undefined)
                : undefined
              const member = activity.membershipId
                ? currentBoard?.members.find((m) => m.id === activity.membershipId)?.user
                : undefined

              return (
                <div key={activity.id} className="flex gap-3 px-4 py-3 hover:bg-neutral-light-hover/50 transition-colors">
                  {member ? (
                    <MemberAvatar
                      name={member.name}
                      avatar={member.avatarUrl ?? undefined}
                      userId={member.id}
                      size="sm"
                    />
                  ) : (
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-light text-xs font-semibold text-neutral-dark/60">
                      {activity.user[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-neutral-dark leading-snug">
                      <span className="font-medium text-neutral-dark">{activity.user}</span>{' '}
                      {activity.detail}
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-dark/50">
                      {getRelativeTime(activity.timestamp)}
                      {cardId && (
                        <button
                          onClick={() => handleCardClick(cardId)}
                          className="ml-2 inline-flex items-center gap-0.5 text-primary hover:text-primary-hover cursor-pointer transition-colors"
                        >
                          <ArrowSquareOutIcon size={12} weight="bold" />
                          Ver tarjeta
                        </button>
                      )}
                    </div>
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
