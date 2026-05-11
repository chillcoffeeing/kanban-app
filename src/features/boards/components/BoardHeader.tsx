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
      <h2 className="text-lg font-bold flex items-center gap-2">
        {board.name}
        <span className="text-xs font-normal opacity-60">{board.members.length} miembros</span>
      </h2>
      <div className="px-4">
        <div className="flex -space-x-2">
          {board.members.slice(0, 5).map((m) => (
             <MemberAvatar
               key={m.id}
               name={m.user?.name || "Usuario sin nombre"}
               avatar={m.user?.avatarUrl || undefined}
               userId={m.user?.id}
               stopPropagation={false}
             />
           ))}
          {board.members.length > 5 && (
            <div className="size-8 rounded-full bg-white/20 flex items-center justify-center text-xs text-white font-medium">
              +{board.members.length - 5}
            </div>
          )}
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
              className="text-white/80! hover:bg-white/20! hover:text-white! transition-colors"
              onClick={onToggleInvite}
            >
              <UserPlusIcon size={18} weight="duotone" /> Invitar
            </Button>
            {showInvite && (
              <form
                onSubmit={handleInvite}
                className="flex items-center gap-2"
              >
                <input
                  name="email"
                  type="email"
                  placeholder="email@ejemplo.com"
                  className="w-40 rounded-lg bg-white/90 px-3 py-1.5 text-sm text-neutral-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                />
                <Button type="submit" size="sm" className="bg-white/10! text-white! hover:bg-white/20!">OK</Button>
              </form>
            )}
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-white/80! hover:bg-white/20! hover:text-white! transition-colors"
          onClick={onToggleActivity}
        >
          <BellIcon size={18} weight="duotone" /> Actividad
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/80! hover:bg-white/20! hover:text-white! transition-colors"
          onClick={() => navigate(`/boards/${board.id}/config/miembros`)}
        >
          <GearIcon size={18} weight="duotone" /> Configuración
        </Button>
      </div>
    </div>
  );
}
