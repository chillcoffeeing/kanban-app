import { useState, useEffect } from "react";
import type { FormEvent, ReactNode } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Toggle } from "@/shared/components/Toggle";
import { PERMISSIONS } from "@/shared/utils/constants";
import { useBoardStore } from "@/stores/boardStore";
import { useActivity } from "@/shared/hooks/useActivity";
import { ACTIVITY_TYPES } from "@/stores/activityStore";
import {
  TrashIcon,
  UserPlusIcon,
  GearSixIcon,
  UsersIcon,
  SlidersHorizontalIcon,
  GlobeIcon,
  LockIcon,
  ChatCircleIcon,
  CheckSquareIcon,
  ImageIcon,
  UserIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  getBoardPreferences,
  canManageMembers,
} from "../utils/boardPreferences";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import type {
  Board,
  BoardMember,
  BoardPreferences,
  Permission,
} from "@/shared/types/domain";
import { api } from "@/services/api";

const PERMISSION_LABELS: Record<Permission, string> = {
  [PERMISSIONS.CREATE_STAGE]: "Crear etapas",
  [PERMISSIONS.CREATE_CARD]: "Crear tarjetas",
  [PERMISSIONS.MODIFY_CARD]: "Modificar tarjetas",
  [PERMISSIONS.DELETE_CARD]: "Eliminar tarjetas",
  [PERMISSIONS.INVITE_MEMBER]: "Invitar miembros",
};

type TabId = "general" | "members" | "preferences";

const TABS: Array<{ id: TabId; label: string; Icon: PhosphorIcon }> = [
  { id: "general", label: "General", Icon: GearSixIcon },
  { id: "members", label: "Miembros", Icon: UsersIcon },
  { id: "preferences", label: "Preferencias", Icon: SlidersHorizontalIcon },
];

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}

function Select({ value, onChange, options }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer rounded-lg border border-neutral-light bg-surface px-3 py-1.5 text-sm text-neutral-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

interface PrefRowProps {
  icon?: PhosphorIcon;
  title: string;
  description?: string;
  children: ReactNode;
}

function PrefRow({ icon: Icon, title, description, children }: PrefRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-light py-3 last:border-b-0">
      <div className="flex items-start gap-3">
        {Icon && (
          <Icon
            size={22}
            weight="duotone"
            className="mt-0.5 text-primary"
          />
        )}
        <div>
          <p className="text-sm font-medium text-neutral-dark">{title}</p>
          {description && (
            <p className="mt-0.5 text-xs text-neutral-dark/60">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

interface BoardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board | null;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
}

export function BoardSettingsModal({
  isOpen,
  onClose,
  board,
}: BoardSettingsModalProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [tab, setTab] = useState<TabId>("general");
  const [pendingInvites, setPendingInvites] = useState<PendingInvitation[]>([]);
  const {
    updateBoard,
    addMember,
    removeMember,
    updateMemberPermissions,
    deleteBoard,
  } = useBoardStore();
  const [boardName, setBoardName] = useState(board?.name || "");
  const log = useActivity(board?.id);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!board?.id) return;
    api<PendingInvitation[]>(`/boards/${board.id}/invitations`)
      .then(setPendingInvites)
      .catch(() => setPendingInvites([]));
  }, [board?.id]);

  if (!board) return null;

  const prefs = getBoardPreferences(board);
  const canManage = canManageMembers(board, currentUser?.id);

  const updatePref = <K extends keyof BoardPreferences>(
    key: K,
    value: BoardPreferences[K],
  ) => {
    updateBoard(board.id, {
      preferences: { ...prefs, [key]: value },
    });
  };

  const handleSaveName = () => {
    if (boardName.trim() && boardName.trim() !== board.name) {
      const oldName = board.name;
      updateBoard(board.id, { name: boardName.trim() });
      log(
        ACTIVITY_TYPES.BOARD_RENAMED,
        `renombró el tablero "${oldName}" a "${boardName.trim()}"`,
      );
    }
  };

  const handleInvite = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const email = inviteEmail.trim();
    addMember(board.id, email);
    log(ACTIVITY_TYPES.MEMBER_INVITED, `invitó a "${email}" al tablero`);
    setInviteEmail("");
  };

  const handleRemoveMember = (member: BoardMember) => {
    removeMember(board.id, member.id);  // member.id is the membershipId
    log(
      ACTIVITY_TYPES.MEMBER_REMOVED,
      `eliminó a "${member.email}" del tablero`,
    );
  };

  const handleDeleteInvitation = async (
    invitationId: string,
    email: string,
  ) => {
    try {
      await api<void>(`/invitations/${invitationId}`, { method: "DELETE" });
      setPendingInvites((prev) =>
        prev.filter((inv) => inv.id !== invitationId),
      );
      log(ACTIVITY_TYPES.MEMBER_REMOVED, `eliminó la invitación de "${email}"`);
    } catch (err) {
      useToastStore.getState().addToast({ type: "error", message: "Error al eliminar la invitación" });
    }
  };

  const formatDate = (d: string) => format(new Date(d), "P", { locale: es });

  const togglePermission = (membershipId: string, permission: Permission) => {
    const member = board.members.find((member) => member.id === membershipId);
    if (!member) return;
    const has = member.permissions.includes(permission);
    const perms = has
      ? member.permissions.filter((perm) => perm !== permission)
      : [...member.permissions, permission];
    updateMemberPermissions(board.id, membershipId, perms);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración del tablero"
      size="lg"
    >
      <div className="flex gap-4">
          <div className="flex flex-col gap-1 border-r border-neutral-light pr-4">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm ${
                tab === id
                  ? "bg-info text-primary font-medium"
                  : "text-neutral-dark hover:bg-neutral-light-hover"
              }`}
            >
              <Icon size={20} weight="duotone" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1">
          {tab === "general" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-end gap-2">
                <Input
                  label="Nombre del tablero"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveName} size="md">
                  Guardar
                </Button>
              </div>
              <div className="pt-4 border-t border-neutral-light">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (
                      confirm(
                        "¿Eliminar este tablero? Esta acción no se puede deshacer.",
                      )
                    ) {
                      deleteBoard(board.id);
                      onClose();
                    }
                  }}
                >
                  <TrashIcon size={20} weight="duotone" /> Eliminar tablero
                </Button>
              </div>
            </div>
          )}

          {tab === "members" && (
            <div className="flex flex-col gap-4">
              {canManage ? (
                <form onSubmit={handleInvite} className="flex items-end gap-2">
                  <Input
                    label="Invitar por email"
                    placeholder="email@ejemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="md">
                    <UserPlusIcon size={20} weight="duotone" /> Invitar
                  </Button>
                </form>
              ) : (
                <p className="rounded-lg border border-neutral-light bg-neutral-light/50 p-3 text-xs text-neutral-dark/60">
                  Solo el propietario puede gestionar miembros en este
                  tablero (preferencia{" "}
                  <strong>Añadir y eliminar miembros</strong> = Solo
                  propietario).
                </p>
              )}

              <div className="flex flex-col gap-3">
                {board.members.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-lg border border-neutral-light p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {member.user?.avatarUrl ? (
                          <img
                            src={member.user.avatarUrl}
                            alt={member.user.name}
                            className="size-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex size-10 items-center justify-center rounded-full bg-neutral-light-hover">
                            <UserIcon size={20} className="text-neutral-dark" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-dark">
                              {member.user?.name ||
                                member.email ||
                                "Propietario"}
                            </span>
                            <span className="rounded bg-neutral-light/50 px-1.5 py-0.5 text-xs text-neutral-dark">
                              {member.role}
                            </span>
                          </div>
                          {member.user?.createdAt && (
                            <p className="text-xs text-neutral-dark">
                              Miembro desde{" "}
                              {formatDate(member.user!.createdAt!)}
                            </p>
                          )}
                          {member.invitedAt && (
                            <p className="text-xs text-neutral-dark">
                              Invitado:{" "}
                              {formatDate(member.invitedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      {member.role !== "owner" && canManage && (
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="cursor-pointer text-danger hover:text-danger-hover"
                        >
                          <TrashIcon size={20} weight="duotone" />
                        </button>
                      )}
                    </div>
                    {member.role !== "owner" && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(
                          Object.entries(PERMISSION_LABELS) as Array<
                            [Permission, string]
                          >
                        ).map(([perm, label]) => (
                          <label
                            key={perm}
                            className="flex items-center gap-1 text-xs text-neutral-dark cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={member.permissions.includes(perm)}
                              onChange={() => togglePermission(member.id, perm)}
                              className="rounded"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {pendingInvites.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-light">
                  <h4 className="mb-3 text-sm font-semibold text-neutral-dark flex items-center gap-2">
                    <ClockIcon size={18} weight="duotone" />
                    Invitaciones pendientes
                  </h4>
                  <div className="flex flex-col gap-3">
                    {pendingInvites.map((inv) => (
                      <div
                        key={inv.id}
                        className="rounded-lg border border-neutral-light p-3 opacity-75"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-neutral-light-hover">
                               <UserIcon
                                 size={20}
                                 className="text-neutral-dark"
                               />
                             </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-neutral-dark">
                                   {inv.email}
                                 </span>
                                  <span className="rounded bg-warning px-1.5 py-0.5 text-xs text-warning">
                                    Pendiente
                                  </span>
                                 <span className="rounded bg-neutral-light/50 px-1.5 py-0.5 text-xs text-neutral-dark">
                                    {inv.role}
                                  </span>
                              </div>
                              <p className="text-xs text-neutral-dark">
                                 Invitado:{" "}
                                {format(new Date(inv.createdAt), "P", { locale: es })}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteInvitation(inv.id, inv.email)
                            }
                            className="cursor-pointer text-danger hover:text-danger-hover"
                          >
                            <TrashIcon size={20} weight="duotone" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "preferences" && (
            <div className="flex flex-col">
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-dark">
                Espacio de trabajo
              </h4>
              <PrefRow
                icon={prefs.visibility === "private" ? LockIcon : GlobeIcon}
                title="Visibilidad"
                description={
                  prefs.visibility === "private"
                    ? "Solo los miembros invitados pueden ver este tablero."
                    : "Todos los miembros del espacio de trabajo pueden verlo."
                }
              >
                <Select
                  value={prefs.visibility}
                  onChange={(v) =>
                    updatePref(
                      "visibility",
                      v as BoardPreferences["visibility"],
                    )
                  }
                  options={[
                    { value: "workspace", label: "Espacio de trabajo" },
                    { value: "private", label: "Privado" },
                  ]}
                />
              </PrefRow>

              <h4 className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-dark">
                Permisos
              </h4>
              <PrefRow
                icon={ChatCircleIcon}
                title="Comentarios"
                description="Quién puede comentar en las tarjetas."
              >
                <Select
                  value={prefs.commentPermission}
                  onChange={(v) =>
                    updatePref(
                      "commentPermission",
                      v as BoardPreferences["commentPermission"],
                    )
                  }
                  options={[
                    { value: "members", label: "Miembros" },
                    { value: "workspace", label: "Espacio de trabajo" },
                    { value: "disabled", label: "Deshabilitado" },
                  ]}
                />
              </PrefRow>
              <PrefRow
                icon={UserPlusIcon}
                title="Añadir y eliminar miembros"
                description="Quién puede gestionar a los miembros del tablero."
              >
                <Select
                  value={prefs.memberPermission}
                  onChange={(v) =>
                    updatePref(
                      "memberPermission",
                      v as BoardPreferences["memberPermission"],
                    )
                  }
                  options={[
                    { value: "members", label: "Miembros" },
                    { value: "admins", label: "Solo propietario" },
                  ]}
                />
              </PrefRow>
              <PrefRow
                icon={UsersIcon}
                title="Editar el Espacio de trabajo"
                description="Cualquier miembro puede editar y unirse. Deshabilita para tableros privados."
              >
                <Toggle
                  checked={prefs.workspaceEdit}
                  onChange={(v) => updatePref("workspaceEdit", v)}
                />
              </PrefRow>

              <h4 className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-dark">
                Estado completado
              </h4>
              <PrefRow
                icon={CheckSquareIcon}
                title="Mostrar el estado completado en la tarjeta"
                description="Marca un indicador verde en tarjetas cuya checklist está completa."
              >
                <Toggle
                  checked={prefs.showCompletedOnCard}
                  onChange={(v) => updatePref("showCompletedOnCard", v)}
                />
              </PrefRow>

              <h4 className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-dark">
                Portadas
              </h4>
              <PrefRow
                icon={ImageIcon}
                title="Portadas de la tarjeta habilitadas"
                description="Muestra adjuntos de imagen y colores en la parte delantera de las tarjetas."
              >
                <Toggle
                  checked={prefs.coversEnabled}
                  onChange={(v) => updatePref("coversEnabled", v)}
                />
              </PrefRow>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
