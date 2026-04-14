import type { InputHTMLAttributes } from 'react'
import { classNames } from '@/shared/utils/helpers'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  className?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-surface-700">{label}</label>
      )}
      <input
        className={classNames(
          'rounded-lg border border-surface-300 px-3 py-2 text-sm transition-colors placeholder:text-surface-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
