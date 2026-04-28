import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBoardStore } from "@/stores/boardStore";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Trash } from "@phosphor-icons/react";
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
      <div>
        <h3 className="mb-1 text-content font-semibold text-fg-default">
          Información básica
        </h3>
        <p className="mb-3 text-card-meta text-fg-subtle">
          Nombre y datos principales del tablero.
        </p>
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
      </div>

      <div className="pt-4 border-t border-border-default">
        <h3 className="mb-1 text-content font-semibold text-fg-default">
          Zona peligrosa
        </h3>
        <p className="mb-3 text-card-meta text-fg-subtle">
          Esta acción es irreversible.
        </p>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          <Trash size={20} weight="duotone" /> Eliminar tablero
        </Button>
      </div>
    </div>
  );
}