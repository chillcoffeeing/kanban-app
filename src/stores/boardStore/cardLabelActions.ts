import { cardsApi } from "@/services/cards";
import type { Board, Card, Label } from "@/shared/types";
import { updateCardInState } from "./cardHelpers";

export function createCardLabelActions(set: any, get: any) {
  return {
    /* ------------------------ Card Labels ------------------------ */

    attachLabel: async (
      boardId: string,
      stageId: string,
      cardId: string,
      labelId: string,
    ) => {
      // Optimistic update - need to get the label data first
      const board =
        get().currentBoard ??
        get().boards.find((board: Board) => board.id === boardId);
      if (!board) return;

      // Find the label in board labels (assuming labels are stored in board)
      const label = board.labels?.find((l: Label) => l.id === labelId);
      if (!label) return;

      const currentState = get();

      set((state: any) => {
        const { boards, currentBoard } = updateCardInState(
          state.boards,
          state.currentBoard,
          boardId,
          stageId,
          cardId,
          (card) => ({
            ...card,
            labels: [...(card.labels || []), label],
          }),
        );
        return { boards, currentBoard };
      });

      try {
        await cardsApi.attachLabel(cardId, labelId);
      } catch (error) {
        // Rollback on error
        set(currentState);
        throw error;
      }
    },

    detachLabel: async (
      boardId: string,
      stageId: string,
      cardId: string,
      labelId: string,
    ) => {
      // Optimistic update
      const currentState = get();

      set((state: any) => {
        const { boards, currentBoard } = updateCardInState(
          state.boards,
          state.currentBoard,
          boardId,
          stageId,
          cardId,
          (card) => ({
            ...card,
            labels: (card.labels || []).filter((label) => label.id !== labelId),
          }),
        );
        return { boards, currentBoard };
      });

      try {
        await cardsApi.detachLabel(cardId, labelId);
      } catch (error) {
        // Rollback on error
        set(currentState);
        throw error;
      }
    },

    // Board-level label management
    createLabel: async (boardId: string, name: string, color: string) => {
      const res = await cardsApi.createLabel(boardId, { name, color });
      const label: Label = {
        id: res.id,
        name: res.name,
        color: res.color,
      };

      set((state: any) => {
        const updateBoard = (board: Board): Board => ({
          ...board,
          labels: [...(board.labels || []), label],
        });

        return {
          boards: state.boards.map((board: Board) =>
            board.id === boardId ? updateBoard(board) : board,
          ),
          currentBoard:
            state.currentBoard && state.currentBoard.id === boardId
              ? updateBoard(state.currentBoard)
              : state.currentBoard,
        };
      });

      return label;
    },

    deleteLabel: async (boardId: string, labelId: string) => {
      await cardsApi.deleteLabel(labelId);

      set((state: any) => {
        const updateBoard = (board: Board): Board => ({
          ...board,
          labels: (board.labels || []).filter((label) => label.id !== labelId),
          // Also remove from all cards in this board
          stages: board.stages.map((stage) => ({
            ...stage,
            cards: stage.cards.map((card) => ({
              ...card,
              labels: (card.labels || []).filter(
                (label) => label.id !== labelId,
              ),
            })),
          })),
        });

        return {
          boards: state.boards.map((board: Board) =>
            board.id === boardId ? updateBoard(board) : board,
          ),
          currentBoard:
            state.currentBoard && state.currentBoard.id === boardId
              ? updateBoard(state.currentBoard)
              : state.currentBoard,
        };
      });
    },
  };
}
