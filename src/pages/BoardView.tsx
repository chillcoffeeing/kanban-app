import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core'
import { useBoardStore } from '@/stores/boardStore'
import { useActivityStore, ACTIVITY_TYPES } from '@/stores/activityStore'
import { useActivity } from '@/shared/hooks/useActivity'
import { StageColumn } from '@/features/stages/components/StageColumn'
import { CardDetailModal } from '@/features/cards/components/CardDetailModal'
import { BoardSettingsModal } from '@/features/boards/components/BoardSettingsModal'
import { ActivityFeed } from '@/features/boards/components/ActivityFeed'
import { CardSearch } from '@/features/cards/components/CardSearch'
import { Button } from '@/shared/components/Button'
import { Plus, Gear, Bell } from '@phosphor-icons/react'
import type { Card } from '@/shared/types/domain'

interface BoardViewProps {
  boardId: string
}

interface DragData {
  type: 'card' | 'stage'
  stageId: string
  card?: Card
}

export function BoardView({ boardId }: BoardViewProps) {
  const { currentBoard, setCurrentBoard, addStage, moveCard } = useBoardStore()
  const loadActivities = useActivityStore((s) => s.loadActivities)
  const [isAddingStage, setIsAddingStage] = useState(false)
  const [newStageName, setNewStageName] = useState('')
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [, setActiveId] = useState<UniqueIdentifier | null>(null)
  const log = useActivity(boardId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  useEffect(() => {
    void setCurrentBoard(boardId)
    loadActivities(boardId)
  }, [boardId, setCurrentBoard, loadActivities])

  if (!currentBoard) return (
    <div className="flex flex-1 items-center justify-center text-surface-400">
      Cargando tablero…
    </div>
  )

  const handleAddStage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newStageName.trim()) return
    const name = newStageName.trim()
    addStage(boardId, name)
    log(ACTIVITY_TYPES.STAGE_CREATED, `creó la etapa "${name}"`)
    setNewStageName('')
    setIsAddingStage(false)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const activeData = active.data.current as DragData | undefined
    const overData = over.data.current as DragData | undefined

    if (activeData?.type === 'card') {
      const fromStageId = activeData.stageId
      let toStageId = fromStageId
      let newIndex = 0

      if (overData?.type === 'stage') {
        toStageId = overData.stageId
        const toStage = currentBoard.stages.find((s) => s.id === toStageId)
        newIndex = toStage?.cards.length || 0
      } else if (overData?.type === 'card') {
        toStageId = overData.stageId
        const toStage = currentBoard.stages.find((s) => s.id === toStageId)
        newIndex = toStage?.cards.findIndex((c) => c.id === over.id) ?? 0
      }

      if (fromStageId !== toStageId || active.id !== over.id) {
        moveCard(boardId, fromStageId, toStageId, String(active.id), newIndex)

        if (fromStageId !== toStageId) {
          const fromName = currentBoard.stages.find((s) => s.id === fromStageId)?.name
          const toName = currentBoard.stages.find((s) => s.id === toStageId)?.name
          const cardTitle = activeData.card?.title || 'Tarjeta'
          log(ACTIVITY_TYPES.CARD_MOVED, `movió "${cardTitle}" de "${fromName}" a "${toName}"`)
        }
      }
    }
  }

  const handleOpenCard = (card: Card, stageId: string) => {
    setSelectedCard(card)
    setSelectedStageId(stageId)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Board header */}
      <div className={`flex items-center justify-between px-4 py-3 ${currentBoard.background} text-white`}>
        <h2 className="text-lg font-bold">{currentBoard.name}</h2>
        <div className="flex items-center gap-2">
          <CardSearch boardId={boardId} onSelectCard={handleOpenCard} />
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80! hover:bg-white/20! hover:text-white!"
            onClick={() => setShowActivity(!showActivity)}
          >
            <Bell size={20} weight="duotone" /> Actividad
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80! hover:bg-white/20! hover:text-white!"
            onClick={() => setShowSettings(true)}
          >
            <Gear size={20} weight="duotone" /> Configuración
          </Button>
        </div>
      </div>

      {/* Stages with horizontal scroll */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 gap-4 overflow-x-auto p-4">
          {currentBoard.stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              boardId={boardId}
              onOpenCard={handleOpenCard}
            />
          ))}

          {/* Add stage */}
          <div className="w-72 flex-shrink-0">
            {isAddingStage ? (
              <form onSubmit={handleAddStage} className="rounded-xl bg-surface-100 p-3">
                <input
                  autoFocus
                  placeholder="Nombre de la etapa..."
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && setIsAddingStage(false)}
                  className="mb-2 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <div className="flex gap-2">
                  <Button size="sm" type="submit">Añadir etapa</Button>
                  <Button size="sm" variant="ghost" type="button" onClick={() => setIsAddingStage(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingStage(true)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl bg-surface-100/80 px-4 py-3 text-sm font-medium text-surface-500 hover:bg-surface-200 hover:text-surface-700"
              >
                <Plus size={20} weight="duotone" /> Añadir etapa
              </button>
            )}
          </div>
        </div>
      </DndContext>

      <CardDetailModal
        isOpen={!!selectedCard}
        onClose={() => { setSelectedCard(null); setSelectedStageId(null) }}
        card={selectedCard}
        stageId={selectedStageId}
        boardId={boardId}
      />

      <BoardSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        board={currentBoard}
      />

      <ActivityFeed
        isOpen={showActivity}
        onClose={() => setShowActivity(false)}
      />
    </div>
  )
}
