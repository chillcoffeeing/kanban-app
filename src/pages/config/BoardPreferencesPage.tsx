import { useParams } from "react-router-dom";
import {
  GlobeIcon,
  LockIcon,
  ChatCircleIcon,
  UserPlusIcon,
  UsersIcon,
  CheckSquareIcon,
  ImageIcon,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { useBoardStore } from "@/stores/boardStore";
import { getBoardPreferences } from "@/features/boards/utils/boardPreferences";
import type { BoardPreferences } from "@/shared/types/domain";

interface PrefRowProps {
  icon?: PhosphorIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
}

function PrefRow({ icon: Icon, title, description, children }: PrefRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-light py-3 last:border-b-0 hover:bg-neutral-light/30 transition-colors">
      <div className="flex items-start gap-3">
        {Icon && <Icon size={22} weight="duotone" className="mt-0.5 text-primary" />}
        <div>
          <p className="text-sm font-medium text-neutral-dark">{title}</p>
          {description && <p className="mt-0.5 text-xs text-neutral-dark/60">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function BoardPreferencesPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const currentBoard = useBoardStore((boardState) => boardState.currentBoard);
  const updateBoard = useBoardStore((boardState) => boardState.updateBoard);

  if (!currentBoard || !boardId) return null;

  const prefs = getBoardPreferences(currentBoard);

  const updatePref = <K extends keyof BoardPreferences>(
    key: K,
    value: BoardPreferences[K]
  ) => {
    updateBoard(boardId, {
      preferences: { ...prefs, [key]: value },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-neutral-light bg-surface p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-neutral-dark flex items-center gap-2">
          <GlobeIcon size={20} weight="duotone" className="text-primary/70" />
          Espacio de trabajo
        </h3>
        <PrefRow
          icon={prefs.visibility === "private" ? LockIcon : GlobeIcon}
          title="Visibilidad"
          description={
            prefs.visibility === "private"
              ? "Solo los miembros invitados pueden ver este tablero."
              : "Todos los miembros del espacio de trabajo pueden verlo."
          }
        >
          <select
            value={prefs.visibility}
            onChange={(e) => updatePref("visibility", e.target.value as BoardPreferences["visibility"])}
            className="rounded-lg border border-neutral-light bg-surface px-3 py-1.5 text-sm text-neutral-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="workspace">Espacio de trabajo</option>
            <option value="private">Privado</option>
          </select>
        </PrefRow>
      </div>

      <div className="rounded-xl border border-neutral-light bg-surface p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-neutral-dark flex items-center gap-2">
          <UserPlusIcon size={20} weight="duotone" className="text-primary/70" />
          Permisos
        </h3>
        <PrefRow
          icon={ChatCircleIcon}
          title="Comentarios"
          description="Quién puede comentar en las tarjetas."
        >
          <select
            value={prefs.commentPermission}
            onChange={(e) => updatePref("commentPermission", e.target.value as BoardPreferences["commentPermission"])}
            className="rounded-lg border border-neutral-light bg-surface px-3 py-1.5 text-sm text-neutral-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="members">Miembros</option>
            <option value="workspace">Espacio de trabajo</option>
            <option value="disabled">Deshabilitado</option>
          </select>
        </PrefRow>
        <PrefRow
          icon={UserPlusIcon}
          title="Añadir y eliminar miembros"
          description="Quién puede gestionar a los miembros del tablero."
        >
          <select
            value={prefs.memberPermission}
            onChange={(e) => updatePref("memberPermission", e.target.value as BoardPreferences["memberPermission"])}
            className="rounded-lg border border-neutral-light bg-surface px-3 py-1.5 text-sm text-neutral-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="members">Miembros</option>
            <option value="admins">Solo administradores</option>
          </select>
        </PrefRow>
        <PrefRow
          icon={UsersIcon}
          title="Editar el espacio de trabajo"
          description="Cualquier miembro puede editar y unirse. Deshabilita para tableros privados."
        >
          <input
            type="checkbox"
            checked={prefs.workspaceEdit}
            onChange={(e) => updatePref("workspaceEdit", e.target.checked)}
            className="size-4 rounded border-neutral-light text-primary focus:ring-2 focus:ring-primary/20"
          />
        </PrefRow>
      </div>

      <div className="rounded-xl border border-neutral-light bg-surface p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-neutral-dark flex items-center gap-2">
          <CheckSquareIcon size={20} weight="duotone" className="text-primary/70" />
          Estado completado
        </h3>
        <PrefRow
          icon={CheckSquareIcon}
          title="Mostrar el estado completado en la tarjeta"
          description="Marca un indicador verde en tarjetas cuya checklist está completa."
        >
          <input
            type="checkbox"
            checked={prefs.showCompletedOnCard}
            onChange={(e) => updatePref("showCompletedOnCard", e.target.checked)}
            className="size-4 rounded border-neutral-light text-primary focus:ring-2 focus:ring-primary/20"
          />
        </PrefRow>
      </div>

      <div className="rounded-xl border border-neutral-light bg-surface p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-neutral-dark flex items-center gap-2">
          <ImageIcon size={20} weight="duotone" className="text-primary/70" />
          Portadas
        </h3>
        <PrefRow
          icon={ImageIcon}
          title="Portadas de la tarjeta habilitadas"
          description="Muestra adjuntos de imagen y colores en la parte delantera de las tarjetas."
        >
          <input
            type="checkbox"
            checked={prefs.coversEnabled}
            onChange={(e) => updatePref("coversEnabled", e.target.checked)}
            className="size-4 rounded border-neutral-light text-primary focus:ring-2 focus:ring-primary/20"
          />
        </PrefRow>
      </div>
    </div>
  );
}
