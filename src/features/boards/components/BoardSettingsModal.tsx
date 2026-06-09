import { useState } from "react";
import {
  GearSixIcon,
  UsersIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { Modal } from "@/shared/components/Modal";
import { useBoardStore } from "@/stores/boardStore";
import { useActivity } from "@/shared/hooks/useActivity";
import { ACTIVITY_TYPES } from "@/stores/activityStore";
import { getBoardPreferences } from "../utils/boardPreferences";
import type { Board, BoardPreferences } from "@/shared/types/domain";
import { GeneralTab } from "./GeneralTab";
import { MembersTab } from "./MembersTab";
import { PreferencesTab } from "./PreferencesTab";

type TabId = "general" | "members" | "preferences";

interface TabConfig {
  id: TabId;
  label: string;
  Icon: PhosphorIcon;
}

const TABS: TabConfig[] = [
  { id: "general", label: "General", Icon: GearSixIcon },
  { id: "members", label: "Miembros", Icon: UsersIcon },
  { id: "preferences", label: "Preferencias", Icon: SlidersHorizontalIcon },
];

interface BoardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board | null;
}

export function BoardSettingsModal({
  isOpen,
  onClose,
  board,
}: BoardSettingsModalProps) {
  const [tab, setTab] = useState<TabId>("general");
  const { updateBoard, deleteBoard } = useBoardStore();
  const log = useActivity(board?.id);

  if (!board) return null;

  const prefs = getBoardPreferences(board);

  const handleSaveName = (name: string) => {
    const oldName = board.name;
    updateBoard(board.id, { name });
    log(
      ACTIVITY_TYPES.BOARD_RENAMED,
      `renombró el tablero "${oldName}" a "${name}"`,
    );
  };

  const handleDeleteBoard = () => {
    if (
      confirm(
        "¿Eliminar este tablero? Esta acción no se puede deshacer.",
      )
    ) {
      deleteBoard(board.id);
      onClose();
    }
  };

  const updatePref = <K extends keyof BoardPreferences>(
    key: K,
    value: BoardPreferences[K],
  ) => {
    updateBoard(board.id, {
      preferences: { ...prefs, [key]: value },
    });
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
            <GeneralTab
              board={board}
              onSaveName={handleSaveName}
              onDeleteBoard={handleDeleteBoard}
            />
          )}
          {tab === "members" && (
            <MembersTab board={board} />
          )}
          {tab === "preferences" && (
            <PreferencesTab
              board={board}
              onUpdatePref={updatePref}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
