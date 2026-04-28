import { cardsApi } from "@/services/cards";
import type { Board, Card, ChecklistItem } from "@/shared/types";
import { updateCardInState } from "./cardHelpers";

export function createCardChecklistActions(set: any, get: any) {
  return {
    /* ------------------------ Card Checklists ------------------------ */

    addChecklistItem: async (
      boardId: string,
      stageId: string,
      cardId: string,
      text: string,
    ) => {
      // Optimistic update
      const currentState = get();
      const newItem: ChecklistItem = {
        id: `temp-${Date.now()}`, // Temporary ID
        text,
        done: false,
        position: 0, // Will be updated by backend
      };

      try {
        const res = await cardsApi.createChecklistItem(cardId, { text });
        // Update with real data from backend

        set((state: any) => {
          const { boards, currentBoard } = updateCardInState(
            state.boards,
            state.currentBoard,
            boardId,
            stageId,
            cardId,
            (card) => ({
              ...card,
              checklist: [
                ...(card.checklist || []),
                { ...newItem, id: res.id } as ChecklistItem,
              ],
            }),
          );
          return { boards, currentBoard };
        });
      } catch (error) {
        // Rollback on error
        set(currentState);
        console.error("Error adding checklist item:", error);
        throw error;
      }
    },

    updateChecklistItem: async (
      boardId: string,
      stageId: string,
      cardId: string,
      itemId: string,
      updates: { text?: string; done?: boolean },
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
            checklist: (card.checklist || []).map((item) =>
              item.id === itemId ? { ...item, ...updates } : item,
            ),
          }),
        );
        return { boards, currentBoard };
      });

      try {
        await cardsApi.updateChecklistItem(cardId, itemId, updates);
      } catch (error) {
        // Rollback on error
        set(currentState);
        console.error("Error updating checklist item:", error);
        throw error;
      }
    },

    deleteChecklistItem: async (
      boardId: string,
      stageId: string,
      cardId: string,
      itemId: string,
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
            checklist: (card.checklist || []).filter(
              (item) => item.id !== itemId,
            ),
          }),
        );
        return { boards, currentBoard };
      });

      try {
        await cardsApi.deleteChecklistItem(cardId, itemId);
      } catch (error) {
        // Rollback on error
        set(currentState);
        console.error("Error deleting checklist item:", error);
        throw error;
      }
    },
  };
}
