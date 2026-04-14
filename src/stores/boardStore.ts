import { create } from 'zustand'
import { generateId } from '@/shared/utils/helpers'
import { ALL_PERMISSIONS } from '@/shared/utils/constants'
import type {
  Attachment,
  Board,
  BoardMember,
  Card,
  Permission,
  Stage,
} from '@/shared/types/domain'
import {
  boardsApi,
  cardsApi,
  membersApi,
  stagesApi,
  type BackendBoard,
  type BackendCard,
  type BackendMember,
  type BackendStage,
  type FullBoard,
} from '@/services/boards'

/* --------------------------- Normalizers --------------------------- */

function normalizeCard(c: BackendCard): Card {
  return {
    id: c.id,
    title: c.title,
    description: c.description ?? '',
    labels: [],
    checklist: [],
    members: [],
    dueDate: c.dueDate,
    startDate: c.startDate,
    attachments: [],
    coverAttachmentId: c.coverAttachmentId,
    createdAt: c.createdAt,
  }
}

function normalizeStage(s: BackendStage, cards: BackendCard[] = []): Stage {
  return {
    id: s.id,
    name: s.name,
    cards: cards.map(normalizeCard),
    createdAt: s.createdAt,
  }
}

function normalizeMember(m: BackendMember): BoardMember {
  return {
    userId: m.userId,
    role: m.role,
    permissions: (m.permissions as Permission[]) ?? ALL_PERMISSIONS,
  }
}

function normalizeBoard(
  b: BackendBoard,
  members: BackendMember[] = [],
  stages: Stage[] = []
): Board {
  return {
    id: b.id,
    name: b.name,
    background: b.background,
    ownerId: b.ownerId,
    members: members.map(normalizeMember),
    stages,
    preferences: (b.preferences as unknown as Board['preferences']) || undefined,
    createdAt: b.createdAt,
  }
}

/* ------------------------------ Store ------------------------------ */

interface BoardState {
  boards: Board[]
  currentBoard: Board | null
  loading: boolean
  error: string | null

  // Hydration
  hydrateBoards: () => Promise<void>
  setCurrentBoard: (boardId: string | null) => Promise<void>

  // Boards
  createBoard: (name: string, background?: string) => Promise<Board>
  updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>
  deleteBoard: (boardId: string) => Promise<void>

  // Members (local-only for now — backend requires invitations with accept flow)
  addMember: (
    boardId: string,
    email: string,
    permissions?: Permission[]
  ) => Promise<void>
  updateMemberPermissions: (
    boardId: string,
    userId: string,
    permissions: Permission[]
  ) => Promise<void>
  removeMember: (boardId: string, userId: string) => Promise<void>

  // Stages
  addStage: (boardId: string, name: string) => Promise<Stage>
  updateStage: (
    boardId: string,
    stageId: string,
    updates: Partial<Stage>
  ) => Promise<void>
  deleteStage: (boardId: string, stageId: string) => Promise<void>

  // Cards
  addCard: (boardId: string, stageId: string, title: string) => Promise<Card>
  updateCard: (
    boardId: string,
    stageId: string,
    cardId: string,
    updates: Partial<Card>
  ) => Promise<void>
  deleteCard: (boardId: string, stageId: string, cardId: string) => Promise<void>
  moveCard: (
    boardId: string,
    fromStageId: string,
    toStageId: string,
    cardId: string,
    newIndex: number
  ) => Promise<void>

  // Attachments (local-only until MinIO integration)
  addAttachment: (
    boardId: string,
    stageId: string,
    cardId: string,
    attachment: Attachment
  ) => void
  removeAttachment: (
    boardId: string,
    stageId: string,
    cardId: string,
    attachmentId: string
  ) => void
  setCoverAttachment: (
    boardId: string,
    stageId: string,
    cardId: string,
    attachmentId: string | null
  ) => void
}

const patchBoardInList = (boards: Board[], boardId: string, patch: (b: Board) => Board) =>
  boards.map((b) => (b.id === boardId ? patch(b) : b))

const patchCurrent = (
  current: Board | null,
  boardId: string,
  patch: (b: Board) => Board
) => (current && current.id === boardId ? patch(current) : current)

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,

  /* ------------------------ Hydration ------------------------ */

  hydrateBoards: async () => {
    set({ loading: true, error: null })
    try {
      const list = await boardsApi.list()
      const boards = list.map((b) => normalizeBoard(b))
      set({ boards, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  setCurrentBoard: async (boardId) => {
    if (!boardId) {
      set({ currentBoard: null })
      return
    }
    set({ loading: true, error: null })
    try {
      const full: FullBoard = await boardsApi.getFull(boardId)
      const stages = full.stages.map((s) => normalizeStage(s, s.cards))
      const board = normalizeBoard(full.board, full.members, stages)
      set((state) => ({
        currentBoard: board,
        boards: state.boards.some((b) => b.id === board.id)
          ? patchBoardInList(state.boards, board.id, () => board)
          : [...state.boards, board],
        loading: false,
      }))
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  /* ------------------------ Boards ------------------------ */

  createBoard: async (name, background) => {
    const res = await boardsApi.create({ name, background })
    const board = normalizeBoard(res)
    set((state) => ({ boards: [...state.boards, board] }))
    return board
  },

  updateBoard: async (boardId, updates) => {
    const res = await boardsApi.update(boardId, {
      name: updates.name,
      background: updates.background,
      preferences: updates.preferences as Record<string, unknown> | undefined,
    })
    set((state) => ({
      boards: patchBoardInList(state.boards, boardId, (b) => ({
        ...b,
        name: res.name,
        background: res.background,
        preferences: (res.preferences as unknown as Board['preferences']) || b.preferences,
      })),
      currentBoard: patchCurrent(state.currentBoard, boardId, (b) => ({
        ...b,
        name: res.name,
        background: res.background,
        preferences: (res.preferences as unknown as Board['preferences']) || b.preferences,
      })),
    }))
  },

  deleteBoard: async (boardId) => {
    await boardsApi.remove(boardId)
    set((state) => ({
      boards: state.boards.filter((b) => b.id !== boardId),
      currentBoard:
        state.currentBoard?.id === boardId ? null : state.currentBoard,
    }))
  },

  /* ------------------------ Members ------------------------
   * Nota: `addMember` en el MVP envía una invitación, pero hasta que el
   * invitado acepte no aparecerá en `members[]` de verdad. Para mantener
   * la UX previa, insertamos un placeholder local con un id temporal.
   * TODO: sustituir por flujo real de invitaciones aceptadas. */

  addMember: async (boardId, email, permissions = ALL_PERMISSIONS) => {
    try {
      await membersApi.invite(boardId, email, 'member')
    } catch {
      /* ignorar: el placeholder sigue siendo útil localmente */
    }
    const placeholderId = `pending_${generateId()}`
    const newMember: BoardMember = {
      userId: placeholderId,
      email,
      permissions,
      role: 'member',
    }
    set((state) => ({
      boards: patchBoardInList(state.boards, boardId, (b) => ({
        ...b,
        members: [...b.members, newMember],
      })),
      currentBoard: patchCurrent(state.currentBoard, boardId, (b) => ({
        ...b,
        members: [...b.members, newMember],
      })),
    }))
  },

  updateMemberPermissions: async (boardId, userId, permissions) => {
    // Si el userId es un UUID real, sync con backend. Si es placeholder → solo local.
    if (!userId.startsWith('pending_')) {
      try {
        await membersApi.update(boardId, userId, { permissions })
      } catch {
        /* silent */
      }
    }
    set((state) => ({
      boards: patchBoardInList(state.boards, boardId, (b) => ({
        ...b,
        members: b.members.map((m) =>
          m.userId === userId ? { ...m, permissions } : m
        ),
      })),
      currentBoard: patchCurrent(state.currentBoard, boardId, (b) => ({
        ...b,
        members: b.members.map((m) =>
          m.userId === userId ? { ...m, permissions } : m
        ),
      })),
    }))
  },

  removeMember: async (boardId, userId) => {
    if (!userId.startsWith('pending_')) {
      try {
        await membersApi.remove(boardId, userId)
      } catch {
        /* silent */
      }
    }
    set((state) => ({
      boards: patchBoardInList(state.boards, boardId, (b) => ({
        ...b,
        members: b.members.filter((m) => m.userId !== userId),
      })),
      currentBoard: patchCurrent(state.currentBoard, boardId, (b) => ({
        ...b,
        members: b.members.filter((m) => m.userId !== userId),
      })),
    }))
  },

  /* ------------------------ Stages ------------------------ */

  addStage: async (boardId, name) => {
    const res = await stagesApi.create(boardId, name)
    const stage = normalizeStage(res, [])
    set((state) => ({
      boards: patchBoardInList(state.boards, boardId, (b) => ({
        ...b,
        stages: [...b.stages, stage],
      })),
      currentBoard: patchCurrent(state.currentBoard, boardId, (b) => ({
        ...b,
        stages: [...b.stages, stage],
      })),
    }))
    return stage
  },

  updateStage: async (boardId, stageId, updates) => {
    const res = await stagesApi.update(stageId, { name: updates.name })
    set((state) => ({
      boards: patchBoardInList(state.boards, boardId, (b) => ({
        ...b,
        stages: b.stages.map((s) =>
          s.id === stageId ? { ...s, name: res.name } : s
        ),
      })),
      currentBoard: patchCurrent(state.currentBoard, boardId, (b) => ({
        ...b,
        stages: b.stages.map((s) =>
          s.id === stageId ? { ...s, name: res.name } : s
        ),
      })),
    }))
  },

  deleteStage: async (boardId, stageId) => {
    await stagesApi.remove(stageId)
    set((state) => ({
      boards: patchBoardInList(state.boards, boardId, (b) => ({
        ...b,
        stages: b.stages.filter((s) => s.id !== stageId),
      })),
      currentBoard: patchCurrent(state.currentBoard, boardId, (b) => ({
        ...b,
        stages: b.stages.filter((s) => s.id !== stageId),
      })),
    }))
  },

  /* ------------------------ Cards ------------------------ */

  addCard: async (boardId, stageId, title) => {
    const res = await cardsApi.create(stageId, { title })
    const card = normalizeCard(res)
    set((state) => ({
      boards: patchBoardInList(state.boards, boardId, (b) => ({
        ...b,
        stages: b.stages.map((s) =>
          s.id === stageId ? { ...s, cards: [...s.cards, card] } : s
        ),
      })),
      currentBoard: patchCurrent(state.currentBoard, boardId, (b) => ({
        ...b,
        stages: b.stages.map((s) =>
          s.id === stageId ? { ...s, cards: [...s.cards, card] } : s
        ),
      })),
    }))
    return card
  },

  updateCard: async (boardId, stageId, cardId, updates) => {
    // Campos soportados por backend:
    const syncable: Parameters<typeof cardsApi.update>[1] = {}
    if (updates.title !== undefined) syncable.title = updates.title
    if (updates.description !== undefined) syncable.description = updates.description
    if (updates.startDate !== undefined) syncable.startDate = updates.startDate
    if (updates.dueDate !== undefined) syncable.dueDate = updates.dueDate
    if (updates.coverAttachmentId !== undefined)
      syncable.coverAttachmentId = updates.coverAttachmentId

    if (Object.keys(syncable).length > 0) {
      try {
        await cardsApi.update(cardId, syncable)
      } catch {
        /* silent — local update still applied */
      }
    }

    set((state) => {
      const merge = (c: Card) => ({ ...c, ...updates })
      return {
        boards: patchBoardInList(state.boards, boardId, (b) => ({
          ...b,
          stages: b.stages.map((s) =>
            s.id !== stageId
              ? s
              : { ...s, cards: s.cards.map((c) => (c.id === cardId ? merge(c) : c)) }
          ),
        })),
        currentBoard: patchCurrent(state.currentBoard, boardId, (b) => ({
          ...b,
          stages: b.stages.map((s) =>
            s.id !== stageId
              ? s
              : { ...s, cards: s.cards.map((c) => (c.id === cardId ? merge(c) : c)) }
          ),
        })),
      }
    })
  },

  deleteCard: async (boardId, stageId, cardId) => {
    await cardsApi.remove(cardId)
    set((state) => ({
      boards: patchBoardInList(state.boards, boardId, (b) => ({
        ...b,
        stages: b.stages.map((s) =>
          s.id === stageId
            ? { ...s, cards: s.cards.filter((c) => c.id !== cardId) }
            : s
        ),
      })),
      currentBoard: patchCurrent(state.currentBoard, boardId, (b) => ({
        ...b,
        stages: b.stages.map((s) =>
          s.id === stageId
            ? { ...s, cards: s.cards.filter((c) => c.id !== cardId) }
            : s
        ),
      })),
    }))
  },

  moveCard: async (boardId, fromStageId, toStageId, cardId, newIndex) => {
    // Optimistic: aplicar el movimiento ya, después sincronizar con backend.
    const board = get().currentBoard ?? get().boards.find((b) => b.id === boardId)
    if (!board) return
    const fromStage = board.stages.find((s) => s.id === fromStageId)
    const card = fromStage?.cards.find((c) => c.id === cardId)
    if (!card) return

    set((state) => {
      const applyMove = (b: Board): Board => {
        if (b.id !== boardId) return b
        return {
          ...b,
          stages: b.stages.map((s) => {
            if (s.id === fromStageId && s.id === toStageId) {
              const cards = s.cards.filter((c) => c.id !== cardId)
              cards.splice(newIndex, 0, card)
              return { ...s, cards }
            }
            if (s.id === fromStageId) {
              return { ...s, cards: s.cards.filter((c) => c.id !== cardId) }
            }
            if (s.id === toStageId) {
              const cards = [...s.cards]
              cards.splice(newIndex, 0, card)
              return { ...s, cards }
            }
            return s
          }),
        }
      }
      return {
        boards: state.boards.map(applyMove),
        currentBoard: state.currentBoard ? applyMove(state.currentBoard) : null,
      }
    })

    try {
      await cardsApi.move(cardId, toStageId, newIndex)
    } catch {
      /* silent — podría añadir rollback aquí */
    }
  },

  /* ------------------------ Attachments (local only) ------------------------ */

  addAttachment: (boardId, stageId, cardId, attachment) => {
    set((state) => {
      const merge = (c: Card) => ({
        ...c,
        attachments: [...(c.attachments || []), attachment],
      })
      return {
        boards: patchBoardInList(state.boards, boardId, (b) => ({
          ...b,
          stages: b.stages.map((s) =>
            s.id !== stageId
              ? s
              : { ...s, cards: s.cards.map((c) => (c.id === cardId ? merge(c) : c)) }
          ),
        })),
        currentBoard: patchCurrent(state.currentBoard, boardId, (b) => ({
          ...b,
          stages: b.stages.map((s) =>
            s.id !== stageId
              ? s
              : { ...s, cards: s.cards.map((c) => (c.id === cardId ? merge(c) : c)) }
          ),
        })),
      }
    })
  },

  removeAttachment: (boardId, stageId, cardId, attachmentId) => {
    set((state) => {
      const merge = (c: Card) => ({
        ...c,
        attachments: (c.attachments || []).filter((a) => a.id !== attachmentId),
        coverAttachmentId:
          c.coverAttachmentId === attachmentId ? null : c.coverAttachmentId,
      })
      return {
        boards: patchBoardInList(state.boards, boardId, (b) => ({
          ...b,
          stages: b.stages.map((s) =>
            s.id !== stageId
              ? s
              : { ...s, cards: s.cards.map((c) => (c.id === cardId ? merge(c) : c)) }
          ),
        })),
        currentBoard: patchCurrent(state.currentBoard, boardId, (b) => ({
          ...b,
          stages: b.stages.map((s) =>
            s.id !== stageId
              ? s
              : { ...s, cards: s.cards.map((c) => (c.id === cardId ? merge(c) : c)) }
          ),
        })),
      }
    })
  },

  setCoverAttachment: (boardId, stageId, cardId, attachmentId) => {
    set((state) => {
      const merge = (c: Card) => ({ ...c, coverAttachmentId: attachmentId })
      return {
        boards: patchBoardInList(state.boards, boardId, (b) => ({
          ...b,
          stages: b.stages.map((s) =>
            s.id !== stageId
              ? s
              : { ...s, cards: s.cards.map((c) => (c.id === cardId ? merge(c) : c)) }
          ),
        })),
        currentBoard: patchCurrent(state.currentBoard, boardId, (b) => ({
          ...b,
          stages: b.stages.map((s) =>
            s.id !== stageId
              ? s
              : { ...s, cards: s.cards.map((c) => (c.id === cardId ? merge(c) : c)) }
          ),
        })),
      }
    })
  },
}))
