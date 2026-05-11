import type { ButtonHTMLAttributes } from 'react'
import { classNames } from '@/shared/utils/helpers'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-fg hover:bg-primary-hover shadow-card',
  secondary:
    'bg-neutral-light text-neutral-dark hover:bg-neutral-light-hover',
  danger:
    'bg-danger text-danger-fg hover:bg-danger-hover',
  ghost:
    'text-neutral-dark hover:bg-neutral-light-hover',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-label',
  md: 'px-3.5 py-2 text-content',
  lg: 'px-4 py-2.5 text-heading-sm',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-light disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
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
