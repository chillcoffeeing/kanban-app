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
      onClick={onClick}
      className={`group cursor-pointer overflow-hidden rounded-card border border-border-default bg-bg-card shadow-card transition-shadow hover:shadow-card-hover hover:bg-bg-card-hover ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {coverColor ? (
        <div className="h-2 w-full" style={{ backgroundColor: coverColor }} />
      ) : null}
      <div className="p-3">
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

        <p className="text-card-title text-fg-default">{card.title}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-card-meta text-fg-subtle">
          {prefs.showCompletedOnCard && isComplete && (
            <span className="flex items-center gap-1 rounded-badge bg-bg-success px-1.5 py-0.5 text-fg-success">
              <CheckCircleIcon size={16} weight="fill" /> Completado
            </span>
          )}
          {card.dueDate && (
            <span
              className={`flex items-center gap-1 rounded-badge px-1.5 py-0.5 ${
                isOverdue(card.dueDate)
                  ? "bg-bg-danger text-fg-danger"
                  : "bg-bg-muted"
              }`}
            >
              <CalendarBlankIcon size={16} weight="duotone" />
              {formatDate(card.dueDate)}
            </span>
          )}
          {totalChecks > 0 && (
            <span
              className={`flex items-center gap-1 rounded-badge px-1.5 py-0.5 ${
                isComplete ? "bg-bg-success text-fg-success" : "bg-bg-muted"
              }`}
            >
              <CheckCircleIcon size={16} weight="duotone" />
              {completedChecks}/{totalChecks}
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
