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
         <label className="text-sm font-medium text-fg-default">{label}</label>
       )}
       <input
         className={classNames(
           'rounded-lg border border-border-default px-3 py-2 text-sm transition-colors placeholder:text-fg-subtle focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/20',
           error && 'border-fg-danger',
           className
         )}
         {...props}
       />
       {error && <span className="text-xs text-fg-danger">{error}</span>}
    </div>
  )
}
