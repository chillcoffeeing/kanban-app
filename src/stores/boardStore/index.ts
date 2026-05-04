import { create } from "zustand";
import type { BoardState } from "./types";
import { createBoardActions } from "./boardActions";
import { createMemberActions } from "./memberActions";
import { createStageActions } from "./stageActions";
import { createCardActions } from "./cardActions";
import { createCardMemberActions } from "./cardMemberActions";
import { createCardChecklistActions } from "./cardChecklistActions";
import { createCardLabelActions } from "./cardLabelActions";
import { createRealtimeActions } from "./realtimeActions";

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,

  // UI state for modals
  selectedUserId: null,
  setSelectedUserId: (userId: string | null) => set({ selectedUserId: userId }),

  ...createBoardActions(set, get),
  ...createMemberActions(set, get),
  ...createStageActions(set, get),
  ...createCardActions(set, get),
  ...createCardMemberActions(set, get),
  ...createCardChecklistActions(set, get),
  ...createCardLabelActions(set, get),
  ...createRealtimeActions(set, get),
}));
