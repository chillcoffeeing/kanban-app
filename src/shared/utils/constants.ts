import type { Permission } from '@/shared/types/domain'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import {
  SunIcon, MoonIcon, MoonStarsIcon, PaletteIcon,
  LightningIcon, UsersThreeIcon, ChartLineUpIcon,
} from '@phosphor-icons/react'

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

export const PERMISSION_LABELS: Record<Permission, string> = {
  [PERMISSIONS.CREATE_STAGE]: "Crear etapas",
  [PERMISSIONS.CREATE_CARD]: "Crear tarjetas",
  [PERMISSIONS.MODIFY_CARD]: "Modificar tarjetas",
  [PERMISSIONS.DELETE_CARD]: "Eliminar tarjetas",
  [PERMISSIONS.INVITE_MEMBER]: "Invitar miembros",
}

export const ROLE_LABELS: Record<string, string> = {
  owner: 'Propietario',
  member: 'Miembro',
}

export const PUBLIC_THEME_KEY = "kanban-public-theme";

export const THEME_OPTIONS: Array<{ id: string; label: string; Icon: PhosphorIcon }> = [
  { id: "light", label: "Claro", Icon: SunIcon },
  { id: "dark", label: "Oscuro", Icon: MoonIcon },
  { id: "midnight", label: "Medianoche", Icon: MoonStarsIcon },
  { id: "solarized", label: "Solarized", Icon: PaletteIcon },
]

export const LANDING_FEATURES: Array<{ icon: PhosphorIcon; title: string; desc: string }> = [
  {
    icon: LightningIcon,
    title: "Flujos de trabajo ágiles",
    desc: "Organiza tareas y proyectos con tableros diseñados para equipos de alto rendimiento.",
  },
  {
    icon: UsersThreeIcon,
    title: "Colaboración en tiempo real",
    desc: "Sincroniza a todo tu equipo con actualizaciones instantáneas y permisos granulares.",
  },
  {
    icon: ChartLineUpIcon,
    title: "Visibilidad ejecutiva",
    desc: "Métricas y reportes claros para tomar decisiones basadas en datos.",
  },
]
export const BOARD_BACKGROUNDS = [
  { id: 'blue-purple', gradientClass: 'bg-gradient-to-br from-blue-500 to-purple-600', textColorClass: 'text-white' },
  { id: 'green-cyan', gradientClass: 'bg-gradient-to-br from-green-400 to-cyan-500', textColorClass: 'text-white' },
  { id: 'pink-rose', gradientClass: 'bg-gradient-to-br from-pink-500 to-rose-500', textColorClass: 'text-white' },
  { id: 'amber-orange', gradientClass: 'bg-gradient-to-br from-amber-400 to-orange-500', textColorClass: 'text-white' },
  { id: 'indigo-blue', gradientClass: 'bg-gradient-to-br from-indigo-500 to-blue-600', textColorClass: 'text-white' },
  { id: 'emerald-teal', gradientClass: 'bg-gradient-to-br from-emerald-500 to-teal-600', textColorClass: 'text-white' },
  { id: 'slate', gradientClass: 'bg-slate-700', textColorClass: 'text-white' },
  { id: 'zinc', gradientClass: 'bg-zinc-600', textColorClass: 'text-white' }
]

export const DEFAULT_BACKGROUND_ID = BOARD_BACKGROUNDS[0].id

export function getBoardBackgroundClasses(backgroundId: string): { gradientClass: string; textColorClass: string } {
  try {
    const parsed = JSON.parse(backgroundId)
    if (parsed.gradient && parsed.textColor) {
      const matchById = BOARD_BACKGROUNDS.find(bg => bg.gradientClass === parsed.gradient)
      if (matchById) {
        return {
          gradientClass: matchById.gradientClass,
          textColorClass: matchById.textColorClass
        }
      }
      return {
        gradientClass: parsed.gradient,
        textColorClass: parsed.textColor
      }
    }
  } catch {
  }

  const found = BOARD_BACKGROUNDS.find(bg => bg.id === backgroundId)
  if (!found) {
    return {
      gradientClass: BOARD_BACKGROUNDS[0].gradientClass,
      textColorClass: BOARD_BACKGROUNDS[0].textColorClass
    }
  }
  return {
    gradientClass: found.gradientClass,
    textColorClass: found.textColorClass
  }
}
