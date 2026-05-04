import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'

interface DropdownMenuProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
}

export function DropdownMenu({ trigger, children, align = 'right' }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
         <div
           className={`absolute z-40 mt-1 min-w-[180px] rounded-lg border border-border-subtle bg-bg-card py-1 shadow-lg ${
             align === 'right' ? 'right-0' : 'left-0'
           }`}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownItemProps {
  children: ReactNode
  onClick?: () => void
  danger?: boolean
}

export function DropdownItem({ children, onClick, danger }: DropdownItemProps) {
  return (
    <button
       onClick={onClick}
       className={`w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors ${
         danger
           ? 'text-fg-danger hover:bg-bg-danger'
           : 'text-fg-default hover:bg-bg-subtle'
       }`}
    >
      {children}
    </button>
  )
}
