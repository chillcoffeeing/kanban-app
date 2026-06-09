import { CardsService } from "@/services/cards";
import { handleError } from "@/shared/utils/errorHandler";
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
        const res = await CardsService.addMember(cardId, { boardMembershipId });
        set((state: BoardState) => {
          forCard(state, boardId, stageId, cardId, (card) => {
            card.members = res.members || [];
          });
        });
      } catch (err) {
        set(currentState);
        handleError(err, "Error al asignar miembro a la tarjeta");
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
        await CardsService.removeMember(cardId, boardMembershipId);
      } catch (err) {
        set(currentState);
        handleError(err, "Error al remover miembro de la tarjeta");
      }
    },
  };
}
