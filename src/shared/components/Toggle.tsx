import { ToggleLeftIcon, ToggleRightIcon } from '@phosphor-icons/react'

interface ToggleProps {
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  size?: number
  label?: string
}

/**
 * Toggle plano usando iconos de Phosphor (`ToggleLeftIcon` / `ToggleRightIcon`).
 * Sin pelota deslizante — un solo ícono que cambia de variante y color.
 */
export function Toggle({
  checked,
  onChange,
  disabled = false,
  size = 32,
  label,
}: ToggleProps) {
  const Icon = checked ? ToggleRightIcon : ToggleLeftIcon
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`inline-flex shrink-0 items-center justify-center leading-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'
      } ${checked ? 'text-primary bg-primary/10 p-1' : 'text-neutral-dark/50 hover:text-neutral-dark p-1'}`}
    >
      <Icon size={size} weight="fill" />
    </button>
  )
}
