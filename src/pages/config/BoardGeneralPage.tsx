import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBoardStore } from "@/stores/boardStore";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { TrashIcon, GearIcon, WarningIcon } from "@phosphor-icons/react";
import { useActivity } from "@/shared/hooks/useActivity";
import { ACTIVITY_TYPES } from "@/stores/activityStore";

export function BoardGeneralPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { updateBoard, deleteBoard } = useBoardStore();
  const currentBoard = useBoardStore((s) => s.currentBoard);
  const log = useActivity(boardId);

  const [boardName, setBoardName] = useState(currentBoard?.name || "");

  if (!currentBoard || !boardId) return null;

  const handleSaveName = () => {
    if (boardName.trim() && boardName.trim() !== currentBoard.name) {
      const oldName = currentBoard.name;
      updateBoard(boardId, { name: boardName.trim() });
      log(
        ACTIVITY_TYPES.BOARD_RENAMED,
        `renombró el tablero "${oldName}" a "${boardName.trim()}"`
      );
    }
  };

  const handleDelete = () => {
    if (
      confirm("¿Eliminar este tablero? Esta acción no se puede deshacer.")
    ) {
      deleteBoard(boardId);
      navigate("/boards");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-neutral-light bg-surface p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold text-neutral-dark flex items-center gap-2">
          <GearIcon size={20} weight="duotone" className="text-primary/70" />
          Información básica
        </h3>
        <p className="mb-4 text-sm text-neutral-dark/60">
          Nombre y datos principales del tablero.
        </p>
        <div className="flex items-end gap-3">
          <Input
            label="Nombre del tablero"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSaveName} size="md">
            Guardar cambios
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-danger/20 bg-surface p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold text-danger flex items-center gap-2">
          <WarningIcon size={20} weight="duotone" />
          Zona peligrosa
        </h3>
        <p className="mb-4 text-sm text-neutral-dark/60">
          Esta acción es irreversible. Se eliminarán todas las etapas, tarjetas y miembros asociados.
        </p>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          <TrashIcon size={18} weight="duotone" /> Eliminar tablero permanentemente
        </Button>
      </div>
    </div>
  );
}
