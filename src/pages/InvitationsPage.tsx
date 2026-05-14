import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/shared/components/Button";
import { api } from "@/services/api";
import { useToastStore } from "@/stores/toastStore";
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
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
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
          useToastStore.getState().addToast({ type: "error", message: "Error al cargar invitaciones" });
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
        useToastStore.getState().addToast({ type: "error", message: "Error al aceptar la invitación" });
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
      setInvitations(invitations.filter((invitationItem) => invitationItem.id !== invitation.id));
    } catch (e: unknown) {
      if ((e as any)?.name !== "AbortError") {
        useToastStore.getState().addToast({ type: "error", message: "Error al rechazar la invitación" });
      }
    } finally {
      setActionInProgress(null);
    }
  };

  if (!isAuthenticated) {
    return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-4 inline-block">
          <XCircleIcon size={32} weight="duotone" className="text-primary" />
        </div>
        <p className="text-neutral-dark">Debes iniciar sesión</p>
      </div>
    </div>
    );
  }

  if (loading) {
    return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
      <div className="text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-neutral-light border-t-primary"></div>
        <p className="mt-4 text-neutral-dark/50">Cargando&hellip;</p>
      </div>
    </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 text-center">
        <div className="mb-4 rounded-full bg-neutral-light/50 p-6 inline-block">
          <CheckCircleIcon size={48} weight="duotone" className="text-neutral-dark/30" />
        </div>
        <h1 className="text-2xl font-semibold text-neutral-dark">
            Sin invitaciones pendientes
        </h1>
        <p className="mt-2 text-neutral-dark/60">
           No tienes ninguna invitación a tableros.
        </p>
        <Button onClick={() => navigate("/boards")} className="mt-6">
          Ir a mis tableros
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-dark">
           Invitaciones pendientes
          </h1>
          <p className="mt-1 text-sm text-neutral-dark/60">
            Has sido invitado a {invitations.length} tablero{invitations.length !== 1 ? 's' : ''}.
          </p>
        </div>

      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between rounded-xl border border-neutral-light bg-surface p-4 shadow-sm hover:shadow-md transition-all animate-scaleIn"
          >
            <div>
              <p className="font-medium text-neutral-dark">
                 {invitation.boardName || "Tablero sin nombre"}
               </p>
               <p className="mt-0.5 text-sm text-neutral-dark/60">Rol: {invitation.role}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
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
