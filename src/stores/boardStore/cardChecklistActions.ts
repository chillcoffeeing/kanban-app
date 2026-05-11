import { cardsApi } from "@/services/cards";
import type { ChecklistItem } from "@/shared/types";
import type { BoardState } from "./types";
import { forCard } from "./helpers/boardHelpers";

export function createCardChecklistActions(set: any, get: any) {
  return {
    addChecklistItem: async (
      boardId: string,
      stageId: string,
      cardId: string,
      text: string,
    ) => {
      const currentState = get();
      const newItem: ChecklistItem = {
        id: `temp-${Date.now()}`,
        cardId,
        text,
        done: false,
        position: 0,
      };

      set((state: BoardState) => {
        forCard(state, boardId, stageId, cardId, (card) => {
          card.checklist.push(newItem);
        });
      });

      try {
        const res = await cardsApi.createChecklistItem(cardId, { text });
        set((state: BoardState) => {
          forCard(state, boardId, stageId, cardId, (card) => {
            const item = card.checklist.find((i) => i.id === newItem.id);
            if (item) item.id = res.id;
          });
        });
      } catch (error) {
        set(currentState);
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
      const currentState = get();

      set((state: BoardState) => {
        forCard(state, boardId, stageId, cardId, (card) => {
          const item = card.checklist.find((i) => i.id === itemId);
          if (item) Object.assign(item, updates);
        });
      });

      try {
        await cardsApi.updateChecklistItem(cardId, itemId, updates);
      } catch (error) {
        set(currentState);
        throw error;
      }
    },

    deleteChecklistItem: async (
      boardId: string,
      stageId: string,
      cardId: string,
      itemId: string,
    ) => {
      const currentState = get();

      set((state: BoardState) => {
        forCard(state, boardId, stageId, cardId, (card) => {
          card.checklist = card.checklist.filter((i) => i.id !== itemId);
        });
      });

      try {
        await cardsApi.deleteChecklistItem(cardId, itemId);
      } catch (error) {
        set(currentState);
        throw error;
      }
    },
  };
}
