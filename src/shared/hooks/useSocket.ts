import { useEffect, useRef } from "react";
import { socketService } from "@/services/socket";
import { useAuthStore } from "@/stores/authStore";
import { useBoardStore } from "@/stores/boardStore";
import { eventBus } from "@/shared/utils/eventBus";
import type { Stage, BoardMember } from "@/shared/types";
import type { CardResponse } from "@/shared/types/api";
import {
  normalizeCard,
  normalizeStage,
} from "@/stores/boardStore/helpers/normalizers";

const REALTIME_EVENTS = [
  "card:updated",
  "card:created",
  "card:deleted",
  "card:moved",
  "card:member_added",
  "card:member_removed",
  "checklist:changed",
  "stage:updated",
  "stage:created",
  "stage:deleted",
  "stage:reordered",
  "board:updated",
  "member:joined",
  "member:left",
] as const;

type RealtimeEventHandler = (payload: unknown) => void;

function getStore() {
  return useBoardStore.getState();
}

function findCardInCurrentBoard(
  store: ReturnType<typeof useBoardStore.getState>,
  cardId: string,
) {
  const board = store.currentBoard;
  if (!board) return null;
  for (const stage of board.stages) {
    const card = stage.cards.find((c) => c.id === cardId);
    if (card) return card;
  }
  return null;
}

function buildHandlersForEvent(event: string): RealtimeEventHandler {
  switch (event) {
    case "card:updated": {
      return (payload) => {
        const data = payload as CardResponse;
        getStore().realtimeUpdateCard(data.id, {
          title: data.title,
          description: data.description,
          position: data.position,
          startDate: data.startDate ?? null,
          dueDate: data.dueDate ?? null,
          stageId: data.stageId,
          labels: data.labels,
          members: data.members,
          checklist: data.checklist,
        });
      };
    }
    case "card:created": {
      return (payload) => {
        const backendCard = payload as Parameters<typeof normalizeCard>[0];
        const card = normalizeCard(backendCard);
        getStore().realtimeAddCard({ ...card, stageId: backendCard.stageId });
      };
    }
    case "card:deleted": {
      return (payload) => {
        const data = payload as { id: string };
        getStore().realtimeDeleteCard(data.id);
      };
    }
    case "card:moved": {
      return (payload) => {
        const data = payload as { id: string; stageId: string; position: number };
        getStore().realtimeUpdateCard(data.id, {
          stageId: data.stageId,
          position: data.position,
        });
      };
    }
    case "card:member_added":
    case "card:member_removed": {
      return (payload) => {
        const data = payload as CardResponse;
        getStore().realtimeUpdateCard(data.id, { members: data.members });
      };
    }
    case "checklist:changed": {
      return (payload) => {
        const ev = payload as {
          event: "added" | "toggled";
          cardId: string;
          item?: { id: string; cardId: string; text: string; done: boolean; position: number };
          itemId?: string;
          done?: boolean;
        };
        const store = getStore();
        const card = findCardInCurrentBoard(store, ev.cardId);
        if (!card) return;
        if (ev.event === "added" && ev.item) {
          store.realtimeUpdateCard(ev.cardId, {
            checklist: [...(card.checklist ?? []), ev.item],
          });
        } else if (ev.event === "toggled" && ev.itemId) {
          store.realtimeUpdateCard(ev.cardId, {
            checklist: (card.checklist ?? []).map((c) =>
              c.id === ev.itemId
                ? { ...c, done: ev.done ?? !c.done }
                : c,
            ),
          });
        }
      };
    }
    case "stage:updated": {
      return (payload) => {
        const stage = payload as { id: string; name: string };
        getStore().realtimeUpdateStage(stage.id, { name: stage.name });
      };
    }
    case "stage:created": {
      return (payload) => {
        const backendStage = payload as {
          id: string;
          name: string;
          boardId: string;
          position: number;
          createdAt: string;
        };
        const stage = normalizeStage(backendStage, []);
        getStore().realtimeAddStage(stage);
      };
    }
    case "stage:deleted": {
      return (payload) => {
        const data = payload as { id: string };
        getStore().realtimeDeleteStage(data.id);
      };
    }
    case "stage:reordered": {
      return (payload) => {
        const stage = payload as { id: string; position: number };
        getStore().realtimeUpdateStage(stage.id, {
          position: stage.position,
        } as Partial<Stage> & { position: number });
      };
    }
    case "member:joined": {
      return (payload: unknown) => {
        const data = payload as Record<string, unknown>;
        const user = data.user as Record<string, unknown> | undefined;
        const memberName = (user?.name as string) ?? "";
        const member: BoardMember = {
          id: data.id as string,
          role: data.role as BoardMember["role"],
          permissions: data.permissions as BoardMember["permissions"],
          invitedAt: data.invitedAt as string,
          email: (user?.email as string) ?? "",
          user: user
            ? {
                id: user.id as string,
                name: user.name as string,
                avatarUrl: (user.avatarUrl as string) ?? null,
                createdAt: user.createdAt as string,
              }
            : undefined,
        };
        getStore().realtimeAddMember(data.boardId as string, member);
        eventBus.emit("member:joined", {
          boardId: data.boardId,
          detail: "entró al tablero",
          userName: memberName,
        });
      };
    }
    case "member:left": {
      return (payload) => {
        const data = payload as { boardId: string; membershipId: string };
        getStore().realtimeRemoveMember(data.boardId, data.membershipId);
      };
    }
    case "board:updated": {
      return (payload) => {
        const board = payload as {
          id: string;
          name?: string;
          background?: string;
        };
        getStore().realtimeUpdateBoard(board.id, {
          name: board.name,
          background: board.background,
        });
      };
    }
    default:
      return () => {};
  }
}

const useSocketImpl = () => {
  const user = useAuthStore((state) => state.user);
  const listenersRef = useRef(false);
  const connectedRef = useRef(false);
  const socketRef = useRef<ReturnType<typeof socketService.connect> | null>(
    null,
  );
  const joinBoardRef = useRef(socketService.joinBoard.bind(socketService));
  const leaveBoardRef = useRef(socketService.leaveBoard.bind(socketService));

  useEffect(() => {
    if (!user) {
      socketService.disconnect();
      connectedRef.current = false;
      listenersRef.current = false;
      return;
    }

    if (connectedRef.current) return;
    connectedRef.current = true;

    const socket = socketService.connect();
    socketRef.current = socket;

    if (!listenersRef.current) {
      REALTIME_EVENTS.forEach((event) => {
        socket.on(event, buildHandlersForEvent(event));
      });

      listenersRef.current = true;
    }

    return () => {
      if (socketRef.current) {
        REALTIME_EVENTS.forEach((event) => {
          socketRef.current?.off(event);
        });
      }
      socketService.disconnect();
      listenersRef.current = false;
      connectedRef.current = false;
      socketRef.current = null;
    };
  }, [user]);

  return {
    joinBoard: joinBoardRef.current,
    leaveBoard: leaveBoardRef.current,
    isConnected: socketService.isConnected,
  };
};

export const useSocket = useSocketImpl;
