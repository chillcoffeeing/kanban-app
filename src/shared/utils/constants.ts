import type { Permission } from '@/shared/types/domain'

export const LABEL_COLORS: Array<{ name: string; value: string }> = [
  { name: 'Rojo', value: '#ef4444' },
  { name: 'Naranja', value: '#f97316' },
  { name: 'Amarillo', value: '#eab308' },
  { name: 'Verde', value: '#22c55e' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Morado', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
]

export const PERMISSIONS = {
  CREATE_STAGE: 'create_stage',
  CREATE_CARD: 'create_card',
  MODIFY_CARD: 'modify_card',
  DELETE_CARD: 'delete_card',
  INVITE_MEMBER: 'invite_member',
} as const satisfies Record<string, Permission>

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS)

export const DEFAULT_BOARD_BACKGROUNDS: string[] = [
  'bg-gradient-to-br from-blue-500 to-purple-600',
  'bg-gradient-to-br from-green-400 to-cyan-500',
  'bg-gradient-to-br from-pink-500 to-rose-500',
  'bg-gradient-to-br from-amber-400 to-orange-500',
  'bg-gradient-to-br from-indigo-500 to-blue-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
]
