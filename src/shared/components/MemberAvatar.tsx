import { useBoardStore } from "@/stores/boardStore";
import { useMemo } from "react";

export function MemberAvatar({
  name,
  avatar,
  userId,
  onClick,
}: {
  name: string;
  avatar?: string;
  userId?: string;
  onClick?: () => void;
}) {
  const setSelectedUserId = useBoardStore((s) => s.setSelectedUserId);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
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

  return (
    <div
      className="h-8 w-8 rounded-full text-fg-on-brand flex items-center justify-center ring ring-bg-card cursor-pointer hover:ring-2 hover:ring-brand-500 transition-all"
      style={{ backgroundColor: color }}
      title={name}
      onClick={handleClick}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        name[0]?.toUpperCase()
      )}
    </div>
  );
}
