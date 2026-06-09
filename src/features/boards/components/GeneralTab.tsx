import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { TrashIcon } from "@phosphor-icons/react";
import type { Board } from "@/shared/types/domain";

interface GeneralTabProps {
  board: Board;
  onSaveName: (name: string) => void;
  onDeleteBoard: () => void;
}

export function GeneralTab({ board, onSaveName, onDeleteBoard }: GeneralTabProps) {
  const [boardName, setBoardName] = useState(board.name);

  const handleSave = () => {
    if (boardName.trim() && boardName.trim() !== board.name) {
      onSaveName(boardName.trim());
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2">
        <Input
          label="Nombre del tablero"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSave} size="md">
          Guardar
        </Button>
      </div>
      <div className="pt-4 border-t border-neutral-light">
        <Button
          variant="danger"
          size="sm"
          onClick={onDeleteBoard}
        >
          <TrashIcon size={20} weight="duotone" /> Eliminar tablero
        </Button>
      </div>
    </div>
  );
}
