import { useState, useEffect } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { useBoardStore } from "@/stores/boardStore";
import { useAuthStore } from "@/stores/authStore";
import { useActivity } from "@/shared/hooks/useActivity";
import { ACTIVITY_TYPES } from "@/stores/activityStore";
import {
  UserPlusIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  CaretDownIcon,
  UserMinusIcon,
  CalendarBlankIcon,
  ChatCircleIcon,
} from "@phosphor-icons/react";
import { LabelEditor } from "./LabelEditor";
import type { Card, Label } from "@/shared/types/domain";
import { MemberAvatar } from "@/shared/components/MemberAvatar";
import { useScaleIn } from "@/shared/hooks/useGsapAnimation";

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
  const contentRef = useScaleIn<HTMLDivElement>({ duration: 0.4 });
  const {
    currentBoard,
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
  const user = useAuthStore((state) => state.user);
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
        <div className="min-h-55 flex items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-neutral-light border-t-primary"></div>
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
    const has = labels.some((existingLabel) => existingLabel.id === label.id);
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
      // Error handled silently
    }
  };

  const addCheckItem = async (e: React.FormEvent<HTMLFormElement>) => {
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
      // Error handled silently
    }
  };

  const toggleCheckItem = async (itemId: string) => {
    const item = checklist.find((item) => item.id === itemId);
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
      // Error handled silently
    }
  };

  const removeCheckItem = async (itemId: string) => {
    try {
      await deleteChecklistItem(boardId, activeStageId, activeCard.id, itemId);
    } catch (error) {
      // Error handled silently
    }
  };

  const joinCard = async () => {
    const userId = user?.id;
    const membership = currentBoard?.members.find(
      (boardMember) => boardMember?.user?.id === userId,
    );
    if (!userId || !membership) {
      throw new Error("Membership not found for current user");
    }
    try {
      await addCardMember(boardId, activeStageId, activeCard.id, membership.id);
      log(ACTIVITY_TYPES.MEMBER_JOINED_CARD, `se unió a la tarjeta "${title}"`);
    } catch (error) {
      // Error handled silently
    }
  };

  const leaveCard = async () => {
    const userId = user?.id;
    const membership = currentBoard?.members.find(
      (boardMember) => boardMember?.user?.id === userId,
    );
    if (!userId || !membership) {
      throw new Error("Membership not found for current user");
    }
    try {
      await removeCardMember(
        boardId,
        activeStageId,
        activeCard.id,
        membership.id,
      );
      log(ACTIVITY_TYPES.MEMBER_LEFT_CARD, `dejó la tarjeta "${title}"`);
    } catch (error) {
      // Error handled silently
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
      // Error handled silently
    }
  };

  const handleDelete = () => {
    log(ACTIVITY_TYPES.CARD_DELETED, `eliminó la tarjeta "${title}"`);
    deleteCard(boardId, activeStageId, activeCard.id);
    onClose();
  };

  const completedCount = checklist.filter((checkItem) => checkItem.done).length;
  const progress =
    checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div ref={contentRef} className="flex flex-col gap-6 lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="w-full text-xl font-bold text-neutral-dark focus:outline-none border-b-2 border-transparent focus:border-primary pb-2 transition-all"
          />

          {/* Labels */}
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => (
                <span
                  key={label.id}
                  className="rounded-full px-3 py-1 text-xs font-medium shadow-sm"
                  style={{ backgroundColor: label.color, color: "#fff" }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-neutral-dark/70 flex items-center gap-2">
              <ChatCircleIcon
                size={18}
                weight="duotone"
                className="text-primary/70"
              />
              Descripción
            </h4>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Añadir una descripción más detallada..."
              className="w-full resize-none rounded-xl border border-neutral-light bg-surface px-4 py-3 text-sm text-neutral-dark placeholder:text-neutral-dark/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              rows={5}
            />
          </div>

          {/* Checklist */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-neutral-dark/70 flex items-center gap-2">
              <CheckCircleIcon
                size={20}
                weight="duotone"
                className="text-primary/70"
              />
              Lista de tareas
            </h4>
            {checklist.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 flex justify-between text-xs text-neutral-dark/60">
                  <span className="font-medium">
                    {completedCount}/{checklist.length} completadas
                  </span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-light/70">
                  <div
                    className="h-full rounded-full bg-success transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-light/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleCheckItem(item.id)}
                    className="size-4 rounded border-neutral-light text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  />
                  <span
                    className={`flex-1 text-sm ${item.done ? "text-neutral-dark/50 line-through" : "text-neutral-dark"}`}
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={() => removeCheckItem(item.id)}
                    className="cursor-pointer opacity-0 group-hover:opacity-100 text-neutral-dark/50 hover:text-danger transition-all"
                  >
                    <TrashIcon size={18} weight="duotone" />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={addCheckItem} className="mt-3 flex gap-2">
              <input
                placeholder="Nuevo elemento..."
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                className="flex-1 rounded-lg border border-neutral-light bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <Button type="submit" size="sm" variant="secondary">
                <PlusIcon size={18} weight="duotone" />
              </Button>
            </form>
          </div>

          {/* Members */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-neutral-dark/70 flex items-center gap-2">
              <UserPlusIcon
                size={18}
                weight="duotone"
                className="text-primary/70"
              />
              Miembros de tarjeta
            </h4>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => (
                <div
                  key={member.boardMembershipId}
                  className="flex items-center gap-3 px-4 py-2 rounded-full bg-surface shadow-sm border border-neutral-light hover:shadow-md transition-all"
                >
                  <MemberAvatar
                    name={member.boardMembership.user.name}
                    avatar={member.boardMembership.user.avatarUrl ?? undefined}
                    userId={member.boardMembership.user.id}
                    stopPropagation={false}
                  />
                  <span className="text-sm font-medium text-neutral-dark">
                    {member.boardMembership.user.name}
                  </span>
                  {member.boardMembership.user.id === user?.id && (
                    <button
                      onClick={() => leaveCard()}
                      className="cursor-pointer text-neutral-dark/50 hover:text-danger transition-colors ml-1"
                      title="Dejar tarjeta"
                    >
                      <UserMinusIcon size={16} weight="bold" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="w-full space-y-4 lg:w-56">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-dark/50">
              Acciones
            </p>
            <div className="space-y-2">
              {members.find((member) => member.boardMembership.user.id === user?.id) ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  onClick={leaveCard}
                >
                  <UserMinusIcon size={18} weight="duotone" /> Dejar tarjeta
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  onClick={joinCard}
                >
                  <UserPlusIcon size={18} weight="duotone" /> Unirme a la
                  tarjeta
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowMemberDropdown(!showMemberDropdown)}
              >
                <UserPlusIcon size={18} weight="duotone" /> Asignar miembro
                <CaretDownIcon size={14} className="ml-auto" />
              </Button>
              {showMemberDropdown && (
                <div className="mt-2 rounded-xl border border-neutral-light bg-surface py-1 shadow-lg">
                  {currentBoard?.members
                    .filter((member) => member.user?.id !== user?.id)
                    .map((member) => {
                      const isMember = members.some(
                        (cardMember) => cardMember.boardMembershipId === member.id,
                      );
                      return (
                        <button
                          key={member.id}
                          onClick={() => {
                            if (!isMember) {
                              addCardMember(
                                boardId,
                                activeStageId,
                                activeCard.id,
                                member.id,
                              );
                            }
                            setShowMemberDropdown(false);
                          }}
                          disabled={isMember}
                          className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                            isMember
                              ? "text-neutral-dark/50 cursor-not-allowed"
                              : "text-neutral-dark hover:bg-neutral-light-hover"
                          }`}
                        >
                          <span className="font-medium">
                            {member.user?.name || member.email}
                          </span>
                          {isMember && (
                            <span className="ml-auto text-xs text-neutral-dark/50">
                              (asignado)
                            </span>
                          )}
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

          <div className="space-y-3 pt-4 border-t border-neutral-light">
            <div>
              <label className="mb-1.5 text-xs font-medium text-neutral-dark/70 flex items-center gap-2">
                <CalendarBlankIcon
                  size={16}
                  weight="duotone"
                  className="text-primary/70"
                />{" "}
                Fecha inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-light bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="mb-1.5 text-xs font-medium text-neutral-dark/70 flex items-center gap-2">
                <CalendarBlankIcon
                  size={16}
                  weight="duotone"
                  className="text-primary/70"
                />{" "}
                Fecha vencimiento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-light bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-light">
            <Button
              variant="danger"
              size="sm"
              className="w-full justify-center"
              onClick={handleDelete}
            >
              <TrashIcon size={18} weight="duotone" /> Eliminar tarjeta
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
