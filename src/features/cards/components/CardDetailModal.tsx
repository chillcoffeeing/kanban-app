import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { useBoardStore } from "@/stores/boardStore";
import { useAuthStore } from "@/stores/authStore";
import { useActivity } from "@/shared/hooks/useActivity";
import { ACTIVITY_TYPES } from "@/stores/activityStore";
import { generateId } from "@/shared/utils/helpers";
import {
  UserPlusIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  CaretDown,
} from "@phosphor-icons/react";
import { LabelEditor } from "./LabelEditor";
import type { Card, ChecklistItem, Label } from "@/shared/types/domain";
import { BackendCardMember } from "@/shared/types";

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card | null;
  stageId: string | null;
  boardId: string;
  isLoading?: boolean;
}

export function CardDetailModal({
  isOpen,
  onClose,
  card,
  stageId,
  boardId,
  isLoading = false,
}: CardDetailModalProps) {
  const {
    updateCard,
    deleteCard,
    addCardMember,
    removeCardMember,
    createLabel,
    attachLabel,
    detachLabel,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
  } = useBoardStore();
  const user = useAuthStore((s) => s.user);
  const currentBoard = useBoardStore((s) => s.currentBoard);
  const log = useActivity(boardId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [newCheckItem, setNewCheckItem] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  useEffect(() => {
    if (!card) return;
    setTitle(card.title || "");
    setDescription(card.description || "");
    setDueDate(card.dueDate || "");
    setStartDate(card.startDate || "");
  }, [card]);

  if (isLoading && !card) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Cargando tarjeta…"
        size="lg"
      >
        <div className="min-h-[220px] flex items-center justify-center text-surface-500">
          Cargando tarjeta…
        </div>
      </Modal>
    );
  }

  if (!isLoading && (!card || !stageId)) return null;

  const activeCard = card!;
  const activeStageId = stageId!;
  const labels = activeCard.labels ?? [];
  const checklist = activeCard.checklist ?? [];
  const members = activeCard.members ?? [];

  const save = (updates: Partial<Card>) => {
    updateCard(boardId, activeStageId, activeCard.id, updates);
  };

  const handleTitleBlur = () => {
    if (title !== activeCard.title) {
      save({ title });
      log(
        ACTIVITY_TYPES.CARD_UPDATED,
        `renombró la tarjeta "${activeCard.title}" a "${title}"`,
      );
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== activeCard.description) {
      save({ description });
      log(
        ACTIVITY_TYPES.CARD_UPDATED,
        `actualizó la descripción de "${title}"`,
      );
    }
  };

  const toggleLabel = async (label: Label) => {
    const has = labels.some((l) => l.id === label.id);

    try {
      if (has) {
        await detachLabel(boardId, activeStageId, activeCard.id, label.id);
        log(
          ACTIVITY_TYPES.CARD_LABEL_REMOVED,
          `quitó la etiqueta "${label.name}" de "${title}"`,
        );
      } else {
        await attachLabel(boardId, activeStageId, activeCard.id, label.id);
        log(
          ACTIVITY_TYPES.CARD_LABEL_ADDED,
          `añadió la etiqueta "${label.name}" a "${title}"`,
        );
      }
    } catch (error) {
      console.error("Error updating card label:", error);
    }
  };

  const addCheckItem = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;
    const text = newCheckItem.trim();

    try {
      await addChecklistItem(boardId, activeStageId, activeCard.id, text);
      log(
        ACTIVITY_TYPES.CARD_CHECKLIST_ADDED,
        `añadió "${text}" al checklist de "${title}"`,
      );
      setNewCheckItem("");
    } catch (error) {
      console.error("Error adding checklist item:", error);
    }
  };

  const toggleCheckItem = async (itemId: string) => {
    const item = checklist.find((i) => i.id === itemId);
    if (!item) return;

    try {
      await updateChecklistItem(boardId, activeStageId, activeCard.id, itemId, {
        done: !item.done,
      });
      log(
        ACTIVITY_TYPES.CARD_CHECKLIST_TOGGLED,
        `${!item.done ? "completó" : "desmarcó"} "${item.text}" en "${title}"`,
      );
    } catch (error) {
      console.error("Error toggling checklist item:", error);
    }
  };

  const removeCheckItem = async (itemId: string) => {
    try {
      await deleteChecklistItem(boardId, activeStageId, activeCard.id, itemId);
    } catch (error) {
      console.error("Error removing checklist item:", error);
    }
  };

  const joinCard = async () => {
    const userId = user?.id;
    if (!userId || members.some((m) => m.userId === userId)) return;

    try {
      await addCardMember(boardId, activeStageId, activeCard.id, userId);
      log(ACTIVITY_TYPES.MEMBER_JOINED_CARD, `se unió a la tarjeta "${title}"`);
    } catch (error) {
      console.error("Error joining card:", error);
    }
  };

  const leaveCard = async () => {
    const userId = user?.id;
    if (!userId || !members.some((m) => m.userId === userId)) return;

    try {
      await removeCardMember(boardId, activeStageId, activeCard.id, userId);
      log(ACTIVITY_TYPES.MEMBER_LEFT_CARD, `salió de la tarjeta "${title}"`);
    } catch (error) {
      console.error("Error leaving card:", error);
    }
  };

  const handleStartDate = (value: string) => {
    setStartDate(value);
    save({ startDate: value });
    if (value) {
      log(
        ACTIVITY_TYPES.CARD_DATE_SET,
        `estableció fecha inicio ${value} en "${title}"`,
      );
    }
  };

  const handleDueDate = (value: string) => {
    setDueDate(value);
    save({ dueDate: value });
    if (value) {
      log(
        ACTIVITY_TYPES.CARD_DATE_SET,
        `estableció fecha vencimiento ${value} en "${title}"`,
      );
    }
  };

  const handleCreateLabel = async (name: string, color: string) => {
    try {
      const label = await createLabel(boardId, name, color);
      await attachLabel(boardId, activeStageId, activeCard.id, label.id);
      log(
        ACTIVITY_TYPES.CARD_LABEL_ADDED,
        `añadió la etiqueta "${label.name}" a "${title}"`,
      );
    } catch (error) {
      console.error("Error creating label:", error);
    }
  };

  const handleDelete = () => {
    log(ACTIVITY_TYPES.CARD_DELETED, `eliminó la tarjeta "${title}"`);
    deleteCard(boardId, activeStageId, activeCard.id);
    onClose();
  };

  const completedCount = checklist.filter((c) => c.done).length;
  const progress =
    checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-5">
          {/* Título */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="w-full text-lg font-semibold text-surface-900 focus:outline-none border-b border-transparent focus:border-primary-500 pb-1"
          />

          {/* Labels */}
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {labels.map((l) => (
                <span
                  key={l.id}
                  className="rounded-md px-2.5 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: l.color }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          )}

          {/* Descripción */}
          <div>
            <h4 className="mb-1 text-sm font-medium text-surface-700">
              Descripción
            </h4>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Añadir una descripción más detallada..."
              className="w-full resize-none rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-700 placeholder:text-surface-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              rows={3}
            />
          </div>

          {/* Checklist */}
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-surface-700">
              <CheckCircleIcon size={20} weight="duotone" /> Lista de tareas
            </h4>
            {checklist.length > 0 && (
              <div className="mb-3">
                <div className="mb-1 flex justify-between text-xs text-surface-400">
                  <span>
                    {completedCount}/{checklist.length}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-200">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            <div className="space-y-1">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-2 rounded-md px-2 py-1 hover:bg-surface-50"
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleCheckItem(item.id)}
                    className="h-4 w-4 rounded border-surface-300 cursor-pointer"
                  />
                  <span
                    className={`flex-1 text-sm ${item.done ? "text-surface-400 line-through" : "text-surface-700"}`}
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={() => removeCheckItem(item.id)}
                    className="cursor-pointer opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-500"
                  >
                    <TrashIcon size={18} weight="duotone" />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={addCheckItem} className="mt-2 flex gap-2">
              <input
                placeholder="Nuevo elemento..."
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                className="flex-1 rounded-md border border-surface-200 px-2.5 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
              />
              <Button type="submit" size="sm" variant="secondary">
                <PlusIcon size={18} weight="duotone" />
              </Button>
            </form>
          </div>

          {/* Miembros */}
          {members.length > 0 && (
            <div>
              <h4 className="mb-1 text-sm font-medium text-surface-700">
                Miembros
              </h4>
              <div className="flex flex-wrap gap-2">
                {members.map((member) => (
                  <span
                    key={member.userId}
                    className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
                  >
                    {member.user.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar acciones */}
        <div className="w-full space-y-2 lg:w-48">
          <p className="text-xs font-semibold uppercase text-surface-400">
            Acciones
          </p>
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-start"
              onClick={joinCard}
            >
              <UserPlusIcon size={20} weight="duotone" /> Unirme
            </Button>
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start mt-1"
                onClick={() => setShowMemberDropdown(!showMemberDropdown)}
              >
                <UserPlusIcon size={20} weight="duotone" /> Asignar
                <CaretDown size={16} className="ml-auto" />
              </Button>
              {showMemberDropdown && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-md border border-surface-200 bg-white py-1 shadow-lg">
                    {currentBoard?.members
                      .filter((m) => m.userId !== user?.id)
                      .map((member) => {
                      const isMember = members.some((m) => m.userId === member.userId);
                      return (
                        <button
                          key={member.userId}
                          onClick={() => {
                            if (!isMember) {
                              addCardMember(boardId, activeStageId, activeCard.id, member.userId);
                            }
                            setShowMemberDropdown(false);
                          }}
                          disabled={isMember}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-50 ${
                            isMember ? "text-surface-300 cursor-not-allowed" : "text-surface-700"
                          }`}
                        >
                          <span>{member.user?.name || member.email}</span>
                          {isMember && <span className="text-xs">(asignado)</span>}
                        </button>
                      );
                    })}
                  </div>
              )}
            </div>
          </div>

          <LabelEditor
            labels={labels}
            onToggle={toggleLabel}
            onCreate={handleCreateLabel}
          />

          <div className="space-y-2 pt-2">
            <div>
              <label className="text-xs font-medium text-surface-500">
                Fecha inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDate(e.target.value)}
                className="w-full rounded-md border border-surface-200 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-500">
                Fecha vencimiento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDate(e.target.value)}
                className="w-full rounded-md border border-surface-200 px-2 py-1 text-sm"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-surface-200">
            <Button
              variant="danger"
              size="sm"
              className="w-full"
              onClick={handleDelete}
            >
              <TrashIcon size={20} weight="duotone" /> Eliminar tarjeta
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
