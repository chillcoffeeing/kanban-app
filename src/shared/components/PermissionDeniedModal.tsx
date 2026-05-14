import { createPortal } from "react-dom";
import { Button } from "@/shared/components/Button";
import type { PermissionRequestInfo } from "@/shared/hooks/usePermissionDenied";

interface PermissionDeniedModalProps {
  request: PermissionRequestInfo;
  onSendRequest: () => void;
  onDismiss: () => void;
  isSubmitting?: boolean;
  alreadyPending?: boolean;
}

export function PermissionDeniedModal({
  request,
  onSendRequest,
  onDismiss,
  isSubmitting,
  alreadyPending,
}: PermissionDeniedModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-neutral-dark">
          Acción denegada
        </h2>
        <p className="mt-2 text-sm text-neutral-dark/70">{request.message}</p>
        <p className="mt-1 text-xs text-neutral-dark/50">
          Puedes solicitar permisos al propietario del tablero para realizar
          esta acción.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onDismiss}>
            Cerrar
          </Button>
          {alreadyPending ? (
            <span className="rounded-lg bg-warning/10 px-3 py-2 text-xs font-medium text-warning">
              Tu solicitud está pendiente de aprobación
            </span>
          ) : (
            <Button
              onClick={onSendRequest}
              disabled={isSubmitting || !request.boardId}
            >
              {isSubmitting ? "Enviando…" : "Solicitar permiso"}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
