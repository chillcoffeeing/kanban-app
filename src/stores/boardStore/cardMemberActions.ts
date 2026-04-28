import { cardsApi } from "@/services/cards";
import type { Board } from "@/shared/types";
import { updateCardInState } from "./cardHelpers";

export function createCardMemberActions(set: any, get: any) {
  return {
    /* ------------------------ Card Members ------------------------ */

    addCardMember: async (
      boardId: string,
      stageId: string,
      cardId: string,
      userId: string,
    ) => {
      // Optimistic update: add member locally first
      const currentState = get();
      const { boards, currentBoard } = updateCardInState(
        currentState.boards,
        currentState.currentBoard,
        boardId,
        stageId,
        cardId,
        (card) => ({
          ...card,
          members: [
            ...card.members,
            { userId, user: { name: "Cargando..." } }, // Placeholder
          ],
        }),
      );
      set({ boards, currentBoard });

      try {
        const res = await cardsApi.addMember(cardId, { userId });
        // Update with real data from backend
        const { boards: updatedBoards, currentBoard: updatedCurrentBoard } =
          updateCardInState(
            currentState.boards,
            currentState.currentBoard,
            boardId,
            stageId,
            cardId,
            (card) => ({ ...card, members: res.members || [] }),
          );
        set({ boards: updatedBoards, currentBoard: updatedCurrentBoard });
      } catch (error) {
        // Rollback on error
        set(currentState);
        console.error("Error adding card member:", error);
      }
    },

    removeCardMember: async (
      boardId: string,
      stageId: string,
      cardId: string,
      userId: string,
    ) => {
      // Optimistic update: remove member locally first
      const currentState = get();
      const { boards, currentBoard } = updateCardInState(
        currentState.boards,
        currentState.currentBoard,
        boardId,
        stageId,
        cardId,
        (card) => ({
          ...card,
          members: card.members.filter((member) => member.userId !== userId),
        }),
      );
      set({ boards, currentBoard });

      try {
        await cardsApi.removeMember(cardId, userId);
        // Success: keep the optimistic update
      } catch (error) {
        // Rollback on error
        set(currentState);
        console.error("Error removing card member:", error);
      }
    },
  };
}
