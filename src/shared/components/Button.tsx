import type { ButtonHTMLAttributes } from 'react'
import { classNames } from '@/shared/utils/helpers'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-btn-primary-bg text-btn-primary-fg hover:bg-btn-primary-bg-hover shadow-card',
  secondary:
    'bg-btn-secondary-bg text-btn-secondary-fg hover:bg-btn-secondary-bg-hover',
  danger:
    'bg-btn-danger-bg text-btn-danger-fg hover:bg-btn-danger-bg-hover',
  ghost:
    'text-btn-ghost-fg hover:bg-btn-ghost-bg-hover',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-label',
  md: 'px-3.5 py-2 text-content',
  lg: 'px-4 py-2.5 text-heading-sm',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center gap-2 rounded-button font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-bg-surface disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
