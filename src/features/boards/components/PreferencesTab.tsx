import {
  LockIcon,
  GlobeIcon,
  ChatCircleIcon,
  UserPlusIcon,
  UsersIcon,
  CheckSquareIcon,
  ImageIcon,
} from "@phosphor-icons/react";
import { Toggle } from "@/shared/components/Toggle";
import type { Board, BoardPreferences } from "@/shared/types/domain";
import { getBoardPreferences } from "../utils/boardPreferences";
import { Select } from "./Select";
import { PrefRow } from "./PrefRow";

interface PreferencesTabProps {
  board: Board;
  onUpdatePref: <K extends keyof BoardPreferences>(
    key: K,
    value: BoardPreferences[K],
  ) => void;
}

export function PreferencesTab({ board, onUpdatePref }: PreferencesTabProps) {
  const prefs = getBoardPreferences(board);

  return (
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
            onUpdatePref(
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
            onUpdatePref(
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
            onUpdatePref(
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
          onChange={(v) => onUpdatePref("workspaceEdit", v)}
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
          onChange={(v) => onUpdatePref("showCompletedOnCard", v)}
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
          onChange={(v) => onUpdatePref("coversEnabled", v)}
        />
      </PrefRow>
    </div>
  );
}
