// Libraries
import { useState, useEffect } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";

// Components
import { StageColumn } from "@/features/stages/components/StageColumn";
import { CardPreview } from "@/features/cards/components/CardPreview";
import { CardDetailModal } from "@/features/cards/components/CardDetailModal";
import { MemberProfileModal } from "@/shared/components/MemberProfileModal";
import { ActivityFeed } from "@/features/boards/components/ActivityFeed";
import { BoardHeader } from "@/features/boards/components/BoardHeader";
import { BoardLoading } from "@/features/boards/components/BoardLoading";
import { AddStageColumn } from "@/features/stages/components/AddStageColumn";

// Hooks
import { useHorizontalScroll } from "@/features/boards/hooks/useHorizontalScroll";
import { useCardNavigation } from "@/features/boards/hooks/useCardNavigation";
import { useBoardDrag } from "@/features/boards/hooks/useBoardDrag";
import { useActivity } from "@/shared/hooks/useActivity";
import { useSocket } from "@/shared/hooks/useSocket";

// Stores
import { useBoardStore } from "@/stores/boardStore";
import { useAuthStore } from "@/stores/authStore";
import { useActivityStore } from "@/stores/activityStore";

// Utils
import { setBoardContext } from "@/shared/hooks/usePermissionDenied";

// Types
import type { Card } from "@/shared/types/domain";

interface BoardViewProps {
  boardId: string;
  openCardId?: string;
}

export function BoardView({ boardId, openCardId }: BoardViewProps) {
  // Stores
  const currentBoard = useBoardStore((s) => s.currentBoard);
  const setCurrentBoard = useBoardStore((s) => s.setCurrentBoard);
  const addStage = useBoardStore((s) => s.addStage);
  const addMember = useBoardStore((s) => s.addMember);
  const currentUser = useAuthStore((s) => s.user);
  const loadActivities = useActivityStore((s) => s.loadActivities);

  // Hooks
  const log = useActivity(boardId);
  const { joinBoard } = useSocket();
  const { scrollRef } = useHorizontalScroll();

  const {
    selectedCardId,
    selectedStageId,
    isCardLoading,
    openCard,
    closeCard,
  } = useCardNavigation(boardId, openCardId);

  const {
    sensors,
    collisionDetection,
    activeCard,
    handleDragStart,
    handleDragEnd,
  } = useBoardDrag(boardId, log);

  // Derived
  const isOwner = currentBoard?.members?.some(
    (member) => member.user?.id === currentUser?.id && member.role === "owner",
  );

  // State
  const [showActivity, setShowActivity] = useState(false);

  const previewCard: Card | null =
    selectedCardId && selectedStageId
      ? (currentBoard?.stages
          .find((s) => s.id === selectedStageId)
          ?.cards.find((c) => c.id === selectedCardId) ?? null)
      : null;

  // Effects

  useEffect(() => {
    const init = async () => {
      setBoardContext(boardId);
      await setCurrentBoard(boardId);
    };
    init();
  }, [boardId, setCurrentBoard]);

  useEffect(() => {
    if (!currentBoard) return;
    loadActivities(boardId);
  }, [boardId, currentBoard, loadActivities]);

  useEffect(() => {
    if (!currentBoard) return;
    joinBoard(boardId);
  }, [boardId, currentBoard, joinBoard]);

  // Callbacks

  const handleAddStage = (name: string) => {
    addStage(boardId, name);
  };

  const handleInviteMember = (email: string) => {
    addMember(boardId, email);
  };

  // Guard

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
      />

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={scrollRef}
          className="flex flex-1 gap-(--density-gap,1rem) overflow-x-auto p-(--density-padding,1rem) bg-[repeating-conic-gradient(var(--color-neutral-light)_0%_25%,transparent_0%_50%)] bg-size-[20px_20px]"
        >
          {currentBoard.stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              boardId={boardId}
              onOpenCard={openCard}
            />
          ))}

          <AddStageColumn onAddStage={handleAddStage} />
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
        onClose={closeCard}
        card={previewCard}
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
