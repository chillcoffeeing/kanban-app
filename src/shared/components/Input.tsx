import type { InputHTMLAttributes } from 'react'
import { classNames } from '@/shared/utils/helpers'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  className?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
       {label && (
         <label className="text-sm font-medium text-neutral-dark">{label}</label>
       )}
       <input
         className={classNames(
           'w-full rounded-lg border border-neutral-light bg-neutral-light/50 px-3 py-2 text-sm text-neutral-dark transition-all placeholder:text-neutral-dark/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-neutral-light',
           error && 'border-danger focus:border-danger focus:ring-danger/20',
           className
         )}
         {...props}
       />
       {error && (
         <p className="text-xs text-danger flex items-center gap-1">
           <span className="opacity-60">⚠</span> {error}
         </p>
       )}
     </div>
  )
}
