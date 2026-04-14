import { useState } from 'react'
import type { FormEvent } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { DEFAULT_BOARD_BACKGROUNDS } from '@/shared/utils/constants'

interface CreateBoardModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, background: string) => void
}

export function CreateBoardModal({ isOpen, onClose, onCreate }: CreateBoardModalProps) {
  const [name, setName] = useState('')
  const [background, setBackground] = useState(DEFAULT_BOARD_BACKGROUNDS[0])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate(name.trim(), background)
    setName('')
    setBackground(DEFAULT_BOARD_BACKGROUNDS[0])
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear tablero">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nombre del tablero"
          placeholder="Ej: Proyecto Web"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-surface-700">Fondo</label>
          <div className="flex gap-2">
            {DEFAULT_BOARD_BACKGROUNDS.map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => setBackground(bg)}
                className={`h-10 w-14 cursor-pointer rounded-lg ${bg} transition-all ${
                  background === bg ? 'ring-2 ring-primary-500 ring-offset-2' : 'hover:opacity-80'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Crear tablero</Button>
        </div>
      </form>
    </Modal>
  )
}
