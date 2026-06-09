// Libraries
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

// Stores
import { useBoardStore } from "@/stores/boardStore";

// Types
import type { Card } from "@/shared/types/domain";

interface CardNavigation {
  selectedCardId: string | null;
  selectedStageId: string | null;
  isCardLoading: boolean;
  openCard: (card: Card, stageId: string) => void;
  closeCard: () => void;
}

export function useCardNavigation(
  boardId: string,
  openCardId?: string,
): CardNavigation {
  // Stores
  const loadCard = useBoardStore((s) => s.loadCard);
  const currentBoard = useBoardStore((s) => s.currentBoard);

  // URL
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCardId = openCardId ?? (searchParams.get("card-id") || undefined);

  // State
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    () => queryCardId ?? null,
  );
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [isCardLoading, setIsCardLoading] = useState(() => Boolean(queryCardId));
  const lastLoadedCardId = useRef<string | null>(null);

  const openCard = useCallback(
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

  const closeCard = useCallback(() => {
    setSelectedCardId(null);
    setSelectedStageId(null);
    setIsCardLoading(false);
    const params = new URLSearchParams(searchParams);
    params.delete("card-id");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!currentBoard) return;

    if (!queryCardId) {
      setSelectedCardId(null);
      setSelectedStageId(null);
      setIsCardLoading(false);
      return;
    }

    const stage = currentBoard.stages.find((stg) =>
      stg.cards.some((c) => c.id === queryCardId),
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

  return { selectedCardId, selectedStageId, isCardLoading, openCard, closeCard };
}
