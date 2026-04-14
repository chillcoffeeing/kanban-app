import { generateId } from '@/shared/utils/helpers'
import type { Attachment } from '@/shared/types/domain'

export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024 // 2 MB

export const IMAGE_MIMES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const

export function isImage(attachment: Pick<Attachment, 'type'> | null | undefined): boolean {
  if (!attachment) return false
  return (IMAGE_MIMES as readonly string[]).includes(attachment.type)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function buildAttachment(
  file: File,
  uploadedBy: string | null
): Promise<Attachment> {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `El archivo supera ${formatBytes(MAX_ATTACHMENT_BYTES)}. Reduce su tamaño.`
    )
  }
  const dataUrl = await readFileAsDataUrl(file)
  return {
    id: generateId(),
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    dataUrl,
    uploadedBy: uploadedBy ?? null,
    uploadedAt: new Date().toISOString(),
  }
}

export function downloadAttachment(attachment: Attachment): void {
  const a = document.createElement('a')
  a.href = attachment.dataUrl
  a.download = attachment.name
  document.body.appendChild(a)
  a.click()
  a.remove()
}
