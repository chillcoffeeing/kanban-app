import { Link, useNavigate, useParams, Outlet, useLocation } from "react-router-dom";
import {
  GearSix,
  Users,
  SlidersHorizontal,
  ArrowLeft,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";

interface BoardConfigLayoutProps {
  boardId: string;
}

export function BoardConfigLayout({ boardId: boardIdProp }: BoardConfigLayoutProps) {
  const paramsBoardId = useParams<{ boardId: string }>().boardId;
  const location = useLocation();
  const navigate = useNavigate();
  const boardId = boardIdProp || paramsBoardId || "";
  
  const basePath = `/boards/${boardId}/config`;
  const TABS: Array<{ path: string; label: string; Icon: PhosphorIcon }> = [
    { path: `${basePath}/general`, label: "General", Icon: GearSix },
    { path: `${basePath}/miembros`, label: "Miembros", Icon: Users },
    { path: `${basePath}/preferencias`, label: "Preferencias", Icon: SlidersHorizontal },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(`/boards/${boardId}`)}
          className="flex items-center gap-1 text-surface-600 hover:text-surface-900"
        >
          <ArrowLeft size={20} weight="duotone" />
          <span>Volver al tablero</span>
        </button>
      </div>
      <h1 className="text-2xl font-bold text-surface-900">
        Configuración del tablero
      </h1>
      <p className="mt-1 mb-6 text-sm text-surface-600">
        Ajustes y miembros del tablero.
      </p>

      <div className="flex gap-6">
<nav className="flex w-48 shrink-0 flex-col gap-1 border-r border-surface-200 pr-4">
          {TABS.map(({ path, label, Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive(path)
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-surface-600 hover:bg-surface-50"
              }`}
            >
              <Icon size={20} weight="duotone" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}