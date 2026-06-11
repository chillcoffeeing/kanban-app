import { io, Socket } from "socket.io-client";
import { TokenManager } from "@/services/api";

let socketInstance: Socket | null = null;

class SocketService {
  private currentBoardId: string | null = null;

  connect(): Socket {
    if (socketInstance?.connected) return socketInstance;

    const token = TokenManager.getAccess();
    if (!token) throw new Error("No access token available");

    socketInstance = io(
      import.meta.env.VITE_API_BASE?.replace("/api/v1", "") ||
        "http://localhost:3000",
      {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
      },
    );

    return socketInstance;
  }

  disconnect(): void {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      this.currentBoardId = null;
    }
  }

  joinBoard(boardId: string): void {
    if (!socketInstance) return;
    if (this.currentBoardId) {
      socketInstance.emit("board:leave", { boardId: this.currentBoardId });
    }
    socketInstance.emit("board:join", { boardId });
    this.currentBoardId = boardId;
  }

  leaveBoard(): void {
    if (!socketInstance || !this.currentBoardId) return;
    socketInstance.emit("board:leave", { boardId: this.currentBoardId });
    this.currentBoardId = null;
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    if (!socketInstance) return;
    socketInstance.on(event, callback);
  }

  off(event: string, callback?: (...args: unknown[]) => void): void {
    if (!socketInstance) return;
    socketInstance.off(event, callback);
  }

  get isConnected(): boolean {
    return socketInstance?.connected ?? false;
  }
}

export const socketService = new SocketService();
