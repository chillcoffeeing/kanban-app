import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/shared/components/Button";
import { api, getAccessToken as getToken, API_BASE_URL } from "@/services/api";
import { CheckIcon, XIcon } from "@phosphor-icons/react";

interface PendingInvitation {
  id: string;
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

  console.log(
    "[InvitationsPage] Rendering, user:",
    user,
    "isAuthenticated:",
    isAuthenticated,
  );
  console.log("[InvitationsPage] invitations:", invitations);

  useEffect(() => {
    console.log("[InvitationsPage] useEffect running");
    loadInvitations().catch((e) =>
      console.error("[InvitationsPage] loadInvitations error:", e),
    );
  }, []);

  const loadInvitations = async () => {
    try {
      const token = localStorage.getItem("canvan_token");
      console.log("[Invitations] Token:", token ? "exists" : "missing");
      console.log("[Invitations] API_BASE:", API_BASE_URL);

      const res = await api("/invitations/pending", { auth: true });
      console.log("[Invitations] Raw response:", res);
      console.log("[Invitations] Type:", typeof res);

      const data = Array.isArray(res) ? res : (res as any)?.data || [];
      console.log("[Invitations] Data:", data);
      setInvitations(data);
    } catch (e: unknown) {
      const err = e as Error;
      console.error("[Invitations] Error:", err?.message || err);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const accept = async (invitation: PendingInvitation) => {
    setActionInProgress(invitation.id);
    try {
      await api(`/invitations/${invitation.id}/accept`, { auth: true });
      navigate(`/boards/${invitation.boardId}`);
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setActionInProgress(null);
    }
  };

  const reject = async (invitation: PendingInvitation) => {
    setActionInProgress(invitation.id);
    try {
      await api(`/invitations/${invitation.id}`, { auth: true });
      setInvitations(invitations.filter((i) => i.id !== invitation.id));
    } catch (e: unknown) {
      console.error(e);
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
                <XIcon size={18} /> Rechazar
              </Button>
              <Button
                size="sm"
                onClick={() => accept(invitation)}
                disabled={actionInProgress === invitation.id}
              >
                <CheckIcon size={18} /> Aceptar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
