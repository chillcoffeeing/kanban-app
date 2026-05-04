import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/shared/components/Button";
import { api } from "@/services/api";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";

interface PendingInvitation {
  id: string;
  token: string;
  boardId: string;
  boardName?: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
}

export function InvitationsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        const res = await api("/invitations/pending", {
          auth: true,
        });

        const data = Array.isArray(res) ? res : (res as any)?.data || [];

        setInvitations(data);
      } catch (e: unknown) {
        if ((e as any)?.name !== "AbortError") {
          // Error handled silently
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      controller.abort();
    };
  }, []);

  const accept = async (invitation: PendingInvitation) => {
    setActionInProgress(invitation.id);
    try {
      await api(`/invitations/${invitation.token}/accept`, { method: "POST" });
      navigate(`/boards/${invitation.boardId}`);
    } catch (e: unknown) {
      if ((e as any)?.name !== "AbortError") {
        // Error handled silently
      }
    } finally {
      setActionInProgress(null);
    }
  };

  const reject = async (invitation: PendingInvitation) => {
    setActionInProgress(invitation.id);
    try {
      await api(`/invitations/${invitation.id}`, {
        method: "DELETE",
      });
      setInvitations(invitations.filter((i) => i.id !== invitation.id));
    } catch (e: unknown) {
      if ((e as any)?.name !== "AbortError") {
        // Error handled silently
      }
    } finally {
      setActionInProgress(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center text-surface-500">
        Debes iniciar sesión
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center text-surface-500">
        Cargando...
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-surface-900">
          Sin invitaciones pendientes
        </h1>
        <p className="mt-2 text-surface-600">
          No tienes nenhuma invitación a tableros.
        </p>
        <Button onClick={() => navigate("/boards")} className="mt-6">
          Ir a mis tableros
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-surface-900">
        Invitaciones pendientes
      </h1>
      <p className="mt-2 mb-6 text-surface-600">
        Has sido invitado a los siguientes tableros.
      </p>

      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between rounded-xl border border-surface-200 p-4"
          >
            <div>
              <p className="font-medium text-surface-900">
                {invitation.boardName || "Tablero sin nombre"}
              </p>
              <p className="text-sm text-surface-500">Rol: {invitation.role}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => reject(invitation)}
                disabled={actionInProgress === invitation.id}
              >
                <XCircleIcon size={18} /> Rechazar
              </Button>
              <Button
                size="sm"
                onClick={() => accept(invitation)}
                disabled={actionInProgress === invitation.id}
              >
                <CheckCircleIcon size={18} /> Aceptar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
