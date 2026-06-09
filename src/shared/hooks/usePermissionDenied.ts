import { useState, useCallback, useEffect } from "react";
import { setForbiddenHandler, ApiClient, ApiError } from "@/services/api";
import { handleError } from "@/shared/utils/errorHandler";
import { useAuthStore } from "@/stores/authStore";

export interface PermissionRequestInfo {
  boardId: string;
  message: string;
  permission?: string;
}

let boardContextRef = "";

export function setBoardContext(boardId: string) {
  boardContextRef = boardId;
}

export function usePermissionDenied() {
  const [pendingRequest, setPendingRequest] =
    useState<PermissionRequestInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyPending, setAlreadyPending] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setForbiddenHandler((error: ApiError) => {
      const payload = error.payload as Record<string, unknown> | null;
      const permission = payload?.permission as string | undefined;
      setAlreadyPending(false);
      setPendingRequest({
        boardId: boardContextRef,
        message: error.message,
        permission,
      });
    });
    return () => {
      setForbiddenHandler(null);
    };
  }, []);

  const sendRequest = useCallback(async () => {
    if (!pendingRequest || !pendingRequest.boardId || !user) return;
    setIsSubmitting(true);
    try {
      await ApiClient.post(`/boards/${pendingRequest.boardId}/permission-requests`, {
        permission: pendingRequest.permission,
      });
      setPendingRequest(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setAlreadyPending(true);
      } else {
        handleError(err, "Error al enviar la solicitud. Intenta de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [pendingRequest, user]);

  const dismiss = useCallback(() => setPendingRequest(null), []);

  return {
    pendingRequest,
    sendRequest,
    dismiss,
    isSubmitting,
    alreadyPending,
  };
}
