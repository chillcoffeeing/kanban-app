import type { Board, Card, Stage, BoardMember } from "@/shared/types";
import type { BoardState } from "./types";

function buildCardIndex(board: Board) {
  const index = new Map<string, { stage: Stage; index: number }>();
  for (const stage of board.stages) {
    for (let i = 0; i < stage.cards.length; i++) {
      index.set(stage.cards[i].id, { stage, index: i });
    }
  }
  return index;
}

function upsertCardInBoard(
  board: Board,
  cardId: string,
  updates: Partial<Card & { stageId: string }>,
) {
  const entry = buildCardIndex(board).get(cardId);
  if (entry) {
    Object.assign(entry.stage.cards[entry.index], updates);
    if ("position" in updates) {
      entry.stage.cards.sort((a, b) => a.position - b.position);
    }
    return entry.stage.id;
  }
  return null;
}

function removeCardFromBoard(board: Board, cardId: string): Card | null {
  const entry = buildCardIndex(board).get(cardId);
  if (entry) {
    const [card] = entry.stage.cards.splice(entry.index, 1);
    return card;
  }
  return null;
}

export function createRealtimeActions(set: any, get: any) {
  return {
    realtimeUpdateBoard: (boardId: string, updates: Partial<Board>) => {
      set((state: BoardState) => {
        const b = state.boards.find((board) => board.id === boardId);
        if (b) Object.assign(b, updates);
        if (state.currentBoard?.id === boardId && state.currentBoard !== b)
          Object.assign(state.currentBoard, updates);
      });
    },

    realtimeDeleteBoard: (boardId: string) => {
      set((state: BoardState) => {
        state.boards = state.boards.filter((board) => board.id !== boardId);
        if (state.currentBoard?.id === boardId) state.currentBoard = null;
      });
    },

    realtimeUpdateCard: (
      cardId: string,
      updates: Partial<Card & { stageId: string }>,
    ) => {
      set((state: BoardState) => {
        if (updates.stageId) {
          let currentStageId: string | null = null;
          let currentBoardId: string | null = null;

          for (const board of state.boards) {
            for (const stage of board.stages) {
              if (stage.cards.some((card) => card.id === cardId)) {
                currentStageId = stage.id;
                currentBoardId = board.id;
                break;
              }
            }
            if (currentStageId) break;
          }

          if (
            currentStageId &&
            currentBoardId &&
            currentStageId !== updates.stageId
          ) {
            const card = removeCardFromBoard(
              state.boards.find((board) => board.id === currentBoardId)!,
              cardId,
            );
            if (card) {
              const merged = { ...card, ...updates };
            const targetBoard = state.boards.find((board) =>
              board.stages.some((stage) => stage.id === updates.stageId),
              );
              const targetStage = targetBoard?.stages.find(
                (stage) => stage.id === updates.stageId,
              );
              if (targetStage) {
                targetStage.cards.push(merged);
                targetStage.cards.sort((a, b) => a.position - b.position);
              }
            }

            if (state.currentBoard) {
              const curCard = removeCardFromBoard(state.currentBoard, cardId);
              if (curCard) {
                const merged = { ...curCard, ...updates };
                const curStage = state.currentBoard.stages.find(
                  (stage) => stage.id === updates.stageId,
                );
                if (curStage) {
                  curStage.cards.push(merged);
                  curStage.cards.sort((a, b) => a.position - b.position);
                }
              }
            }
            return;
          }
        }

        for (const board of state.boards) {
          upsertCardInBoard(board, cardId, updates);
        }
        if (state.currentBoard) {
          upsertCardInBoard(state.currentBoard, cardId, updates);
        }
      });
    },

    realtimeAddCard: (card: Card & { stageId: string }) => {
      set((state: BoardState) => {
        const alreadyExists = (board: Board) =>
          board.stages.some((s) => s.cards.some((c) => c.id === card.id));
        for (const board of state.boards) {
          if (alreadyExists(board)) continue;
          const stage = board.stages.find((stage) => stage.id === card.stageId);
          if (stage) stage.cards.push(card);
        }
        if (state.currentBoard && !alreadyExists(state.currentBoard)) {
          const stage = state.currentBoard.stages.find(
            (stage) => stage.id === card.stageId,
          );
          if (stage) stage.cards.push(card);
        }
      });
    },

    realtimeDeleteCard: (cardId: string) => {
      set((state: BoardState) => {
        const remove = (board: Board) => {
          for (const stage of board.stages) {
            stage.cards = stage.cards.filter((card) => card.id !== cardId);
          }
        };
        state.boards.forEach(remove);
        if (state.currentBoard) remove(state.currentBoard);
      });
    },

    realtimeUpdateStage: (stageId: string, updates: Partial<Stage>) => {
      set((state: BoardState) => {
        for (const board of state.boards) {
          const stage = board.stages.find((stage) => stage.id === stageId);
          if (stage) Object.assign(stage, updates);
        }
        if (state.currentBoard) {
          const stage = state.currentBoard.stages.find(
            (stage) => stage.id === stageId,
          );
          if (stage) Object.assign(stage, updates);
        }
      });
    },

    realtimeAddStage: (stage: Stage) => {
      set((state: BoardState) => {
        const exists = (b: Board) => b.stages.some((s) => s.id === stage.id);
        for (const board of state.boards) {
          if (exists(board)) continue;
          board.stages.push(stage);
        }
        if (state.currentBoard && !exists(state.currentBoard)) {
          state.currentBoard.stages.push(stage);
        }
      });
    },

    realtimeDeleteStage: (stageId: string) => {
      set((state: BoardState) => {
        for (const board of state.boards) {
          board.stages = board.stages.filter((stage) => stage.id !== stageId);
        }
        if (state.currentBoard) {
          state.currentBoard.stages = state.currentBoard.stages.filter(
            (stage) => stage.id !== stageId,
          );
        }
      });
    },

    realtimeAddMember: (boardId: string, member: BoardMember) => {
      set((state: BoardState) => {
        for (const board of state.boards) {
          if (board.id !== boardId) continue;
          if (board.members.some((m) => m.id === member.id)) return;
          board.members.push(member);
        }
        if (state.currentBoard?.id === boardId) {
          if (!state.currentBoard.members.some((m) => m.id === member.id)) {
            state.currentBoard.members.push(member);
          }
        }
      });
    },

    realtimeRemoveMember: (boardId: string, membershipId: string) => {
      set((state: BoardState) => {
        const remove = (members: BoardMember[]) =>
          members.filter((m) => m.id !== membershipId);
        for (const board of state.boards) {
          if (board.id === boardId) board.members = remove(board.members);
        }
        if (state.currentBoard?.id === boardId) {
          state.currentBoard.members = remove(state.currentBoard.members);
        }
      });
    },
  };
}
