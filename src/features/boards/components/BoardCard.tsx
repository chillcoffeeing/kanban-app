import type { Board } from '@/shared/types/domain'
import { getBoardBackgroundClasses, ROLE_LABELS } from '@/shared/utils/constants'

interface BoardCardProps {
  board: Board
  onClick: () => void
}

export function BoardCard({ board, onClick }: BoardCardProps) {
  const stagesCount = board.stagesCount ?? board.stages?.length ?? 0
  const membersCount = board.membersCount ?? board.members?.length ?? 0
  const cardsCount = board.cardsCount ?? 0

  const { gradientClass, textColorClass } = getBoardBackgroundClasses(board.background)

  return (
    <button
      onClick={onClick}
      className={`group relative flex h-44 w-full cursor-pointer flex-col overflow-hidden rounded-xl p-5 text-left shadow-md transition-all hover:shadow-xl hover:scale-[1.03] duration-200 ${gradientClass} ${textColorClass}`}
    >
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-semibold leading-tight">{board.name}</h3>
          {board.role && (
            <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm">
              {ROLE_LABELS[board.role] ?? board.role}
            </span>
          )}
        </div>

        <p className="mt-2 text-sm opacity-80">
          {stagesCount} etapa{stagesCount !== 1 ? 's' : ''} &middot; {cardsCount} tarjeta{cardsCount !== 1 ? 's' : ''}
        </p>

        <p className="mt-1 text-sm opacity-70">
          {membersCount} miembro{membersCount !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
    </button>
  )
}
