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
import gsap from "gsap";
import { useBoardStore } from "@/stores/boardStore";
import { useAuthStore } from "@/stores/authStore";
import { useActivityStore, ACTIVITY_TYPES } from "@/stores/activityStore";
import { useActivity } from "@/shared/hooks/useActivity";
import { useSocket } from "@/shared/hooks/useSocket";
import { setBoardContext } from "@/shared/hooks/usePermissionDenied";
import { useToastStore } from "@/stores/toastStore";
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

  const currentUser = useAuthStore((state) => state.user);

  const isOwner = currentBoard?.members?.some(
    (member) => member.user?.id === currentUser?.id && member.role === "owner",
  );

  const loadActivities = useActivityStore(
    (activityState) => activityState.loadActivities,
  );

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

  const selectedUserId = useBoardStore(
    (boardState) => boardState.selectedUserId,
  );
  const setSelectedUserId = useBoardStore(
    (boardState) => boardState.setSelectedUserId,
  );

  const [showActivity, setShowActivity] = useState(false);

  const [showInvite, setShowInvite] = useState(false);

  const activeId = useRef<UniqueIdentifier | null>(null);

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
    activeId.current = id;
    const dragData = event.active.data.current as DragData | undefined;
    if (dragData?.type === "card" && dragData.card) {
      setActiveCard(dragData.card);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      activeId.current = null;
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
          const toStage = currentBoard?.stages.find(
            (stage) => stage.id === toStageId,
          );
          newIndex = toStage?.cards.length || 0;
        } else if (overData?.type === "card") {
          toStageId = overData.stageId;
          const toStage = currentBoard?.stages.find(
            (stage) => stage.id === toStageId,
          );
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
              (stage) => stage.id === fromStageId,
            )?.name;
            const toName = currentBoard?.stages.find(
              (stage) => stage.id === toStageId,
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
        setBoardContext(boardId);
        await setCurrentBoard(boardId);
        loadActivities(boardId);
        joinBoard(boardId);
      } catch (error) {
        if (!controller.signal.aborted) {
          useToastStore.getState().addToast({ type: "error", message: "Error al cargar el tablero" });
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
    return <BoardLoading />;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <BoardHeader
        board={currentBoard}
        isOwner={!!isOwner}
        onInviteMember={handleInviteMember}
        onToggleActivity={() => setShowActivity(!showActivity)}
        onToggleInvite={() => setShowInvite(!showInvite)}
        showInvite={showInvite}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 gap-[var(--density-gap,1rem)] overflow-x-auto p-[var(--density-padding,1rem)] bg-[repeating-conic-gradient(var(--color-neutral-light)_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]">
          {currentBoard.stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              boardId={boardId}
              onOpenCard={handleOpenCard}
            />
          ))}

          <div className="w-72 shrink-0">
            {isAddingStage ? (
              <form
                onSubmit={handleAddStage}
                className="rounded-xl border border-neutral-light bg-surface p-[var(--density-padding,1rem)] shadow-sm animate-scaleIn"
              >
                <input
                  placeholder="Nombre de la etapa..."
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Escape" && setIsAddingStage(false)
                  }
                  className="mb-3 w-full rounded-lg border border-neutral-light bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <div className="flex gap-[var(--density-gap,0.5rem)]">
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
                className="flex w-full cursor-pointer items-center gap-2 py-2 justify-center rounded-xl border-2 border-dashed border-secondary text-sm font-medium text-secondary hover:bg-secondary hover:text-secondary-fg transition-colors"
              >
                <PlusIcon size={28} weight="duotone" /> Añadir etapa
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

function BoardLoading() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const dots = dotRefs.current.filter(Boolean);
    if (!dots.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" },
      );

      gsap.to(dots, {
        y: -12,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex h-60 flex-col items-center justify-center gap-6"
    >
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) dotRefs.current[i] = el;
            }}
            className="size-4 rounded-full bg-primary"
          />
        ))}
      </div>
      <p className="text-lg text-neutral-dark/70">Cargando tablero&hellip;</p>
    </div>
  );
}
