import { cardsApi } from "@/services/cards";
import { useAuthStore } from "@/stores/authStore";
import { useActivityStore } from "@/stores/activityStore";
import type { ActivityType, Board, Card } from "@/shared/types";
import { normalizeCard } from "./normalizers";

const cardLoadPromises = new Map<string, Promise<Card | null>>();

function logActivity(
  boardId: string,
  type: ActivityType,
  detail: string,
  meta?: Record<string, unknown>,
) {
  const user = useAuthStore.getState().user;
  const userName = user?.profile?.displayName || user?.name || "Usuario";
  useActivityStore.getState().log(boardId, { type, user: userName, detail, meta });
}

export function createCardActions(set: any, get: any) {
  /*   const mergeCard = ; */

  return {
    /* ------------------------ Cards ------------------------ */

    addCard: async (boardId: string, stageId: string, title: string) => {
      const res = await cardsApi.create(stageId, { title });
      const card = normalizeCard(res);
      set((state: any) => ({
        boards: patchBoardInList(state.boards, boardId, (board: Board) => ({
          ...board,
          stages: board.stages.map((stage) =>
            stage.id === stageId
              ? { ...stage, cards: [...stage.cards, card] }
              : stage,
          ),
        })),
        currentBoard: patchCurrent(
          state.currentBoard,
          boardId,
          (board: Board) => ({
            ...board,
            stages: board.stages.map((stage) =>
              stage.id === stageId
                ? { ...stage, cards: [...stage.cards, card] }
                : stage,
            ),
          }),
        ),
      }));
      logActivity(boardId, "card_created", `creó la tarjeta "${title}"`);
      return card;
    },

    updateCard: async (
      boardId: string,
      stageId: string,
      cardId: string,
      updates: Parameters<typeof cardsApi.update>[1],
    ) => {
      const syncable: Partial<Card> = {};
      if (updates.title !== undefined) syncable.title = updates.title;
      if (updates.description !== undefined)
        syncable.description = updates.description;
      if (updates.startDate !== undefined)
        syncable.startDate = updates.startDate;
      if (updates.dueDate !== undefined) syncable.dueDate = updates.dueDate;

      set((state: any) => {
        const merge = (card: Card) => ({ ...card, ...updates });
        return {
          boards: patchBoardInList(state.boards, boardId, (board: Board) => ({
            ...board,
            stages: board.stages.map((stage) =>
              stage.id !== stageId
                ? stage
                : {
                    ...stage,
                    cards: stage.cards.map((card) =>
                      card.id === cardId ? merge(card) : card,
                    ),
                  },
            ),
          })),
          currentBoard: patchCurrent(
            state.currentBoard,
            boardId,
            (board: Board) => ({
              ...board,
              stages: board.stages.map((stage) =>
                stage.id !== stageId
                  ? stage
                  : {
                      ...stage,
                      cards: stage.cards.map((card) =>
                        card.id === cardId ? merge(card) : card,
                      ),
                    },
              ),
            }),
          ),
        };
      });

      if (Object.keys(syncable).length > 0) {
        try {
          await cardsApi.update(cardId, syncable);
        } catch (err) {
          console.error("[boardStore] updateCard API failed:", err);
          set({ error: `Failed to sync card update: ${(err as Error).message}` });
        }
      }
    },

    deleteCard: async (boardId: string, stageId: string, cardId: string) => {
      const board = get().currentBoard ?? get().boards.find((b: Board) => b.id === boardId);
      const stage = board?.stages.find((s: any) => s.id === stageId);
      const card = stage?.cards.find((c: any) => c.id === cardId);
      const cardTitle = card?.title ?? cardId;

      await cardsApi.remove(cardId);
      set((state: any) => ({
        boards: patchBoardInList(state.boards, boardId, (board: Board) => ({
          ...board,
          stages: board.stages.map((stage) =>
            stage.id === stageId
              ? {
                  ...stage,
                  cards: stage.cards.filter((card) => card.id !== cardId),
                }
              : stage,
          ),
        })),
        currentBoard: patchCurrent(
          state.currentBoard,
          boardId,
          (board: Board) => ({
            ...board,
            stages: board.stages.map((stage) =>
              stage.id === stageId
                ? {
                    ...stage,
                    cards: stage.cards.filter((card) => card.id !== cardId),
                  }
                : stage,
            ),
          }),
        ),
      }));
      logActivity(boardId, "card_deleted", `eliminó la tarjeta "${cardTitle}"`);
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
        get().boards.find((board: Board) => board.id === boardId);
      if (!board) return;
      const fromStage = board.stages.find(
        (stage: any) => stage.id === fromStageId,
      );
      const card = fromStage?.cards.find((card: any) => card.id === cardId);
      if (!card) return;

      const oldIndex = fromStage.cards.findIndex((c: any) => c.id === cardId);

      set((state: any) => {
        const applyMove = (board: Board): Board => {
          if (board.id !== boardId) return board;
          return {
            ...board,
            stages: board.stages.map((stage) => {
              if (stage.id === fromStageId && stage.id === toStageId) {
                const cards = stage.cards.filter((card) => card.id !== cardId);
                cards.splice(newIndex, 0, card);
                return { ...stage, cards };
              }
              if (stage.id === fromStageId) {
                return {
                  ...stage,
                  cards: stage.cards.filter((card) => card.id !== cardId),
                };
              }
              if (stage.id === toStageId) {
                const cards = [...stage.cards];
                cards.splice(newIndex, 0, card);
                return { ...stage, cards };
              }
              return stage;
            }),
          };
        };
        return {
          boards: state.boards.map(applyMove),
          currentBoard: state.currentBoard
            ? applyMove(state.currentBoard)
            : null,
        };
      });

      try {
        await cardsApi.move(cardId, toStageId, newIndex);
        const toStage = get().currentBoard?.stages.find((s: any) => s.id === toStageId);
        const stageName = toStage?.name ?? toStageId;
        logActivity(boardId, "card_moved", `movió "${card.title}" a "${stageName}"`);
      } catch {
        set((state: any) => {
          const rollbackMove = (board: Board): Board => {
            if (board.id !== boardId) return board;
            return {
              ...board,
              stages: board.stages.map((stage) => {
                if (stage.id === toStageId && stage.id !== fromStageId) {
                  const cards = stage.cards.filter((c) => c.id !== cardId);
                  return { ...stage, cards };
                }
                if (stage.id === fromStageId && stage.id !== toStageId) {
                  const cards = [...stage.cards];
                  cards.splice(oldIndex, 0, card);
                  return { ...stage, cards };
                }
                if (stage.id === fromStageId && stage.id === toStageId) {
                  const cards = stage.cards.filter((c) => c.id !== cardId);
                  cards.splice(oldIndex, 0, card);
                  return { ...stage, cards };
                }
                return stage;
              }),
            };
          };
          return {
            boards: state.boards.map(rollbackMove),
            currentBoard: state.currentBoard
              ? rollbackMove(state.currentBoard)
              : null,
          };
        });
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
      if (existingCard) {
        return existingCard;
      }

      const promise = (async () => {
        try {
          const res = await cardsApi.get(cardId);
          const card = normalizeCard(res);

          set((state: any) => {
            const patchBoardCard = (board: Board): Board => ({
              ...board,
              stages: board.stages.map((stage) => {
                if (stage.id !== res.stageId) {
                  return stage;
                }

                const hasCard = stage.cards.some(
                  (existingCard) => existingCard.id === cardId,
                );
                return {
                  ...stage,
                  cards: hasCard
                    ? stage.cards.map((existingCard) =>
                        existingCard.id === cardId ? card : existingCard,
                      )
                    : [...stage.cards, card],
                };
              }),
            });

            return {
              boards: state.boards.map((board: Board) => patchBoardCard(board)),
              currentBoard: state.currentBoard
                ? patchBoardCard(state.currentBoard)
                : null,
            };
          });

          return card;
        } catch (error) {
          return null;
        } finally {
          cardLoadPromises.delete(cardId);
        }
      })();

      cardLoadPromises.set(cardId, promise);
      return promise;
    },
  };
}

// Helper functions
function patchBoardInList(
  boards: Board[],
  boardId: string,
  patch: (board: Board) => Board,
) {
  return boards.map((board) => (board.id === boardId ? patch(board) : board));
}

function patchCurrent(
  current: Board | null,
  boardId: string,
  patch: (board: Board) => Board,
) {
  return current && current.id === boardId ? patch(current) : current;
}
