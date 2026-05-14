import { useState, useCallback, useEffect } from "react";
import { SetOnForbidden, api, ApiError } from "@/services/api";
import { useToastStore } from "@/stores/toastStore";
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
    SetOnForbidden((error: ApiError) => {
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
      SetOnForbidden(null);
    };
  }, []);

  const sendRequest = useCallback(async () => {
    if (!pendingRequest || !pendingRequest.boardId || !user) return;
    setIsSubmitting(true);
    try {
      await api(`/boards/${pendingRequest.boardId}/permission-requests`, {
        method: "POST",
        body: { permission: pendingRequest.permission },
      });
      useToastStore.getState().addToast({
        type: "success",
        message: "Solicitud enviada al propietario del tablero",
      });
      setPendingRequest(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setAlreadyPending(true);
      } else {
        useToastStore.getState().addToast({
          type: "error",
          message: "Error al enviar la solicitud. Intenta de nuevo.",
        });
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
