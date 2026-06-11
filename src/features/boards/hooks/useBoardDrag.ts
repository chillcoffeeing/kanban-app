import { useState, useRef, useCallback } from "react";
import {
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { useBoardStore } from "@/stores/boardStore";
import type { Card, Board, ActivityType } from "@/shared/types/domain";

interface DragData {
  type: "card" | "stage";
  stageId: string;
  card?: Card;
}

interface DropTarget {
  toStageId: string;
  newIndex: number;
}

export function useBoardDrag(
  boardId: string,
  log: (type: ActivityType, detail: string) => void,
) {
  const moveCard = useBoardStore((s) => s.moveCard);
  const currentBoard = useBoardStore((s) => s.currentBoard);

  const activeId = useRef<string | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const sensors = useSensors(pointerSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = String(event.active.id);
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

      if (activeData?.type !== "card") return;

      const fromStageId = activeData.stageId;
      const { toStageId, newIndex } = resolveDropTarget(
        currentBoard,
        fromStageId,
        overData,
        over.id,
      );

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
          log("card_moved", `movió "${cardTitle}" de "${fromName}" a "${toName}"`);
        }
      }
    },
    [boardId, currentBoard, moveCard, log],
  );

  return {
    sensors,
    collisionDetection: closestCenter,
    activeCard,
    handleDragStart,
    handleDragEnd,
  };
}

/* Pure helpers */

function resolveDropTarget(
  board: Board | null,
  fromStageId: string,
  overData: DragData | undefined,
  overId: string | number,
): DropTarget {
  if (overData?.type === "stage") {
    const toStage = board?.stages.find((s) => s.id === overData.stageId);
    return { toStageId: overData.stageId, newIndex: toStage?.cards.length || 0 };
  }

  if (overData?.type === "card") {
    const toStage = board?.stages.find((s) => s.id === overData.stageId);
    const newIndex = toStage?.cards.findIndex((c) => c.id === overId) ?? 0;
    return { toStageId: overData.stageId, newIndex };
  }

  return { toStageId: fromStageId, newIndex: 0 };
}
