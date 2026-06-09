import { CardsService } from "@/services/cards";
import { handleError } from "@/shared/utils/errorHandler";
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
        const res = await CardsService.createChecklistItem(cardId, { text });
        set((state: BoardState) => {
          forCard(state, boardId, stageId, cardId, (card) => {
            const item = card.checklist.find((item) => item.id === newItem.id);
            if (item) item.id = res.id;
          });
        });
      } catch (err) {
        set(currentState);
        handleError(err, "Error al añadir elemento al checklist");
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
          const item = card.checklist.find((item) => item.id === itemId);
          if (item) Object.assign(item, updates);
        });
      });

      try {
        await CardsService.updateChecklistItem(cardId, itemId, updates);
      } catch (err) {
        set(currentState);
        handleError(err, "Error al actualizar el checklist");
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
          card.checklist = card.checklist.filter((item) => item.id !== itemId);
        });
      });

      try {
        await CardsService.deleteChecklistItem(cardId, itemId);
      } catch (err) {
        set(currentState);
        handleError(err, "Error al eliminar elemento del checklist");
      }
    },
  };
}
