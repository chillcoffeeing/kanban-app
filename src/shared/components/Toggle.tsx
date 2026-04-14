import { ToggleLeft, ToggleRight } from '@phosphor-icons/react'

export interface ToggleProps {
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  size?: number
  label?: string
}

/**
 * Toggle plano usando iconos de Phosphor (`ToggleLeft` / `ToggleRight`).
 * Sin pelota deslizante — un solo ícono que cambia de variante y color.
 */
export function Toggle({
  checked,
  onChange,
  disabled = false,
  size = 32,
  label,
}: ToggleProps) {
  const Icon = checked ? ToggleRight : ToggleLeft
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`inline-flex shrink-0 items-center justify-center leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-sm ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${checked ? 'text-btn-primary-bg' : 'text-icon-muted hover:text-icon-default'}`}
    >
      <Icon size={size} weight="fill" />
    </button>
  )
}
