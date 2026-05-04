import { useEffect, useRef } from "react";
import { socketService } from "@/services/socket";
import { useAuthStore } from "@/stores/authStore";
import { useBoardStore } from "@/stores/boardStore";
import type { Stage } from "@/shared/types";
import { normalizeCard, normalizeStage } from "@/stores/boardStore/normalizers";

const REALTIME_EVENTS = [
  "card:updated",
  "card:created",
  "card:deleted",
  "card:moved",
  "stage:updated",
  "stage:created",
  "stage:deleted",
  "stage:reordered",
  "board:updated",
  "board:deleted",
] as const;

type RealtimeEventHandler = (payload: unknown) => void;

function buildEventHandlers(): Record<string, RealtimeEventHandler> {
  const store = useBoardStore.getState();

  return {
    "card:updated": (payload) => {
      const card = payload as { id: string; stageId: string; title?: string; description?: string; position?: number; startDate?: string | null; dueDate?: string | null };
      store.realtimeUpdateCard(card.id, {
        title: card.title,
        description: card.description,
        position: card.position,
        startDate: card.startDate ?? null,
        dueDate: card.dueDate ?? null,
        stageId: card.stageId,
      });
    },

    "card:created": (payload) => {
      const backendCard = payload as Parameters<typeof normalizeCard>[0];
      const card = normalizeCard(backendCard);
      store.realtimeAddCard({ ...card, stageId: backendCard.stageId });
    },

    "card:deleted": (payload) => {
      const data = payload as { id: string };
      store.realtimeDeleteCard(data.id);
    },

    "card:moved": (payload) => {
      const card = payload as { id: string; stageId: string; position: number };
      store.realtimeUpdateCard(card.id, {
        stageId: card.stageId,
        position: card.position,
      });
    },

    "stage:updated": (payload) => {
      const stage = payload as { id: string; name: string };
      store.realtimeUpdateStage(stage.id, { name: stage.name });
    },

    "stage:created": (payload) => {
      const backendStage = payload as { id: string; name: string; boardId: string; position: number; createdAt: string };
      const stage = normalizeStage(backendStage, []);
      store.realtimeAddStage(stage);
    },

    "stage:deleted": (payload) => {
      const data = payload as { id: string };
      store.realtimeDeleteStage(data.id);
    },

    "stage:reordered": (payload) => {
      const stage = payload as { id: string; position: number };
      store.realtimeUpdateStage(stage.id, { position: stage.position } as Partial<Stage> & { position: number });
    },

    "board:updated": (payload) => {
      const board = payload as { id: string; name?: string; background?: string };
      store.realtimeUpdateBoard(board.id, {
        name: board.name,
        background: board.background,
      });
    },

    "board:deleted": (payload) => {
      const data = payload as { boardId: string };
      store.realtimeDeleteBoard(data.boardId);
    },
  };
}

const useSocketImpl = () => {
  const user = useAuthStore((s) => s.user);
  const listenersRef = useRef(false);
  const connectedRef = useRef(false);
  const socketRef = useRef<ReturnType<typeof socketService.connect> | null>(null);

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
      const handlers = buildEventHandlers();

      REALTIME_EVENTS.forEach((event) => {
        socket.on(event, handlers[event]);
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
    joinBoard: socketService.joinBoard.bind(socketService),
    leaveBoard: socketService.leaveBoard.bind(socketService),
    isConnected: socketService.isConnected,
  };
};

export const useSocket = useSocketImpl;
