import { useBoardStore } from "@/stores/boardStore";
import { useMemo } from "react";

export function MemberAvatar({
  name,
  avatar,
  userId,
  onClick,
  stopPropagation = true,
}: {
  name: string;
  avatar?: string;
  userId?: string;
  onClick?: () => void;
  stopPropagation?: boolean;
}) {
  const setSelectedUserId = useBoardStore((boardState) => boardState.setSelectedUserId);

  const handleProfileClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
    if (onClick) {
      onClick();
    } else if (userId) {
      setSelectedUserId(userId);
    }
  };

  const color = useMemo(() => {
    if (avatar) return "transparent";

    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }, [avatar]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (stopPropagation) {
        e.stopPropagation();
      }
      if (onClick) {
        onClick();
      } else if (userId) {
        setSelectedUserId(userId);
      }
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className="size-8 rounded-full text-primary-fg flex items-center justify-center ring-2 ring-neutral-light cursor-pointer hover:ring-2 hover:ring-primary transition-all"
      style={{ backgroundColor: color }}
      title={name}
      onClick={handleProfileClick}
      onKeyDown={handleKeyDown}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span className="text-xs font-semibold">{name[0]?.toUpperCase()}</span>
      )}
    </div>
  );
}
