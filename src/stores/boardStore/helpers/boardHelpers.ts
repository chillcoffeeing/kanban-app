import type { Board, Card } from "@/shared/types";
import type { BoardState } from "../types";

export function forBoard(
  draft: BoardState,
  boardId: string,
  fn: (board: Board) => void,
) {
  const listBoard = draft.boards.find((board) => board.id === boardId);
  if (listBoard) fn(listBoard);
  if (
    draft.currentBoard?.id === boardId &&
    draft.currentBoard !== listBoard
  ) {
    fn(draft.currentBoard);
  }
}

export function forCard(
  draft: BoardState,
  boardId: string,
  stageId: string,
  cardId: string,
  fn: (card: Card) => void,
) {
  forBoard(draft, boardId, (board) => {
    const stage = board.stages.find((s) => s.id === stageId);
    const card = stage?.cards.find((card) => card.id === cardId);
    if (card) fn(card);
  });
}
