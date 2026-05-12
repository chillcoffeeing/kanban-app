import { useMemo, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBoardStore } from "@/stores/boardStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useActivity } from "@/shared/hooks/useActivity";
import { ACTIVITY_TYPES } from "@/stores/activityStore";
import { CardItem } from "@/features/cards/components/CardItem";
import { Button } from "@/shared/components/Button";
import { DropdownMenu, DropdownItem } from "@/shared/components/DropdownMenu";
import {
  PlusIcon,
  DotsThreeIcon,
  PencilIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import type { Card, Stage } from "@/shared/types/domain";

interface StageColumnProps {
  stage: Stage;
  boardId: string;
  onOpenCard: (card: Card, stageId: string) => void;
}

export function StageColumn({ stage, boardId, onOpenCard }: StageColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(stage.name);
  const { addCard, updateStage, deleteStage } = useBoardStore();
  const log = useActivity(boardId);

  const showCompletedCards = useSettingsStore((settings) => settings.showCompletedCards);

  const visibleCards = useMemo(() => {
    return stage.cards.filter((card) => {
      if (showCompletedCards) return true;
      const total = card.checklist?.length || 0;
      if (total === 0) return true;
      const done = card.checklist.filter((checkItem) => checkItem.done).length;
      return done < total;
    });
  }, [stage.cards, showCompletedCards]);

  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: "stage", stageId: stage.id },
  });

  const handleAddCard = (
    e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    const title = newCardTitle.trim();
    addCard(boardId, stage.id, title);
    log(
      ACTIVITY_TYPES.CARD_CREATED,
      `creó la tarjeta "${title}" en "${stage.name}"`,
    );
    setNewCardTitle("");
    setIsAdding(false);
  };

  const handleRename = (
    e: FormEvent<HTMLFormElement> | React.FocusEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    if (editName.trim() && editName.trim() !== stage.name) {
      const oldName = stage.name;
      updateStage(boardId, stage.id, { name: editName.trim() });
      log(
        ACTIVITY_TYPES.STAGE_RENAMED,
        `renombró la etapa "${oldName}" a "${editName.trim()}"`,
      );
    }
    setIsEditing(false);
  };

  return (
    <div className="flex h-full w-72 shrink-0 flex-col rounded-xl border border-neutral-light bg-surface shadow-md gap-y-(--density-gap,1rem)">
      <div className="flex items-center justify-between px-4 pt-3">
        {isEditing ? (
          <form onSubmit={handleRename} className="flex-1">
            <input
              autoFocus /* Intentional: auto-focus for quick rename workflow */
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              className="w-full rounded-lg border border-neutral-light bg-surface px-2 py-1 text-sm font-semibold text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </form>
        ) : (
          <h3 className="text-sm font-semibold text-neutral-dark flex items-center gap-2">
            {stage.name}
            <span className="ml-2 text-xs font-normal text-neutral-dark/50 bg-neutral-light/50 px-2 py-0.5 rounded-full">
              {visibleCards.length}
            </span>
          </h3>
        )}
        <DropdownMenu
          trigger={
            <button className="cursor-pointer rounded p-1 text-neutral-dark/50 hover:bg-neutral-light-hover hover:text-neutral-dark transition-colors">
              <DotsThreeIcon size={18} weight="bold" />
            </button>
          }
        >
          <DropdownItem
            onClick={() => {
              setIsEditing(true);
              setEditName(stage.name);
            }}
          >
            <span className="flex items-center gap-2">
              <PencilIcon size={16} weight="duotone" /> Renombrar
            </span>
          </DropdownItem>
          <DropdownItem
            danger
            onClick={() => {
              if (confirm("¿Eliminar esta etapa y todas sus tarjetas?")) {
                deleteStage(boardId, stage.id);
                log(
                  ACTIVITY_TYPES.STAGE_DELETED,
                  `eliminó la etapa "${stage.name}"`,
                );
              }
            }}
          >
            <span className="flex items-center gap-2">
              <TrashIcon size={16} weight="duotone" /> Eliminar
            </span>
          </DropdownItem>
        </DropdownMenu>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-(--density-gap,0.5rem) overflow-y-auto px-2 pb-2 ${
          isOver ? "bg-info/20 rounded-lg" : ""
        }`}
      >
        <SortableContext
          items={visibleCards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {visibleCards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              stageId={stage.id}
              boardId={boardId}
              onClick={() => onOpenCard(card, stage.id)}
            />
          ))}
        </SortableContext>
      </div>

      <div className="px-2 pb-2">
        {isAdding ? (
          <form onSubmit={handleAddCard} className="flex flex-col gap-2">
            <textarea
              autoFocus /* Intentional: auto-focus for quick card creation flow */
              placeholder="Título de la tarjeta..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCard(e);
                }
                if (e.key === "Escape") setIsAdding(false);
              }}
              className="w-full resize-none rounded-lg border border-neutral-light bg-surface px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" type="submit">
                Añadir
              </Button>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => setIsAdding(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-1.5 bg-transparent border-2 border-dashed border-secondary text-sm font-medium text-secondary hover:bg-secondary hover:text-secondary-fg transition-colors"
          >
            <PlusIcon size={28} weight="duotone" /> Añadir tarjeta
          </button>
        )}
      </div>
    </div>
  );
}
