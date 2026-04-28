import type { Board, Card } from "@/shared/types";

/**
 * Helper functions for updating card state in boards/currentBoard.
 * These avoid repeating the nested map logic.
 */

export function updateCardInState(
  boards: Board[],
  currentBoard: Board | null,
  boardId: string,
  stageId: string,
  cardId: string,
  updater: (card: Card) => Card,
): { boards: Board[]; currentBoard: Board | null } {
  const patchBoard = (board: Board): Board => ({
    ...board,
    stages: board.stages.map((stage) =>
      stage.id !== stageId
        ? stage
        : {
            ...stage,
            cards: stage.cards.map((card) =>
              card.id === cardId ? updater(card) : card,
            ),
          },
    ),
  });

  return {
    boards: boards.map((board) =>
      board.id === boardId ? patchBoard(board) : board,
    ),
    currentBoard:
      currentBoard && currentBoard.id === boardId
        ? patchBoard(currentBoard)
        : currentBoard,
  };
}

export function replaceCardInState(
  boards: Board[],
  currentBoard: Board | null,
  boardId: string,
  stageId: string,
  cardId: string,
  newCard: Card,
): { boards: Board[]; currentBoard: Board | null } {
  return updateCardInState(
    boards,
    currentBoard,
    boardId,
    stageId,
    cardId,
    () => newCard,
  );
}
