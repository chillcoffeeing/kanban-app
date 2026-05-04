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
import { PlusIcon, DotsThreeIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react";
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

  const showCompletedCards = useSettingsStore().showCompletedCards;

  const visibleCards = useMemo(() => {
    return stage.cards.filter((card) => {
      if (showCompletedCards) return true;
      const total = card.checklist?.length || 0;
      if (total === 0) return true;
      const done = card.checklist.filter((c) => c.done).length;
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
    <div className="flex h-full w-72 shrink-0 flex-col rounded-xl border border-border-default bg-bg-card shadow-sm">
      <div className="flex items-center justify-between px-3 py-2.5">
        {isEditing ? (
          <form onSubmit={handleRename} className="flex-1">
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
               className="w-full rounded bg-bg-card px-2 py-1 text-sm font-semibold text-fg-default focus:outline-none focus:ring-2 focus:ring-border-focus"
            />
          </form>
        ) : (
          <h3 className="text-sm font-semibold text-surface-700">
            {stage.name}
            <span className="ml-2 text-xs font-normal text-surface-400">
              {visibleCards.length}
            </span>
          </h3>
        )}
        <DropdownMenu
          trigger={
            <button className="cursor-pointer rounded p-1 text-surface-400 hover:bg-surface-200 hover:text-surface-600">
              <DotsThreeIcon size={22} weight="bold" />
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
              <PencilIcon size={18} weight="duotone" /> Renombrar
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
              <TrashIcon size={18} weight="duotone" /> Eliminar
            </span>
          </DropdownItem>
        </DropdownMenu>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2 ${
          isOver ? "bg-brand-50/50 rounded-lg" : ""
        }`}
      >
        <SortableContext
          items={visibleCards.map((c) => c.id)}
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
              autoFocus
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
               className="w-full resize-none rounded-lg border border-border-default bg-bg-card px-3 py-2 text-sm shadow-sm focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/20"
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
            className="flex w-full cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-surface-500 hover:bg-surface-200 hover:text-surface-700"
          >
            <PlusIcon size={20} weight="duotone" /> Añadir tarjeta
          </button>
        )}
      </div>
    </div>
  );
}
