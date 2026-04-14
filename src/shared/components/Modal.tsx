import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from '@phosphor-icons/react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className={`w-full ${sizes[size]} rounded-modal bg-bg-card shadow-modal`}>
        <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
          <h2 className="text-heading-md font-semibold text-fg-default">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-button p-1 text-icon-muted hover:bg-bg-muted hover:text-icon-default cursor-pointer"
          >
            <X size={24} weight="bold" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
