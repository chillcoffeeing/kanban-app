import { cardsApi } from "@/services/cards";
import { useToastStore } from "@/stores/toastStore";
import type { BoardState } from "./types";
import { forCard } from "./helpers/boardHelpers";

export function createCardMemberActions(set: any, get: any) {
  return {
    addCardMember: async (
      boardId: string,
      stageId: string,
      cardId: string,
      boardMembershipId: string,
    ) => {
      const currentState = get();

      set((state: BoardState) => {
        forCard(state, boardId, stageId, cardId, (card) => {
          card.members.push({
            boardMembershipId,
            boardMembership: {
              user: { name: "Cargando...", avatarUrl: null, id: "" },
            },
          });
        });
      });

      try {
        const res = await cardsApi.addMember(cardId, { boardMembershipId });
        set((state: BoardState) => {
          forCard(state, boardId, stageId, cardId, (card) => {
            card.members = res.members || [];
          });
        });
      } catch {
        set(currentState);
        useToastStore.getState().addToast({ type: "error", message: "Error al asignar miembro a la tarjeta" });
      }
    },

    removeCardMember: async (
      boardId: string,
      stageId: string,
      cardId: string,
      boardMembershipId: string,
    ) => {
      const currentState = get();

      set((state: BoardState) => {
        forCard(state, boardId, stageId, cardId, (card) => {
          card.members = card.members.filter(
            (m) => m.boardMembershipId !== boardMembershipId,
          );
        });
      });

      try {
        await cardsApi.removeMember(cardId, boardMembershipId);
      } catch {
        set(currentState);
        useToastStore.getState().addToast({ type: "error", message: "Error al remover miembro de la tarjeta" });
      }
    },
  };
}
