import type {
  Board,
  BoardMember,
  Card,
  Label,
  Permission,
  Stage,
} from "@/shared/types";

export interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;

  // UI state for modals
  selectedUserId: string | null;
  setSelectedUserId: (userId: string | null) => void;

  // Hydration
  hydrateBoards: () => Promise<void>;
  setCurrentBoard: (boardId: string | null) => Promise<void>;

  // Boards
  createBoard: (name: string, background?: string) => Promise<Board>;
  updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;

  // Members (local-only for now — backend requires invitations with accept flow)
  addMember: (
    boardId: string,
    email: string,
    permissions?: Permission[],
  ) => Promise<void>;
  updateMemberPermissions: (
    boardId: string,
    membershipId: string,
    permissions: Permission[],
  ) => Promise<void>;
  removeMember: (boardId: string, membershipId: string) => Promise<void>;

  // Stages
  addStage: (boardId: string, name: string) => Promise<Stage>;
  updateStage: (
    boardId: string,
    stageId: string,
    updates: Partial<Stage>,
  ) => Promise<void>;
  deleteStage: (boardId: string, stageId: string) => Promise<void>;

  // Cards
  addCard: (boardId: string, stageId: string, title: string) => Promise<Card>;
  updateCard: (
    boardId: string,
    stageId: string,
    cardId: string,
    updates: Partial<Card>,
  ) => Promise<void>;
  deleteCard: (
    boardId: string,
    stageId: string,
    cardId: string,
  ) => Promise<void>;
  moveCard: (
    boardId: string,
    fromStageId: string,
    toStageId: string,
    cardId: string,
    newIndex: number,
  ) => Promise<void>;
  loadCard: (cardId: string) => Promise<Card | null>;
  addCardMember: (
    boardId: string,
    stageId: string,
    cardId: string,
    userId: string,
  ) => Promise<void>;
  removeCardMember: (
    boardId: string,
    stageId: string,
    cardId: string,
    userId: string,
  ) => Promise<void>;
  addChecklistItem: (
    boardId: string,
    stageId: string,
    cardId: string,
    text: string,
  ) => Promise<void>;
  updateChecklistItem: (
    boardId: string,
    stageId: string,
    cardId: string,
    itemId: string,
    updates: { text?: string; done?: boolean },
  ) => Promise<void>;
  deleteChecklistItem: (
    boardId: string,
    stageId: string,
    cardId: string,
    itemId: string,
  ) => Promise<void>;
  attachLabel: (
    boardId: string,
    stageId: string,
    cardId: string,
    labelId: string,
  ) => Promise<void>;
  detachLabel: (
    boardId: string,
    stageId: string,
    cardId: string,
    labelId: string,
  ) => Promise<void>;
  createLabel: (boardId: string, name: string, color: string) => Promise<Label>;
  deleteLabel: (boardId: string, labelId: string) => Promise<void>;

  // Realtime actions (local state updates only)
  realtimeUpdateBoard: (boardId: string, updates: Partial<Board>) => void;
  realtimeDeleteBoard: (boardId: string) => void;
  realtimeUpdateCard: (
    cardId: string,
    updates: Partial<Card & { stageId: string }>,
  ) => void;
  realtimeAddCard: (card: Card & { stageId: string }) => void;
  realtimeDeleteCard: (cardId: string) => void;
  realtimeUpdateStage: (
    stageId: string,
    updates: Partial<Stage> & { position?: number },
  ) => void;
  realtimeAddStage: (stage: Stage) => void;
  realtimeDeleteStage: (stageId: string) => void;
}
