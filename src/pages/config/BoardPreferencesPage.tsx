import { useParams } from "react-router-dom";
import {
  Globe,
  Lock,
  ChatCircle,
  UserPlus,
  Users,
  CheckSquare,
  Image as ImageIcon,
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
    <div className="flex items-start justify-between gap-4 border-b border-border-default py-3 last:border-b-0">
      <div className="flex items-start gap-2">
        {Icon && <Icon size={22} weight="duotone" className="mt-0.5 text-icon-muted" />}
        <div>
          <p className="text-content font-medium text-fg-default">{title}</p>
          {description && <p className="text-card-meta text-fg-subtle">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function BoardPreferencesPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const currentBoard = useBoardStore((s) => s.currentBoard);
  const updateBoard = useBoardStore((s) => s.updateBoard);

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
    <div className="flex flex-col">
      <h3 className="mb-1 text-content font-semibold text-fg-default">
        Espace de trabajo
      </h3>
      <PrefRow
        icon={prefs.visibility === "private" ? Lock : Globe}
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
          className="rounded-input border border-border-default bg-bg-card px-2 py-1 text-content text-fg-default"
        >
          <option value="workspace">Espacio de trabajo</option>
          <option value="private">Privado</option>
        </select>
      </PrefRow>

      <h3 className="mb-1 mt-6 text-content font-semibold text-fg-default">
        Permisos
      </h3>
      <PrefRow
        icon={ChatCircle}
        title="Comentarios"
        description="Quién puede comentar en las tarjetas."
      >
        <select
          value={prefs.commentPermission}
          onChange={(e) => updatePref("commentPermission", e.target.value as BoardPreferences["commentPermission"])}
          className="rounded-input border border-border-default bg-bg-card px-2 py-1 text-content text-fg-default"
        >
          <option value="members">Miembros</option>
          <option value="workspace">Espacio de trabajo</option>
          <option value="disabled">Deshabilitado</option>
        </select>
      </PrefRow>
      <PrefRow
        icon={UserPlus}
        title="Añadir y eliminar miembros"
        description="Quién puede gestionar a los miembros del tablero."
      >
        <select
          value={prefs.memberPermission}
          onChange={(e) => updatePref("memberPermission", e.target.value as BoardPreferences["memberPermission"])}
          className="rounded-input border border-border-default bg-bg-card px-2 py-1 text-content text-fg-default"
        >
          <option value="members">Miembros</option>
          <option value="admins">Solo administradores</option>
        </select>
      </PrefRow>
      <PrefRow
        icon={Users}
        title="Editar el espacio de trabajo"
        description="Cualquier miembro puede editar y unirse. Deshabilita para tableros privados."
      >
        <input
          type="checkbox"
          checked={prefs.workspaceEdit}
          onChange={(e) => updatePref("workspaceEdit", e.target.checked)}
          className="h-4 w-4 rounded border-border-default"
        />
      </PrefRow>

      <h3 className="mb-1 mt-6 text-content font-semibold text-fg-default">
        Estado completado
      </h3>
      <PrefRow
        icon={CheckSquare}
        title="Mostrar el estado completado en la tarjeta"
        description="Marca un indicador verde en tarjetas cuya checklist está completa."
      >
        <input
          type="checkbox"
          checked={prefs.showCompletedOnCard}
          onChange={(e) => updatePref("showCompletedOnCard", e.target.checked)}
          className="h-4 w-4 rounded border-border-default"
        />
      </PrefRow>

      <h3 className="mb-1 mt-6 text-content font-semibold text-fg-default">
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
          className="h-4 w-4 rounded border-border-default"
        />
      </PrefRow>
    </div>
  );
}