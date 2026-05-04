import type { Board, Card, Stage } from "@/shared/types";

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

export function createRealtimeActions(set: any, get: any) {
  return {
    /* ------------------------ Realtime Actions ------------------------ */

    realtimeUpdateBoard: (boardId: string, updates: Partial<Board>) => {
      set((state: any) => ({
        boards: patchBoardInList(state.boards, boardId, (board: Board) => ({
          ...board,
          ...updates,
        })),
        currentBoard: patchCurrent(
          state.currentBoard,
          boardId,
          (board: Board) => ({
            ...board,
            ...updates,
          }),
        ),
      }));
    },

    realtimeDeleteBoard: (boardId: string) => {
      set((state: any) => ({
        boards: state.boards.filter((b: Board) => b.id !== boardId),
        currentBoard:
          state.currentBoard?.id === boardId ? null : state.currentBoard,
      }));
    },

    realtimeUpdateCard: (
      cardId: string,
      updates: Partial<Card & { stageId: string }>,
    ) => {
      set((state: any) => {
        const merge = (card: Card) => ({ ...card, ...updates });

        // If stageId changed, move the card
        if (updates.stageId) {
          // Find current stage
          let currentStageId: string | null = null;
          let currentBoardId: string | null = null;
          for (const board of state.boards) {
            for (const stage of board.stages) {
              if (stage.cards.some((c: Card) => c.id === cardId)) {
                currentStageId = stage.id;
                currentBoardId = board.id;
                break;
              }
            }
            if (currentStageId) break;
          }

          if (currentStageId && currentStageId !== updates.stageId) {
            // Move the card
            const card = state.currentBoard?.stages
              .find((s: Stage) => s.id === currentStageId)
              ?.cards.find((c: Card) => c.id === cardId);
            if (card) {
              const mergedCard = merge(card);
              return {
                boards: state.boards.map((board: Board) => {
                  if (board.id === currentBoardId) {
                    return {
                      ...board,
                      stages: board.stages.map((stage: Stage) => {
                        if (stage.id === currentStageId) {
                          return {
                            ...stage,
                            cards: stage.cards.filter(
                              (c: Card) => c.id !== cardId,
                            ),
                          };
                        }
                        if (stage.id === updates.stageId) {
                          const newCards = [...stage.cards, mergedCard].sort(
                            (a, b) => a.position - b.position,
                          );
                          return { ...stage, cards: newCards };
                        }
                        return stage;
                      }),
                    };
                  }
                  return board;
                }),
                currentBoard: state.currentBoard
                  ? {
                      ...state.currentBoard,
                      stages: state.currentBoard.stages.map((stage: Stage) => {
                        if (stage.id === currentStageId) {
                          return {
                            ...stage,
                            cards: stage.cards.filter(
                              (c: Card) => c.id !== cardId,
                            ),
                          };
                        }
                        if (stage.id === updates.stageId) {
                          const newCards = [...stage.cards, mergedCard].sort(
                            (a, b) => a.position - b.position,
                          );
                          return { ...stage, cards: newCards };
                        }
                        return stage;
                      }),
                    }
                  : null,
              };
            }
          }
        }

        // Normal update
        return {
          boards: state.boards.map((board: Board) => ({
            ...board,
            stages: board.stages.map((stage: Stage) => ({
              ...stage,
              cards: stage.cards
                .map((card: Card) => (card.id === cardId ? merge(card) : card))
                .sort((a, b) => a.position - b.position),
            })),
          })),
          currentBoard: state.currentBoard
            ? {
                ...state.currentBoard,
                stages: state.currentBoard.stages.map((stage: Stage) => ({
                  ...stage,
                  cards: stage.cards
                    .map((card: Card) =>
                      card.id === cardId ? merge(card) : card,
                    )
                    .sort((a, b) => a.position - b.position),
                })),
              }
            : null,
        };
      });
    },

    realtimeAddCard: (card: Card & { stageId: string }) => {
      set((state: any) => {
        // Find the stage for this card
        const targetStage = state.currentBoard?.stages.find(
          (stage: Stage) => stage.id === card.stageId,
        );
        if (!targetStage) return state;

        return {
          boards: state.boards.map((board: Board) => ({
            ...board,
            stages: board.stages.map((stage: Stage) =>
              stage.id === card.stageId
                ? { ...stage, cards: [...stage.cards, card] }
                : stage,
            ),
          })),
          currentBoard: state.currentBoard
            ? {
                ...state.currentBoard,
                stages: state.currentBoard.stages.map((stage: Stage) =>
                  stage.id === card.stageId
                    ? { ...stage, cards: [...stage.cards, card] }
                    : stage,
                ),
              }
            : null,
        };
      });
    },

    realtimeDeleteCard: (cardId: string) => {
      set((state: any) => ({
        boards: state.boards.map((board: Board) => ({
          ...board,
          stages: board.stages.map((stage: Stage) => ({
            ...stage,
            cards: stage.cards.filter((card: Card) => card.id !== cardId),
          })),
        })),
        currentBoard: state.currentBoard
          ? {
              ...state.currentBoard,
              stages: state.currentBoard.stages.map((stage: Stage) => ({
                ...stage,
                cards: stage.cards.filter((card: Card) => card.id !== cardId),
              })),
            }
          : null,
      }));
    },

    realtimeUpdateStage: (stageId: string, updates: Partial<Stage>) => {
      set((state: any) => ({
        boards: state.boards.map((board: Board) => ({
          ...board,
          stages: board.stages.map((stage: Stage) =>
            stage.id === stageId ? { ...stage, ...updates } : stage,
          ),
        })),
        currentBoard: state.currentBoard
          ? {
              ...state.currentBoard,
              stages: state.currentBoard.stages.map((stage: Stage) =>
                stage.id === stageId ? { ...stage, ...updates } : stage,
              ),
            }
          : null,
      }));
    },

    realtimeAddStage: (stage: Stage) => {
      set((state: any) => ({
        boards: state.boards.map((board: Board) => ({
          ...board,
          stages: [...board.stages, stage],
        })),
        currentBoard: state.currentBoard
          ? {
              ...state.currentBoard,
              stages: [...state.currentBoard.stages, stage],
            }
          : null,
      }));
    },

    realtimeDeleteStage: (stageId: string) => {
      set((state: any) => ({
        boards: state.boards.map((board: Board) => ({
          ...board,
          stages: board.stages.filter((stage: Stage) => stage.id !== stageId),
        })),
        currentBoard: state.currentBoard
          ? {
              ...state.currentBoard,
              stages: state.currentBoard.stages.filter(
                (stage: Stage) => stage.id !== stageId,
              ),
            }
          : null,
      }));
    },
  };
}
