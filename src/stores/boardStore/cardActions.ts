import { CardsService } from "@/services/cards";
import { eventBus } from "@/shared/utils/eventBus";
import { handleError } from "@/shared/utils/errorHandler";
import type { Board, Card } from "@/shared/types";
import type { BoardState } from "./types";
import { normalizeCard } from "./helpers/normalizers";
import { forBoard, forCard } from "./helpers/boardHelpers";

const CARD_CACHE_MAX = 50;
const cardLoadPromises = new Map<string, Promise<Card | null>>();

export function clearCardCache() {
  cardLoadPromises.clear();
}

function processCardMove(
  state: BoardState,
  boardId: string,
  fromStageId: string,
  toStageId: string,
  cardId: string,
  newIndex: number,
) {
  const process = (board: Board) => {
    if (board.id !== boardId) return;
    const fromStage = board.stages.find((s) => s.id === fromStageId);
    if (!fromStage) return;
    const ci = fromStage.cards.findIndex((c) => c.id === cardId);
    if (ci === -1) return;
    const [card] = fromStage.cards.splice(ci, 1);

    if (fromStageId === toStageId) {
      fromStage.cards.splice(newIndex, 0, card);
    } else {
      const toStage = board.stages.find((s) => s.id === toStageId);
      if (toStage) toStage.cards.splice(newIndex, 0, card);
    }
  };

  state.boards.forEach(process);
  if (state.currentBoard && state.boards.every((b) => b !== state.currentBoard)) {
    process(state.currentBoard);
  }
}

export function createCardActions(set: any, get: any) {
  return {
    addCard: async (boardId: string, stageId: string, title: string) => {
      try {
        const res = await CardsService.create(stageId, { title });
        const card = normalizeCard(res);
        set((state: BoardState) => {
          forBoard(state, boardId, (b) => {
            const stage = b.stages.find((s) => s.id === stageId);
            if (!stage || stage.cards.some((c) => c.id === card.id)) return;
            stage.cards.push(card);
          });
        });
        eventBus.emit("card:created", { boardId, detail: `creó la tarjeta "${title}"`, userName: "" });
        return card;
      } catch (err) {
        throw handleError(err, "Error al crear la tarjeta");
      }
    },

    updateCard: async (
      boardId: string,
      stageId: string,
      cardId: string,
      updates: Parameters<typeof CardsService.update>[1],
    ) => {
      const syncable: Partial<Card> = {};
      if (updates.title !== undefined) syncable.title = updates.title;
      if (updates.description !== undefined)
        syncable.description = updates.description;
      if (updates.startDate !== undefined)
        syncable.startDate = updates.startDate;
      if (updates.dueDate !== undefined) syncable.dueDate = updates.dueDate;

      set((state: BoardState) => {
        forCard(state, boardId, stageId, cardId, (card) => {
          Object.assign(card, updates);
        });
      });

      if (Object.keys(syncable).length > 0) {
        try {
          await CardsService.update(cardId, syncable);
        } catch (err) {
          handleError(err, "Error al guardar cambios de la tarjeta");
        }
      }
    },

    deleteCard: async (boardId: string, stageId: string, cardId: string) => {
      try {
        const board =
          get().currentBoard ?? get().boards.find((b: Board) => b.id === boardId);
        const stage = board?.stages.find((s: any) => s.id === stageId);
        const card = stage?.cards.find((c: any) => c.id === cardId);
        const cardTitle = card?.title ?? cardId;

        await CardsService.remove(cardId);

        set((state: BoardState) => {
          forBoard(state, boardId, (b) => {
            const s = b.stages.find((stage) => stage.id === stageId);
            if (s) s.cards = s.cards.filter((card) => card.id !== cardId);
          });
        });

        eventBus.emit("card:deleted", { boardId, detail: `eliminó la tarjeta "${cardTitle}"`, userName: "" });
      } catch (err) {
        handleError(err, "Error al eliminar la tarjeta");
      }
    },

    moveCard: async (
      boardId: string,
      fromStageId: string,
      toStageId: string,
      cardId: string,
      newIndex: number,
    ) => {
      const board =
        get().currentBoard ??
        get().boards.find((b: Board) => b.id === boardId);
      if (!board) return;
      const fromStage = board.stages.find((s: any) => s.id === fromStageId);
      const card = fromStage?.cards.find((c: any) => c.id === cardId);
      if (!card) return;

      const oldIndex = fromStage.cards.findIndex((c: any) => c.id === cardId);

      set((state: BoardState) => {
        processCardMove(state, boardId, fromStageId, toStageId, cardId, newIndex);
      });

      try {
        await CardsService.move(cardId, toStageId, newIndex);
        const toStage = get().currentBoard?.stages.find(
          (s: any) => s.id === toStageId,
        );
        const stageName = toStage?.name ?? toStageId;
        eventBus.emit("card:moved", { boardId, detail: `movió "${card.title}" a "${stageName}"`, userName: "" });
      } catch (err) {
        set((state: BoardState) => {
          processCardMove(state, boardId, toStageId, fromStageId, cardId, oldIndex);
        });
        handleError(err, "Error al mover la tarjeta");
      }
    },

    loadCard: async (cardId: string) => {
      if (cardLoadPromises.has(cardId)) {
        return cardLoadPromises.get(cardId)!;
      }

      const existingCard = get()
        .currentBoard?.stages.flatMap(
          (stage: Board["stages"][number]) => stage.cards,
        )
        .find((card: Card) => card.id === cardId);
      if (existingCard) return existingCard;

      const promise = (async () => {
        try {
          const res = await CardsService.get(cardId);
          const card = normalizeCard(res);

          set((state: BoardState) => {
            const upsert = (board: Board) => {
              const stage = board.stages.find((s) => s.id === res.stageId);
              if (!stage) return;
              const idx = stage.cards.findIndex((c) => c.id === cardId);
              if (idx !== -1) {
                stage.cards[idx] = card;
              } else {
                stage.cards.push(card);
              }
            };
            state.boards.forEach(upsert);
            if (state.currentBoard) upsert(state.currentBoard);
          });

          return card;
        } catch (err) {
          handleError(err, "Error al cargar la tarjeta");
          return null;
        } finally {
          cardLoadPromises.delete(cardId);
        }
      })();

      if (cardLoadPromises.size >= CARD_CACHE_MAX) {
        const firstKey = cardLoadPromises.keys().next().value;
        if (firstKey !== undefined) cardLoadPromises.delete(firstKey);
      }
      cardLoadPromises.set(cardId, promise);
      return promise;
    },
  };
}
