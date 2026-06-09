import { ApiError } from "@/services/api";
import { useToastStore } from "@/stores/toastStore";

export function handleError(
  err: unknown,
  fallbackMessage = "Error inesperado",
): string {
  const message =
    err instanceof ApiError ? err.message : fallbackMessage;
  useToastStore.getState().addToast({ type: "error", message });
  return message;
}
