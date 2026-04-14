import { useRef, useState } from 'react'
import {
  Paperclip,
  DownloadSimple,
  Trash,
  Image as ImageIcon,
  FileText,
  Star,
  StarHalf,
} from '@phosphor-icons/react'
import { Button } from '@/shared/components/Button'
import { useBoardStore } from '@/stores/boardStore'
import { useAuthStore } from '@/stores/authStore'
import {
  buildAttachment,
  downloadAttachment,
  formatBytes,
  isImage,
} from '@/features/cards/utils/attachments'
import type { Card } from '@/shared/types/domain'

interface CardAttachmentsProps {
  card: Card
  boardId: string
  stageId: string
}

export function CardAttachments({ card, boardId, stageId }: CardAttachmentsProps) {
  const { addAttachment, removeAttachment, setCoverAttachment } =
    useBoardStore()
  const user = useAuthStore((s) => s.user)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const attachments = card.attachments || []

  const handleFiles = async (fileList: FileList | null) => {
    setError('')
    setLoading(true)
    try {
      const files = Array.from(fileList || [])
      for (const file of files) {
        const attachment = await buildAttachment(file, user?.id || null)
        addAttachment(boardId, stageId, card.id, attachment)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo adjuntar el archivo.')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const toggleCover = (id: string) => {
    setCoverAttachment(
      boardId,
      stageId,
      card.id,
      card.coverAttachmentId === id ? null : id
    )
  }

  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 text-content font-medium text-fg-default">
        <Paperclip size={20} weight="duotone" /> Adjuntos
      </h4>

      {attachments.length > 0 && (
        <ul className="mb-3 space-y-2">
          {attachments.map((a) => {
            const image = isImage(a)
            const isCover = card.coverAttachmentId === a.id
            return (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-card border border-border-default bg-bg-card p-2"
              >
                <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-badge bg-bg-muted text-icon-muted">
                  {image ? (
                    <img
                      src={a.dataUrl}
                      alt={a.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileText size={28} weight="duotone" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-content font-medium text-fg-default">
                    {a.name}
                  </p>
                  <p className="text-card-meta text-fg-subtle">
                    {formatBytes(a.size)} ·{' '}
                    {new Date(a.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {image && (
                    <button
                      onClick={() => toggleCover(a.id)}
                      title={isCover ? 'Quitar portada' : 'Usar como portada'}
                      className="cursor-pointer rounded-button p-1.5 text-icon-muted hover:bg-bg-muted hover:text-icon-brand"
                    >
                      {isCover ? (
                        <Star size={20} weight="fill" className="text-icon-brand" />
                      ) : (
                        <StarHalf size={20} weight="duotone" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => downloadAttachment(a)}
                    title="Descargar"
                    className="cursor-pointer rounded-button p-1.5 text-icon-muted hover:bg-bg-muted hover:text-icon-default"
                  >
                    <DownloadSimple size={20} weight="duotone" />
                  </button>
                  <button
                    onClick={() =>
                      removeAttachment(boardId, stageId, card.id, a.id)
                    }
                    title="Eliminar"
                    className="cursor-pointer rounded-button p-1.5 text-icon-muted hover:bg-bg-danger hover:text-icon-danger"
                  >
                    <Trash size={20} weight="duotone" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          <ImageIcon size={18} weight="duotone" /> {loading ? 'Subiendo…' : 'Añadir archivo'}
        </Button>
        {attachments.length === 0 && (
          <span className="text-card-meta text-fg-subtle">
            Máx 2 MB por archivo.
          </span>
        )}
      </div>

      {error && (
        <p className="mt-2 text-card-meta text-fg-danger">{error}</p>
      )}
    </div>
  )
}
