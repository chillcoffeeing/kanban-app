import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { XIcon } from '@phosphor-icons/react'

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
      const root = document.getElementById('root')
      if (root) root.style.pointerEvents = 'none'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
      const root = document.getElementById('root')
      if (root) root.style.pointerEvents = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay p-2"
      style={{ pointerEvents: 'auto' }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className={`w-full ${sizes[size]} rounded-modal relative bg-bg-card shadow-modal`}>
        <button
          onClick={onClose}
          className="rounded-button absolute top-2 right-2 p-1 text-icon-muted hover:bg-bg-muted hover:text-icon-default cursor-pointer"
        >
          <XIcon size={24} weight="bold" />
        </button>
        <div className="p-8">{children}</div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
