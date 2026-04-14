import { useAuthStore } from '@/stores/authStore'
import { Avatar } from './Avatar'
import { DropdownMenu, DropdownItem } from './DropdownMenu'
import { Gear, SignOut, Kanban } from '@phosphor-icons/react'

interface HeaderProps {
  onNavigate: (view: 'boards' | 'board' | 'settings') => void
  currentView: 'boards' | 'board' | 'settings'
}

export function Header({ onNavigate, currentView }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuthStore()

  return (
    <header className="sticky top-0 z-30 border-b border-surface-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('boards')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Kanban size={30} weight="duotone" className="text-primary-600" />
            <span className="text-lg font-bold text-surface-900">Canvan</span>
          </button>
          {currentView === 'board' && (
            <button
              onClick={() => onNavigate('boards')}
              className="ml-2 rounded-md px-2 py-1 text-sm text-surface-500 hover:bg-surface-100 hover:text-surface-700 cursor-pointer"
            >
              Mis Tableros
            </button>
          )}
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-3">
            <DropdownMenu
              trigger={
                <button className="cursor-pointer">
                  <Avatar name={user?.name || 'U'} size="md" />
                </button>
              }
            >
              <div className="border-b border-surface-100 px-3 py-2">
                <p className="text-sm font-medium text-surface-900">{user?.name}</p>
                <p className="text-xs text-surface-500">{user?.email}</p>
              </div>
              <DropdownItem onClick={() => onNavigate('settings')}>
                <span className="flex items-center gap-2">
                  <Gear size={20} weight="duotone" /> Configuración
                </span>
              </DropdownItem>
              <DropdownItem onClick={logout} danger>
                <span className="flex items-center gap-2">
                  <SignOut size={20} weight="duotone" /> Cerrar sesión
                </span>
              </DropdownItem>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  )
}
