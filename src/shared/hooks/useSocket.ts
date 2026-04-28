import { useEffect, useRef } from "react";
import { socketService } from "@/services/socket";
import { useAuthStore } from "@/stores/authStore";

const useSocketImpl = () => {
  const user = useAuthStore((s) => s.user);
  const listenersRef = useRef(false);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      socketService.disconnect();
      connectedRef.current = false;
      return;
    }

    if (connectedRef.current) return;
    connectedRef.current = true;

    const socket = socketService.connect();

    if (!listenersRef.current) {
      socket.on("card:updated", () => {});
      socket.on("card:created", () => {});
      socket.on("card:deleted", () => {});
      socket.on("stage:updated", () => {});
      socket.on("stage:created", () => {});
      socket.on("stage:deleted", () => {});
      socket.on("board:updated", () => {});
      listenersRef.current = true;
    }
  }, [user]);

  return {
    joinBoard: socketService.joinBoard.bind(socketService),
    leaveBoard: socketService.leaveBoard.bind(socketService),
    isConnected: socketService.isConnected,
  };
};

export const useSocket = useSocketImpl;
