import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarBlank, CheckCircle, ChatCircle, Paperclip } from '@phosphor-icons/react'
import { isOverdue } from '@/shared/utils/helpers'
import { useFormatDate } from '@/shared/hooks/useFormatDate'
import { useBoardStore } from '@/stores/boardStore'
import { getBoardPreferences } from '@/features/boards/utils/boardPreferences'
import type { Card } from '@/shared/types/domain'

interface CardItemProps {
  card: Card
  stageId: string
  boardId: string
  onClick?: () => void
}

export function CardItem({ card, stageId, boardId, onClick }: CardItemProps) {
  const board = useBoardStore((s) => s.boards.find((b) => b.id === boardId))
  const prefs = getBoardPreferences(board)
  const formatDate = useFormatDate()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', card, stageId, boardId },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const completedChecks = card.checklist?.filter((c) => c.done).length || 0
  const totalChecks = card.checklist?.length || 0
  const isComplete = totalChecks > 0 && completedChecks === totalChecks

  const attachments = card.attachments || []
  const coverAttachment = prefs.coversEnabled
    ? attachments.find(
        (a) =>
          a.id === card.coverAttachmentId && a.type?.startsWith('image/')
      )
    : null
  const coverColor = prefs.coversEnabled ? card.labels?.[0]?.value : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`group cursor-pointer overflow-hidden rounded-card border border-border-default bg-bg-card shadow-card transition-shadow hover:shadow-card-hover hover:bg-bg-card-hover ${
        isDragging ? 'opacity-50 shadow-card-hover' : ''
      }`}
    >
      {coverAttachment ? (
        <img
          src={coverAttachment.dataUrl}
          alt={coverAttachment.name}
          className="h-28 w-full object-cover"
        />
      ) : coverColor ? (
        <div className="h-2 w-full" style={{ backgroundColor: coverColor }} />
      ) : null}
      <div className="p-3">
        {prefs.coversEnabled && card.labels?.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {card.labels.map((label) => (
              <span
                key={label.value}
                className="h-2 w-10 rounded-full"
                style={{ backgroundColor: label.value }}
                title={label.name}
              />
            ))}
          </div>
        )}

        <p className="text-card-title text-fg-default">{card.title}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-card-meta text-fg-subtle">
          {prefs.showCompletedOnCard && isComplete && (
            <span className="flex items-center gap-1 rounded-badge bg-bg-success px-1.5 py-0.5 text-fg-success">
              <CheckCircle size={16} weight="fill" /> Completado
            </span>
          )}
          {card.dueDate && (
            <span
              className={`flex items-center gap-1 rounded-badge px-1.5 py-0.5 ${
                isOverdue(card.dueDate)
                  ? 'bg-bg-danger text-fg-danger'
                  : 'bg-bg-muted'
              }`}
            >
              <CalendarBlank size={16} weight="duotone" />
              {formatDate(card.dueDate)}
            </span>
          )}
          {totalChecks > 0 && (
            <span
              className={`flex items-center gap-1 rounded-badge px-1.5 py-0.5 ${
                isComplete ? 'bg-bg-success text-fg-success' : 'bg-bg-muted'
              }`}
            >
              <CheckCircle size={16} weight="duotone" />
              {completedChecks}/{totalChecks}
            </span>
          )}
          {card.description && (
            <span className="flex items-center gap-1">
              <ChatCircle size={16} weight="duotone" />
            </span>
          )}
          {attachments.length > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip size={16} weight="duotone" />
              {attachments.length}
            </span>
          )}
          {card.members?.length > 0 && (
            <div className="ml-auto flex -space-x-1">
              {card.members.slice(0, 3).map((m) => (
                <div
                  key={m}
                  className="h-5 w-5 rounded-full bg-primary-400 text-[10px] text-white flex items-center justify-center ring-2 ring-white"
                >
                  {m[0]?.toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
