import { cardsApi } from "@/services/cards";
import { updateCardInState } from "./cardHelpers";

export function createCardMemberActions(set: any, get: any) {
  return {
    /* ------------------------ Card Members ------------------------ */

    addCardMember: async (
      boardId: string,
      stageId: string,
      cardId: string,
      boardMembershipId: string,
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
            {
              boardMembershipId: boardMembershipId,
              boardMembership: {
                user: { name: "Cargando...", avatarUrl: null, id: "" },
              },
            }, // Placeholder
          ],
        }),
      );
      set({ boards, currentBoard });

      try {
        const res = await cardsApi.addMember(cardId, {
          boardMembershipId: boardMembershipId,
        });
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
      }
    },

    removeCardMember: async (
      boardId: string,
      stageId: string,
      cardId: string,
      boardMembershipId: string,
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
          members: card.members.filter(
            (member) => member.boardMembershipId !== boardMembershipId,
          ),
        }),
      );
      set({ boards, currentBoard });

      try {
        await cardsApi.removeMember(cardId, boardMembershipId);

        const { boards: updatedBoards, currentBoard: updatedCurrentBoard } =
          updateCardInState(
            currentState.boards,
            currentState.currentBoard,
            boardId,
            stageId,
            cardId,
            (card) => ({
              ...card,
              members:
                card.members.filter(
                  (m) => m.boardMembershipId !== boardMembershipId,
                ) || [],
            }),
          );
        set({ boards: updatedBoards, currentBoard: updatedCurrentBoard });
      } catch (error) {
        console.log(error);

        // Rollback on error
        set(currentState);
      }
    },
  };
}
