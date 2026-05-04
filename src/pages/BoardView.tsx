import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type {
  DragStartEvent,
  DragEndEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { useBoardStore } from "@/stores/boardStore";
import { useAuthStore } from "@/stores/authStore";
import { useActivityStore, ACTIVITY_TYPES } from "@/stores/activityStore";
import { useActivity } from "@/shared/hooks/useActivity";
import { useSocket } from "@/shared/hooks/useSocket";
import { StageColumn } from "@/features/stages/components/StageColumn";
import { CardItem } from "@/features/cards/components/CardItem";
import { CardPreview } from "@/features/cards/components/CardPreview";
import { CardDetailModal } from "@/features/cards/components/CardDetailModal";
import { MemberProfileModal } from "@/shared/components/MemberProfileModal";
import { ActivityFeed } from "@/features/boards/components/ActivityFeed";
import { BoardHeader } from "@/features/boards/components/BoardHeader";
import { Button } from "@/shared/components/Button";
import type { Card } from "@/shared/types/domain";
import { PlusIcon } from "@phosphor-icons/react";

interface BoardViewProps {
  boardId: string;
  openCardId?: string;
}

interface DragData {
  type: "card" | "stage";
  stageId: string;
  card?: Card;
}

export function BoardView({ boardId, openCardId }: BoardViewProps) {
  const navigate = useNavigate();

  const {
    currentBoard,
    setCurrentBoard,
    addStage,
    moveCard,
    loadCard,
    addMember,
  } = useBoardStore();

  const currentUser = useAuthStore((s) => s.user);

  const isOwner = currentBoard?.members?.some(
    (m) => m.user?.id === currentUser?.id && m.role === "owner",
  );

  const loadActivities = useActivityStore((s) => s.loadActivities);

  const [searchParams, setSearchParams] = useSearchParams();

  const queryCardId = openCardId ?? (searchParams.get("card-id") || undefined);

  const [isAddingStage, setIsAddingStage] = useState(false);

  const [newStageName, setNewStageName] = useState("");

  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    () => queryCardId ?? null,
  );

  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  const [isCardLoading, setIsCardLoading] = useState(() =>
    Boolean(queryCardId),
  );

  const selectedUserId = useBoardStore((s) => s.selectedUserId);
  const setSelectedUserId = useBoardStore((s) => s.setSelectedUserId);

  const [showActivity, setShowActivity] = useState(false);

  const [showInvite, setShowInvite] = useState(false);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const log = useActivity(boardId);

  const lastLoadedCardId = useRef<string | null>(null);

  const { joinBoard } = useSocket();

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });

  const sensors = useSensors(pointerSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id;
    setActiveId(id);
    const data = event.active.data.current as DragData | undefined;
    if (data?.type === "card" && data.card) {
      setActiveCard(data.card);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setActiveCard(null);
      if (!over) return;

      const activeData = active.data.current as DragData | undefined;
      const overData = over.data.current as DragData | undefined;

      if (activeData?.type === "card") {
        const fromStageId = activeData.stageId;
        let toStageId = fromStageId;
        let newIndex = 0;

        if (overData?.type === "stage") {
          toStageId = overData.stageId;
          const toStage = currentBoard?.stages.find((s) => s.id === toStageId);
          newIndex = toStage?.cards.length || 0;
        } else if (overData?.type === "card") {
          toStageId = overData.stageId;
          const toStage = currentBoard?.stages.find((s) => s.id === toStageId);
          newIndex = toStage?.cards.findIndex((c) => c.id === over.id) ?? 0;
        }

        if (fromStageId !== toStageId || active.id !== over.id) {
          moveCard(
            boardId,
            fromStageId,
            toStageId,
            String(active.id),
            newIndex,
          );

          if (fromStageId !== toStageId) {
            const fromName = currentBoard?.stages.find(
              (s) => s.id === fromStageId,
            )?.name;
            const toName = currentBoard?.stages.find(
              (s) => s.id === toStageId,
            )?.name;
            const cardTitle = activeData.card?.title || "Tarjeta";
            log(
              ACTIVITY_TYPES.CARD_MOVED,
              `movió "${cardTitle}" de "${fromName}" a "${toName}"`,
            );
          }
        }
      }
    },
    [boardId, currentBoard, moveCard, log],
  );

  const handleOpenCard = useCallback(
    (card: Card, stageId: string) => {
      const params = new URLSearchParams(searchParams);

      params.set("card-id", card.id);

      setSearchParams(params, { replace: false });

      setSelectedCardId(card.id);

      setSelectedStageId(stageId);

      setIsCardLoading(true);

      const controller = new AbortController();

      loadCard(card.id).finally(() => {
        if (!controller.signal.aborted) {
          setIsCardLoading(false);
        }
      });
    },
    [searchParams, setSearchParams, loadCard],
  );

  useEffect(() => {
    if (!currentBoard) return;

    if (!queryCardId) {
      setSelectedCardId(null);
      setSelectedStageId(null);
      setIsCardLoading(false);
      return;
    }

    const stage = currentBoard.stages.find((stage) =>
      stage.cards.some((card) => card.id === queryCardId),
    );

    setSelectedCardId(queryCardId);
    setSelectedStageId(stage?.id ?? null);

    if (stage) {
      setIsCardLoading(false);
      return;
    }

    if (lastLoadedCardId.current === queryCardId) return;

    lastLoadedCardId.current = queryCardId;
    setIsCardLoading(true);

    const controller = new AbortController();

    loadCard(queryCardId).finally(() => {
      if (!controller.signal.aborted) {
        setIsCardLoading(false);
      }
    });

    return () => {
      controller.abort();
    };
  }, [queryCardId, currentBoard, loadCard]);

  useEffect(() => {
    const controller = new AbortController();

    const init = async () => {
      try {
        await setCurrentBoard(boardId);
        loadActivities(boardId);
        joinBoard(boardId);
      } catch (error) {
        if (!controller.signal.aborted) {
          // Error handled silently
        }
      }
    };

    init();

    return () => {
      controller.abort();
    };
  }, [boardId]);

  const handleAddStage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newStageName.trim()) return;
    const name = newStageName.trim();
    addStage(boardId, name);
    log(ACTIVITY_TYPES.STAGE_CREATED, `creó la etapa "${name}"`);
    setNewStageName("");
    setIsAddingStage(false);
  };

  const handleInviteMember = (email: string) => {
    addMember(boardId, email);
    setShowInvite(false);
  };

  if (!currentBoard) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg text-fg-muted">Cargando tablero...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Board header */}
      <BoardHeader
        board={currentBoard}
        isOwner={!!isOwner}
        onInviteMember={handleInviteMember}
        onToggleActivity={() => setShowActivity(!showActivity)}
        onToggleInvite={() => setShowInvite(!showInvite)}
        showInvite={showInvite}
      />

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
          <div className="w-72 shrink-0">
            {isAddingStage ? (
              <form
                onSubmit={handleAddStage}
                className="rounded-xl bg-surface-100 p-3"
              >
                <input
                  autoFocus
                  placeholder="Nombre de la etapa..."
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Escape" && setIsAddingStage(false)
                  }
                  className="mb-2 w-full rounded-lg border border-border-default bg-bg-card px-3 py-2 text-sm focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/20"
                />
                <div className="flex gap-2">
                  <Button size="sm" type="submit">
                    Añadir etapa
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => setIsAddingStage(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingStage(true)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl bg-surface-100/80 px-4 py-3 text-sm font-medium text-surface-500 hover:bg-surface-200 hover:text-surface-700"
              >
                <PlusIcon size={20} weight="duotone" /> Añadir etapa
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <CardPreview
              card={activeCard}
              stageId={activeCard.id}
              boardId={boardId}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <CardDetailModal
        isOpen={!!selectedCardId || isCardLoading}
        isLoading={isCardLoading}
        onClose={() => {
          setSelectedCardId(null);
          setSelectedStageId(null);
          setIsCardLoading(false);
          const params = new URLSearchParams(searchParams);
          params.delete("card-id");
          setSearchParams(params, { replace: true });
        }}
        card={
          selectedCardId && selectedStageId
            ? (currentBoard.stages
                .find((stage) => stage.id === selectedStageId)
                ?.cards.find((card) => card.id === selectedCardId) ?? null)
            : null
        }
        stageId={selectedStageId}
        boardId={boardId}
      />

      <MemberProfileModal />

      <ActivityFeed
        isOpen={showActivity}
        onClose={() => setShowActivity(false)}
      />
    </div>
  );
}
