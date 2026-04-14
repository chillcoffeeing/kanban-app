import type { Board, BoardPreferences } from '@/shared/types/domain'

export const BOARD_PREF_DEFAULTS: BoardPreferences = {
  visibility: 'workspace',
  commentPermission: 'members',
  memberPermission: 'members',
  workspaceEdit: true,
  showCompletedOnCard: true,
  coversEnabled: true,
}

export function getBoardPreferences(
  board: Pick<Board, 'preferences'> | null | undefined
): BoardPreferences {
  if (!board) return { ...BOARD_PREF_DEFAULTS }
  return { ...BOARD_PREF_DEFAULTS, ...(board.preferences || {}) }
}

/**
 * Calcula si un usuario puede gestionar miembros respetando
 * `memberPermission` del tablero.
 */
export function canManageMembers(
  board: Board | null | undefined,
  userId: string | null | undefined
): boolean {
  if (!board || !userId) return false
  const prefs = getBoardPreferences(board)
  const member = board.members.find((m) => m.userId === userId)
  if (!member) return false
  if (member.role === 'owner') return true
  if (prefs.memberPermission === 'admins') {
    return member.role === 'admin'
  }
  return true
}

export function canComment(
  board: Board | null | undefined,
  userId: string | null | undefined
): boolean {
  if (!board) return false
  const prefs = getBoardPreferences(board)
  if (prefs.commentPermission === 'disabled') return false
  if (prefs.commentPermission === 'workspace') return true
  return !!board.members.find((m) => m.userId === userId)
}
