import { useBoardStore } from "@/stores/boardStore";
import { useMemo } from "react";

const AVATAR_PALETTE = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#06b6d4",
  "#3b82f6", "#2563eb", "#7c3aed", "#db2777",
];

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function MemberAvatar({
  name,
  avatar,
  userId,
  onClick,
  stopPropagation = true,
  size = "md",
}: {
  name: string;
  avatar?: string;
  userId?: string;
  onClick?: () => void;
  stopPropagation?: boolean;
  size?: "sm" | "md" | "lg";
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

    const seed = userId ?? name;
    return AVATAR_PALETTE[hashSeed(seed) % AVATAR_PALETTE.length];
  }, [avatar, userId, name]);

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
      className={`${
        size === "sm" ? "size-6 text-xs" : size === "lg" ? "size-10" : "size-8"
      } rounded-full text-primary-fg flex items-center justify-center ring-2 ring-neutral-light cursor-pointer hover:ring-2 hover:ring-primary transition-all`}
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
