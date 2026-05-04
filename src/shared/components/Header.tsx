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
    <header className="sticky top-0 z-30 border-b border-surface-200 bg-primary-600 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/boards")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <KanbanIcon size={30} weight="duotone" className="text-white" />
            <span className="text-lg font-bold text-white">Canvan</span>
          </button>
          {currentView === "board" && (
            <button
              onClick={() => navigate("/boards")}
              className="ml-2 rounded-md px-2 py-1 text-sm text-white hover:bg-surface-100 hover:text-surface-700 cursor-pointer"
            >
              Mis Tableros
            </button>
          )}
          <button
            onClick={() => navigate("/invitations")}
            className="ml-2 flex items-center gap-1 rounded-md px-2 py-1 text-sm text-white hover:bg-surface-100 hover:text-surface-700 cursor-pointer"
          >
            <EnvelopeIcon size={18} weight="duotone" />
            Invitaciones
          </button>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-3">
            <DropdownMenu
              trigger={
                <button className="cursor-pointer">
                  <MemberAvatar
                    name={user?.name || "U"}
                    avatar={user?.profile.avatarUrl || undefined}
                  />
                </button>
              }
            >
              <div className="border-b border-surface-100 px-3 py-2">
                <p className="text-sm font-medium text-surface-900">
                  {user?.name}
                </p>
                <p className="text-xs text-surface-500">{user?.email}</p>
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
