import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarBlankIcon,
  CheckCircleIcon,
  ChatCircleIcon,
} from "@phosphor-icons/react";
import { isOverdue } from "@/shared/utils/helpers";
import { useFormatDate } from "@/shared/hooks/useFormatDate";
import { useBoardStore } from "@/stores/boardStore";
import { getBoardPreferences } from "@/features/boards/utils/boardPreferences";
import { useShallow } from "zustand/react/shallow";
import type { Card } from "@/shared/types/domain";
import { MemberAvatar } from "../../../shared/components/MemberAvatar";

interface CardItemProps {
  card: Card;
  stageId: string;
  boardId: string;
  onClick?: () => void;
}

export function CardItem({ card, stageId, boardId, onClick }: CardItemProps) {
  const board = useBoardStore(
    useShallow((s) => {
      const found = s.boards.find((b) => b.id === boardId);
      return found;
    }),
  );
  const prefs = getBoardPreferences(board);
  const formatDate = useFormatDate();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card, stageId, boardId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
  };

  const completedChecks = card.checklist?.filter((c) => c.done).length || 0;
  const totalChecks = card.checklist?.length || 0;
  const isComplete = totalChecks > 0 && completedChecks === totalChecks;

  const coverColor = prefs.coversEnabled ? card.labels?.[0]?.color : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group cursor-pointer overflow-hidden rounded-xl border border-neutral-light bg-surface shadow-sm transition-shadow hover:shadow-md hover:outline-2 hover:outline-primary/10 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {coverColor ? (
        <div className="h-2 w-full" style={{ backgroundColor: coverColor }} />
      ) : null}
      <div className="p-[var(--density-padding,0.75rem)]">
        {prefs.coversEnabled && card.labels?.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {card.labels.map((label) => (
              <span
                key={label.color}
                className="h-2 w-10 rounded-full"
                style={{ backgroundColor: label.color }}
                title={label.name}
              />
            ))}
          </div>
        )}

        <p className="text-card-title text-neutral-dark font-medium">
          {card.title}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-[var(--density-gap,0.5rem)] text-xs text-neutral-dark/60">
          {prefs.showCompletedOnCard && isComplete && (
            <span className="flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.5 text-xs text-success">
              <CheckCircleIcon size={16} weight="fill" /> Completado
            </span>
          )}
          {card.dueDate && (
            <span
              className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs ${
                isComplete
                  ? "bg-success/20 text-success"
                  : "bg-danger/20 text-danger"
              }`}
            >
              <CalendarBlankIcon size={16} weight="duotone" />
              {formatDate(card.dueDate)}
            </span>
          )}
          {totalChecks > 0 && (
            <span
              className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs ${
                isComplete
                  ? "bg-success/20 text-success"
                  : "bg-danger/20 text-danger"
              }`}
            >
              <CalendarBlankIcon size={16} weight="duotone" />
              {formatDate(card.dueDate)}
            </span>
          )}
          {card.description && (
            <span className="flex items-center gap-1">
              <ChatCircleIcon size={16} weight="duotone" />
            </span>
          )}
          {card.members && card.members.length > 0 && (
            <div className="flex -space-x-2">
              {card.members.map((member) => (
                <MemberAvatar
                  key={member.boardMembershipId}
                  name={member.boardMembership.user.name}
                  avatar={member.boardMembership.user.avatarUrl ?? undefined}
                  userId={member.boardMembership.user.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
