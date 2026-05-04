import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, GearIcon, BellIcon, UserPlusIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/Button";
import { CardSearch } from "@/features/cards/components/CardSearch";
import { MemberAvatar } from "@/shared/components/MemberAvatar";
import type { Board } from "@/shared/types/domain";
import { getBoardBackgroundClasses } from "@/shared/utils/constants";

interface BoardHeaderProps {
  board: Board;
  isOwner: boolean;
  onInviteMember: (email: string) => void;
  onToggleActivity: () => void;
  onToggleInvite: () => void;
  showInvite: boolean;
}

export function BoardHeader({
  board,
  isOwner,
  onInviteMember,
  onToggleActivity,
  onToggleInvite,
  showInvite,
}: BoardHeaderProps) {
  const { gradientClass, textColorClass } = getBoardBackgroundClasses(board.background);

  const navigate = useNavigate();

  const handleInvite = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    if (email) onInviteMember(email);
  };

  return (
    <div className={`flex items-center justify-between px-4 py-3 ${gradientClass} ${textColorClass}`}>
      <h2 className="text-lg font-bold">{board.name}</h2>
      <div className="px-4">
        <div className="flex -space-x-1">
          {board.members.map((m) => (
             <MemberAvatar
               key={m.id}
               name={m.user?.name || "Usuario sin nombre"}
               avatar={m.user?.avatarUrl || undefined}
               userId={m.user?.id}
             />
           ))}
        </div>
      </div>
      <div className="grow"></div>
      <div className="flex items-center gap-2">
        <CardSearch boardId={board.id} onSelectCard={() => {}} />
        {isOwner && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80! hover:bg-white/20! hover:text-white!"
              onClick={onToggleInvite}
            >
              <UserPlusIcon size={20} weight="duotone" /> Invitar
            </Button>
            {showInvite && (
              <form
                onSubmit={handleInvite}
                className="flex items-center gap-1"
              >
                <input
                  name="email"
                  type="email"
                  placeholder="email@ejemplo.com"
                  className="w-40 rounded bg-white/90 px-2 py-1 text-sm text-surface-900"
                />
                <Button type="submit" size="sm">OK</Button>
              </form>
            )}
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-white/80! hover:bg-white/20! hover:text-white!"
          onClick={onToggleActivity}
        >
          <BellIcon size={20} weight="duotone" /> Actividad
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/80! hover:bg-white/20! hover:text-white!"
          onClick={() => navigate(`/boards/${board.id}/config/miembros`)}
        >
          <GearIcon size={20} weight="duotone" /> Configuración
        </Button>
      </div>
    </div>
  );
}
