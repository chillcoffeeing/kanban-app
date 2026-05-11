import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { MemberAvatar } from "./MemberAvatar";
import { DropdownMenu, DropdownItem } from "./DropdownMenu";
import {
  GearIcon,
  SignOutIcon,
  KanbanIcon,
  EnvelopeIcon,
} from "@phosphor-icons/react";

export function Header() {
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
    <header className="sticky top-0 z-30 border-b border-primary/20 bg-primary backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/boards")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <KanbanIcon size={30} weight="duotone" className="text-white/90" />
            <span className="text-lg font-bold text-white">Kanban</span>
          </button>
          {currentView === "board" && (
            <button
              onClick={() => navigate("/boards")}
              className="ml-2 rounded-md px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
            >
              Mis Tableros
            </button>
          )}
          <button
            onClick={() => navigate("/invitations")}
            className="ml-2 flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
          >
            <EnvelopeIcon
              size={18}
              weight="duotone"
              className="text-white/70"
            />
            Invitaciones
          </button>
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
              <DropdownItem onClick={() => navigate("/config")}>
                <span className="flex items-center gap-2">
                  <GearIcon size={20} weight="duotone" /> Configuración
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
