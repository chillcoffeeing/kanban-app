import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { MemberAvatar } from "./MemberAvatar";
import { DropdownMenu, DropdownItem } from "./DropdownMenu";
import {
  SignOutIcon,
  KanbanIcon,
  EnvelopeIcon,
  UserIcon,
  BellIcon,
  PaintBucketIcon,
} from "@phosphor-icons/react";
import { useMountFade } from "@/shared/hooks/useGsapAnimation";

export function Header() {
  const headerRef = useMountFade<HTMLDivElement>({ direction: "down", distance: -20 });
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const currentView = location.pathname.startsWith("/config")
    ? "settings"
    : location.pathname.startsWith("/boards/") ||
        location.pathname.startsWith("/board/")
      ? "board"
      : "boards";

  return (
    <header ref={headerRef} className="sticky top-0 z-30 border-b border-neutral-light bg-surface">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/boards")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <KanbanIcon size={30} weight="duotone" className="text-primary" />
            <span className="text-lg font-bold text-neutral-dark">Kanban</span>
          </button>
          {currentView === "board" && (
            <button
              onClick={() => navigate("/boards")}
              className="ml-2 rounded-md px-3 py-1.5 text-sm text-neutral-dark/70 hover:bg-neutral-light-hover hover:text-neutral-dark cursor-pointer transition-colors"
            >
              Mis Tableros
            </button>
          )}
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-3">
            <DropdownMenu
              trigger={
                <button className="cursor-pointer hover:opacity-80 transition-opacity">
                  <MemberAvatar
                    name={user?.name || "U"}
                    avatar={user?.avatarUrl || undefined}
                    onClick={() => {}}
                    stopPropagation={false}
                  />
                </button>
              }
            >
              <div className="border-b border-neutral-light px-3 py-2">
                <p className="text-sm font-medium text-neutral-dark">
                  {user?.name}
                </p>
                <p className="text-xs text-neutral-dark/70">{user?.email}</p>
              </div>
              <DropdownItem onClick={() => navigate("/config/perfil")}>
                <span className="flex items-center gap-2">
                  <UserIcon size={20} weight="duotone" /> Perfil
                </span>
              </DropdownItem>
              <DropdownItem onClick={() => navigate("/config/apariencia")}>
                <span className="flex items-center gap-2">
                  <PaintBucketIcon size={20} weight="duotone" /> Tema
                </span>
              </DropdownItem>
              <DropdownItem onClick={() => navigate("/config/notificaciones")}>
                <span className="flex items-center gap-2">
                  <BellIcon size={20} weight="duotone" /> Notificaciones
                </span>
              </DropdownItem>
              <DropdownItem onClick={() => navigate("/invitations")}>
                <span className="flex items-center gap-2">
                  <EnvelopeIcon size={20} weight="duotone" /> Invitaciones
                </span>
              </DropdownItem>
              <DropdownItem onClick={logout} danger>
                <span className="flex items-center gap-2">
                  <SignOutIcon size={20} weight="duotone" /> Cerrar sesión
                </span>
              </DropdownItem>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
