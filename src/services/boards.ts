import { api } from './api'

export interface BackendBoard {
  id: string
  name: string
  background: string
  ownerId: string
  preferences: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface BackendStage {
  id: string
  boardId: string
  name: string
  position: number
  createdAt: string
}

export interface BackendCard {
  id: string
  stageId: string
  title: string
  description: string
  position: number
  startDate: string | null
  dueDate: string | null
  coverAttachmentId: string | null
  createdAt: string
  updatedAt: string
}

export interface BackendMember {
  id: string
  boardId: string
  userId: string
  role: 'owner' | 'admin' | 'member'
  permissions: string[]
  invitedAt: string
}

export interface FullBoard {
  board: BackendBoard
  members: BackendMember[]
  stages: (BackendStage & { cards: BackendCard[] })[]
}

export const boardsApi = {
  list: () => api<BackendBoard[]>('/boards'),
  get: (id: string) => api<BackendBoard>(`/boards/${id}`),
  getFull: (id: string) => api<FullBoard>(`/boards/${id}/full`),
  create: (body: {
    name: string
    background?: string
    preferences?: Record<string, unknown>
  }) => api<BackendBoard>('/boards', { method: 'POST', body }),
  update: (
    id: string,
    body: { name?: string; background?: string; preferences?: Record<string, unknown> }
  ) => api<BackendBoard>(`/boards/${id}`, { method: 'PATCH', body }),
  remove: (id: string) => api<void>(`/boards/${id}`, { method: 'DELETE' }),
}

export const stagesApi = {
  create: (boardId: string, name: string) =>
    api<BackendStage>(`/boards/${boardId}/stages`, { method: 'POST', body: { name } }),
  update: (id: string, body: { name?: string; position?: number }) =>
    api<BackendStage>(`/stages/${id}`, { method: 'PATCH', body }),
  remove: (id: string) => api<void>(`/stages/${id}`, { method: 'DELETE' }),
}

export const cardsApi = {
  create: (
    stageId: string,
    body: { title: string; description?: string; startDate?: string; dueDate?: string }
  ) => api<BackendCard>(`/stages/${stageId}/cards`, { method: 'POST', body }),
  get: (id: string) => api<BackendCard>(`/cards/${id}`),
  update: (
    id: string,
    body: {
      title?: string
      description?: string
      startDate?: string | null
      dueDate?: string | null
      coverAttachmentId?: string | null
    }
  ) => api<BackendCard>(`/cards/${id}`, { method: 'PATCH', body }),
  move: (id: string, stageId: string, index: number) =>
    api<BackendCard>(`/cards/${id}/move`, { method: 'PATCH', body: { stageId, index } }),
  remove: (id: string) => api<void>(`/cards/${id}`, { method: 'DELETE' }),
  search: (boardId: string, q: string) =>
    api<BackendCard[]>(`/boards/${boardId}/cards/search?q=${encodeURIComponent(q)}`),
}

export const membersApi = {
  list: (boardId: string) => api<BackendMember[]>(`/boards/${boardId}/members`),
  update: (
    boardId: string,
    userId: string,
    body: { role?: 'owner' | 'admin' | 'member'; permissions?: string[] }
  ) => api<BackendMember>(`/boards/${boardId}/members/${userId}`, { method: 'PATCH', body }),
  remove: (boardId: string, userId: string) =>
    api<void>(`/boards/${boardId}/members/${userId}`, { method: 'DELETE' }),
  invite: (boardId: string, email: string, role: 'admin' | 'member' = 'member') =>
    api<{ id: string; token: string; email: string; role: string }>(
      `/boards/${boardId}/invitations`,
      { method: 'POST', body: { email, role } }
    ),
}
