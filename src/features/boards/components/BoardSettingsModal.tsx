import { useState, useEffect } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Toggle } from '@/shared/components/Toggle'
import { PERMISSIONS } from '@/shared/utils/constants'
import { useBoardStore } from '@/stores/boardStore'
import { useActivity } from '@/shared/hooks/useActivity'
import { ACTIVITY_TYPES } from '@/stores/activityStore'
import {
  Trash,
  UserPlus,
  GearSix,
  Users,
  SlidersHorizontal,
  Globe,
  Lock,
  ChatCircle,
  CheckSquare,
  Image as ImageIcon,
  User,
  Clock,
} from '@phosphor-icons/react'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import { getBoardPreferences, canManageMembers } from '../utils/boardPreferences'
import { useAuthStore } from '@/stores/authStore'
import type { Board, BoardMember, BoardPreferences, Permission } from '@/shared/types/domain'
import { api } from '@/services/api'

const PERMISSION_LABELS: Record<Permission, string> = {
  [PERMISSIONS.CREATE_STAGE]: 'Crear etapas',
  [PERMISSIONS.CREATE_CARD]: 'Crear tarjetas',
  [PERMISSIONS.MODIFY_CARD]: 'Modificar tarjetas',
  [PERMISSIONS.DELETE_CARD]: 'Eliminar tarjetas',
  [PERMISSIONS.INVITE_MEMBER]: 'Invitar miembros',
}

type TabId = 'general' | 'members' | 'preferences'

const TABS: Array<{ id: TabId; label: string; Icon: PhosphorIcon }> = [
  { id: 'general', label: 'General', Icon: GearSix },
  { id: 'members', label: 'Miembros', Icon: Users },
  { id: 'preferences', label: 'Preferencias', Icon: SlidersHorizontal },
]

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
}

function Select({ value, onChange, options }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="cursor-pointer rounded-md border border-surface-200 bg-[var(--surface-card)] px-2 py-1 text-sm text-surface-700 focus:border-primary-500 focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

interface PrefRowProps {
  icon?: PhosphorIcon
  title: string
  description?: string
  children: ReactNode
}

function PrefRow({ icon: Icon, title, description, children }: PrefRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-surface-100 py-3 last:border-b-0">
      <div className="flex items-start gap-2">
        {Icon && <Icon size={22} weight="duotone" className="mt-0.5 text-surface-500" />}
        <div>
          <p className="text-sm font-medium text-surface-900">{title}</p>
          {description && (
            <p className="mt-0.5 text-xs text-surface-500">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

interface BoardSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  board: Board | null
}

interface PendingInvitation {
  id: string
  email: string
  role: string
  createdAt: string
  expiresAt: string
}

export function BoardSettingsModal({ isOpen, onClose, board }: BoardSettingsModalProps) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [tab, setTab] = useState<TabId>('general')
  const [pendingInvites, setPendingInvites] = useState<PendingInvitation[]>([])
  const {
    updateBoard,
    addMember,
    removeMember,
    updateMemberPermissions,
    deleteBoard,
  } = useBoardStore()
  const [boardName, setBoardName] = useState(board?.name || '')
  const log = useActivity(board?.id)
  const currentUser = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!board?.id) return
    api<PendingInvitation[]>(`/boards/${board.id}/invitations`)
      .then(setPendingInvites)
      .catch(() => setPendingInvites([]))
  }, [board?.id])

  if (!board) return null

  const prefs = getBoardPreferences(board)
  const canManage = canManageMembers(board, currentUser?.id)

  const updatePref = <K extends keyof BoardPreferences>(
    key: K,
    value: BoardPreferences[K]
  ) => {
    updateBoard(board.id, {
      preferences: { ...prefs, [key]: value },
    })
  }

  const handleSaveName = () => {
    if (boardName.trim() && boardName.trim() !== board.name) {
      const oldName = board.name
      updateBoard(board.id, { name: boardName.trim() })
      log(
        ACTIVITY_TYPES.BOARD_RENAMED,
        `renombró el tablero "${oldName}" a "${boardName.trim()}"`
      )
    }
  }

  const handleInvite = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    const email = inviteEmail.trim()
    addMember(board.id, email)
    log(ACTIVITY_TYPES.MEMBER_INVITED, `invitó a "${email}" al tablero`)
    setInviteEmail('')
  }

  const handleRemoveMember = (member: BoardMember) => {
    removeMember(board.id, member.userId)
    log(
      ACTIVITY_TYPES.MEMBER_REMOVED,
      `eliminó a "${member.email}" del tablero`
    )
  }

  const togglePermission = (userId: string, permission: Permission) => {
    const member = board.members.find((m) => m.userId === userId)
    if (!member) return
    const has = member.permissions.includes(permission)
    const perms = has
      ? member.permissions.filter((p) => p !== permission)
      : [...member.permissions, permission]
    updateMemberPermissions(board.id, userId, perms)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración del tablero"
      size="lg"
    >
      <div className="flex gap-4">
        <div className="flex flex-col gap-1 border-r border-surface-200 pr-4">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm ${
                tab === id
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-surface-600 hover:bg-surface-50'
              }`}
            >
              <Icon size={20} weight="duotone" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1">
          {tab === 'general' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-end gap-2">
                <Input
                  label="Nombre del tablero"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveName} size="md">
                  Guardar
                </Button>
              </div>
              <div className="pt-4 border-t border-surface-200">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (
                      confirm(
                        '¿Eliminar este tablero? Esta acción no se puede deshacer.'
                      )
                    ) {
                      deleteBoard(board.id)
                      onClose()
                    }
                  }}
                >
                  <Trash size={20} weight="duotone" /> Eliminar tablero
                </Button>
              </div>
            </div>
          )}

          {tab === 'members' && (
            <div className="flex flex-col gap-4">
              {canManage ? (
                <form onSubmit={handleInvite} className="flex items-end gap-2">
                  <Input
                    label="Invitar por email"
                    placeholder="email@ejemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="md">
                    <UserPlus size={20} weight="duotone" /> Invitar
                  </Button>
                </form>
              ) : (
                <p className="rounded-card border border-border-default bg-bg-muted p-3 text-card-meta text-fg-muted">
                  Solo los administradores pueden gestionar miembros en este tablero (preferencia <strong>Añadir y eliminar miembros</strong> = Solo administradores).
                </p>
              )}

              <div className="flex flex-col gap-3">
                {board.members.map((member) => (
                  <div
                    key={member.userId}
                    className="rounded-lg border border-surface-200 p-3"
                  >
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         {member.user?.avatarUrl ? (
                           <img
                             src={member.user.avatarUrl}
                             alt={member.user.name}
                             className="h-10 w-10 rounded-full object-cover"
                           />
                         ) : (
                           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-200">
                             <User size={20} className="text-surface-500" />
                           </div>
                         )}
                         <div>
                           <div className="flex items-center gap-2">
                             <span className="text-sm font-medium text-surface-900">
                               {member.user?.name || member.email || 'Propietario'}
                             </span>
                             <span className="rounded bg-surface-100 px-1.5 py-0.5 text-xs text-surface-500">
                               {member.role}
                             </span>
                           </div>
                           {member.user?.createdAt && (
                             <p className="text-xs text-surface-500">
                               Miembro desde {new Date(member.user.createdAt).toLocaleDateString()}
                             </p>
                           )}
                           {member.invitedAt && (
                             <p className="text-xs text-surface-500">
                               Invitado: {new Date(member.invitedAt).toLocaleDateString()}
                             </p>
                           )}
                         </div>
                       </div>
                      {member.role !== 'owner' && canManage && (
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="cursor-pointer text-red-500 hover:text-red-600"
                        >
                          <Trash size={20} weight="duotone" />
                        </button>
                      )}
                    </div>
                    {member.role !== 'owner' && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(Object.entries(PERMISSION_LABELS) as Array<[Permission, string]>).map(
                          ([perm, label]) => (
                            <label
                              key={perm}
                              className="flex items-center gap-1 text-xs text-surface-600 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={member.permissions.includes(perm)}
                                onChange={() =>
                                  togglePermission(member.userId, perm)
                                }
                                className="rounded"
                              />
                              {label}
                            </label>
                          )
                        )}
                      </div>
                    )}
                  </div>
                  ))}
                </div>

                {pendingInvites.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-surface-200">
                    <h4 className="mb-3 text-sm font-semibold text-surface-700 flex items-center gap-2">
                      <Clock size={18} weight="duotone" />
                      Invitaciones pendientes
                    </h4>
                    <div className="flex flex-col gap-3">
                      {pendingInvites.map((inv) => (
                        <div
                          key={inv.id}
                          className="rounded-lg border border-surface-200 p-3 opacity-75"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-100">
                              <User size={20} className="text-surface-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-surface-900">
                                  {inv.email}
                                </span>
                                <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                                  Pendiente
                                </span>
                                <span className="rounded bg-surface-100 px-1.5 py-0.5 text-xs text-surface-500">
                                  {inv.role}
                                </span>
                              </div>
                              <p className="text-xs text-surface-500">
                                Invitado: {new Date(inv.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
 
           {tab === 'preferences' && (
            <div className="flex flex-col">
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-surface-500">
                Espacio de trabajo
              </h4>
              <PrefRow
                icon={prefs.visibility === 'private' ? Lock : Globe}
                title="Visibilidad"
                description={
                  prefs.visibility === 'private'
                    ? 'Solo los miembros invitados pueden ver este tablero.'
                    : 'Todos los miembros del espacio de trabajo pueden verlo.'
                }
              >
                <Select
                  value={prefs.visibility}
                  onChange={(v) => updatePref('visibility', v as BoardPreferences['visibility'])}
                  options={[
                    { value: 'workspace', label: 'Espacio de trabajo' },
                    { value: 'private', label: 'Privado' },
                  ]}
                />
              </PrefRow>

              <h4 className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-surface-500">
                Permisos
              </h4>
              <PrefRow
                icon={ChatCircle}
                title="Comentarios"
                description="Quién puede comentar en las tarjetas."
              >
                <Select
                  value={prefs.commentPermission}
                  onChange={(v) => updatePref('commentPermission', v as BoardPreferences['commentPermission'])}
                  options={[
                    { value: 'members', label: 'Miembros' },
                    { value: 'workspace', label: 'Espacio de trabajo' },
                    { value: 'disabled', label: 'Deshabilitado' },
                  ]}
                />
              </PrefRow>
              <PrefRow
                icon={UserPlus}
                title="Añadir y eliminar miembros"
                description="Quién puede gestionar a los miembros del tablero."
              >
                <Select
                  value={prefs.memberPermission}
                  onChange={(v) => updatePref('memberPermission', v as BoardPreferences['memberPermission'])}
                  options={[
                    { value: 'members', label: 'Miembros' },
                    { value: 'admins', label: 'Solo administradores' },
                  ]}
                />
              </PrefRow>
              <PrefRow
                icon={Users}
                title="Editar el Espacio de trabajo"
                description="Cualquier miembro puede editar y unirse. Deshabilita para tableros privados."
              >
                <Toggle
                  checked={prefs.workspaceEdit}
                  onChange={(v) => updatePref('workspaceEdit', v)}
                />
              </PrefRow>

              <h4 className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-surface-500">
                Estado completado
              </h4>
              <PrefRow
                icon={CheckSquare}
                title="Mostrar el estado completado en la tarjeta"
                description="Marca un indicador verde en tarjetas cuya checklist está completa."
              >
                <Toggle
                  checked={prefs.showCompletedOnCard}
                  onChange={(v) => updatePref('showCompletedOnCard', v)}
                />
              </PrefRow>

              <h4 className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-surface-500">
                Portadas
              </h4>
              <PrefRow
                icon={ImageIcon}
                title="Portadas de la tarjeta habilitadas"
                description="Muestra adjuntos de imagen y colores en la parte delantera de las tarjetas."
              >
                <Toggle
                  checked={prefs.coversEnabled}
                  onChange={(v) => updatePref('coversEnabled', v)}
                />
              </PrefRow>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
