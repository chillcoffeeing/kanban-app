import { UsersThreeIcon, StackIcon, CardsIcon } from '@phosphor-icons/react'
import type { Board } from '@/shared/types/domain'
import { getBoardBackgroundClasses } from '@/shared/utils/constants'

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
      className={`group relative h-32 w-full cursor-pointer overflow-hidden rounded-xl p-4 text-left shadow-md transition-all hover:shadow-lg hover:scale-[1.02] ${gradientClass} ${textColorClass}`}
    >
      <div className="relative z-10">
        <h3 className="text-lg font-bold leading-tight">{board.name}</h3>
        <div className="mt-auto flex items-center gap-3 pt-8 text-sm opacity-80">
          <span className="flex items-center gap-1">
            <StackIcon size={20} weight="duotone" />
            {stagesCount} etapas
          </span>
          <span className="flex items-center gap-1">
            <UsersThreeIcon size={20} weight="duotone" />
            {membersCount}
          </span>
          <span className="flex items-center gap-1">
            <CardsIcon size={20} weight="duotone" />
            {cardsCount}
          </span>
        </div>
      </div>
      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
    </button>
  )
}
