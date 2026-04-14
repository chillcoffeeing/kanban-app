import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Button } from '@/shared/components/Button'
import { useBoardStore } from '@/stores/boardStore'
import { useAuthStore } from '@/stores/authStore'
import { useActivity } from '@/shared/hooks/useActivity'
import { ACTIVITY_TYPES } from '@/stores/activityStore'
import { generateId } from '@/shared/utils/helpers'
import {
  CheckCircle,
  UserPlus,
  Trash,
  Plus,
} from '@phosphor-icons/react'
import { CardAttachments } from './CardAttachments'
import { LabelEditor } from './LabelEditor'
import type { Card, ChecklistItem, Label } from '@/shared/types/domain'

interface CardDetailModalProps {
  isOpen: boolean
  onClose: () => void
  card: Card | null
  stageId: string | null
  boardId: string
}

export function CardDetailModal({ isOpen, onClose, card, stageId, boardId }: CardDetailModalProps) {
  const { updateCard, deleteCard } = useBoardStore()
  const user = useAuthStore((s) => s.user)
  const log = useActivity(boardId)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [labels, setLabels] = useState<Label[]>([])
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [dueDate, setDueDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [newCheckItem, setNewCheckItem] = useState('')
  const [members, setMembers] = useState<string[]>([])

  useEffect(() => {
    if (card) {
      setTitle(card.title || '')
      setDescription(card.description || '')
      setLabels(card.labels || [])
      setChecklist(card.checklist || [])
      setDueDate(card.dueDate || '')
      setStartDate(card.startDate || '')
      setMembers(card.members || [])
    }
  }, [card])

  if (!card || !stageId) return null

  const save = (updates: Partial<Card>) => {
    updateCard(boardId, stageId, card.id, updates)
  }

  const handleTitleBlur = () => {
    if (title !== card.title) {
      save({ title })
      log(ACTIVITY_TYPES.CARD_UPDATED, `renombró la tarjeta "${card.title}" a "${title}"`)
    }
  }

  const handleDescriptionBlur = () => {
    if (description !== card.description) {
      save({ description })
      log(ACTIVITY_TYPES.CARD_UPDATED, `actualizó la descripción de "${title}"`)
    }
  }

  const toggleLabel = (label: Label) => {
    const has = labels.find((l) => l.value === label.value)
    const newLabels = has ? labels.filter((l) => l.value !== label.value) : [...labels, label]
    setLabels(newLabels)
    save({ labels: newLabels })
    if (has) {
      log(ACTIVITY_TYPES.CARD_LABEL_REMOVED, `quitó la etiqueta "${label.name}" de "${title}"`)
    } else {
      log(ACTIVITY_TYPES.CARD_LABEL_ADDED, `añadió la etiqueta "${label.name}" a "${title}"`)
    }
  }

  const addCheckItem = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newCheckItem.trim()) return
    const text = newCheckItem.trim()
    const item: ChecklistItem = { id: generateId(), text, done: false }
    const newList = [...checklist, item]
    setChecklist(newList)
    save({ checklist: newList })
    log(ACTIVITY_TYPES.CARD_CHECKLIST_ADDED, `añadió "${text}" al checklist de "${title}"`)
    setNewCheckItem('')
  }

  const toggleCheckItem = (itemId: string) => {
    const item = checklist.find((i) => i.id === itemId)
    const newList = checklist.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i))
    setChecklist(newList)
    save({ checklist: newList })
    if (item) {
      log(ACTIVITY_TYPES.CARD_CHECKLIST_TOGGLED, `${!item.done ? 'completó' : 'desmarcó'} "${item.text}" en "${title}"`)
    }
  }

  const removeCheckItem = (itemId: string) => {
    const newList = checklist.filter((i) => i.id !== itemId)
    setChecklist(newList)
    save({ checklist: newList })
  }

  const joinCard = () => {
    const name = user?.name || 'Usuario'
    if (members.includes(name)) return
    const newMembers = [...members, name]
    setMembers(newMembers)
    save({ members: newMembers })
    log(ACTIVITY_TYPES.MEMBER_JOINED_CARD, `se unió a la tarjeta "${title}"`)
  }

  const leaveCard = () => {
    const name = user?.name || 'Usuario'
    const newMembers = members.filter((m) => m !== name)
    setMembers(newMembers)
    save({ members: newMembers })
    log(ACTIVITY_TYPES.MEMBER_LEFT_CARD, `salió de la tarjeta "${title}"`)
  }

  const handleStartDate = (value: string) => {
    setStartDate(value)
    save({ startDate: value })
    if (value) {
      log(ACTIVITY_TYPES.CARD_DATE_SET, `estableció fecha inicio ${value} en "${title}"`)
    }
  }

  const handleDueDate = (value: string) => {
    setDueDate(value)
    save({ dueDate: value })
    if (value) {
      log(ACTIVITY_TYPES.CARD_DATE_SET, `estableció fecha vencimiento ${value} en "${title}"`)
    }
  }

  const handleDelete = () => {
    log(ACTIVITY_TYPES.CARD_DELETED, `eliminó la tarjeta "${title}"`)
    deleteCard(boardId, stageId, card.id)
    onClose()
  }

  const completedCount = checklist.filter((c) => c.done).length
  const progress = checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-5">
          {/* Título */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="w-full text-lg font-semibold text-surface-900 focus:outline-none border-b border-transparent focus:border-primary-500 pb-1"
          />

          {/* Labels */}
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {labels.map((l) => (
                <span
                  key={l.value}
                  className="rounded-md px-2.5 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: l.value }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          )}

          {/* Descripción */}
          <div>
            <h4 className="mb-1 text-sm font-medium text-surface-700">Descripción</h4>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Añadir una descripción más detallada..."
              className="w-full resize-none rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-700 placeholder:text-surface-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              rows={3}
            />
          </div>

          {/* Checklist */}
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-surface-700">
              <CheckCircle size={20} weight="duotone" /> Lista de tareas
            </h4>
            {checklist.length > 0 && (
              <div className="mb-3">
                <div className="mb-1 flex justify-between text-xs text-surface-400">
                  <span>{completedCount}/{checklist.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-200">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            <div className="space-y-1">
              {checklist.map((item) => (
                <div key={item.id} className="group flex items-center gap-2 rounded-md px-2 py-1 hover:bg-surface-50">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleCheckItem(item.id)}
                    className="h-4 w-4 rounded border-surface-300 cursor-pointer"
                  />
                  <span className={`flex-1 text-sm ${item.done ? 'text-surface-400 line-through' : 'text-surface-700'}`}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => removeCheckItem(item.id)}
                    className="cursor-pointer opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-500"
                  >
                    <Trash size={18} weight="duotone" />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={addCheckItem} className="mt-2 flex gap-2">
              <input
                placeholder="Nuevo elemento..."
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                className="flex-1 rounded-md border border-surface-200 px-2.5 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
              />
              <Button type="submit" size="sm" variant="secondary">
                <Plus size={18} weight="duotone" />
              </Button>
            </form>
          </div>

          {/* Adjuntos */}
          <CardAttachments card={card} boardId={boardId} stageId={stageId} />

          {/* Miembros */}
          {members.length > 0 && (
            <div>
              <h4 className="mb-1 text-sm font-medium text-surface-700">Miembros</h4>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <span key={m} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar acciones */}
        <div className="w-full space-y-2 lg:w-48">
          <p className="text-xs font-semibold uppercase text-surface-400">Acciones</p>

          {!members.includes(user?.name || '') ? (
            <Button variant="secondary" size="sm" className="w-full justify-start" onClick={joinCard}>
<UserPlus size={20} weight="duotone" /> Unirme
            </Button>
          ) : (
            <Button variant="secondary" size="sm" className="w-full justify-start" onClick={leaveCard}>
<UserPlus size={20} weight="duotone" /> Salir
            </Button>
          )}

          <LabelEditor labels={labels} onToggle={toggleLabel} />

          <div className="space-y-2 pt-2">
            <div>
              <label className="text-xs font-medium text-surface-500">Fecha inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDate(e.target.value)}
                className="w-full rounded-md border border-surface-200 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-500">Fecha vencimiento</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDate(e.target.value)}
                className="w-full rounded-md border border-surface-200 px-2 py-1 text-sm"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-surface-200">
            <Button
              variant="danger"
              size="sm"
              className="w-full"
              onClick={handleDelete}
            >
<Trash size={20} weight="duotone" /> Eliminar tarjeta
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
