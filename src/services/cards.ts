import { api } from "./api";
import type {
  BackendCard,
  BackendCardMember,
  BackendChecklistItem,
  BackendLabel,
} from "@/shared/types";

export const cardsApi = {
  // Operaciones básicas de cards
  create: (
    stageId: string,
    body: {
      title: string;
      description?: string;
      startDate?: string;
      dueDate?: string;
    },
  ) => api<BackendCard>(`/stages/${stageId}/cards`, { method: "POST", body }),

  get: (id: string) => api<BackendCard>(`/cards/${id}`),

  update: (
    id: string,
    body: {
      title?: string;
      description?: string;
      startDate?: string | null;
      dueDate?: string | null;
    },
  ) => api<BackendCard>(`/cards/${id}`, { method: "PATCH", body }),

  move: (id: string, stageId: string, index: number) =>
    api<BackendCard>(`/cards/${id}/move`, {
      method: "PATCH",
      body: { stageId, index },
    }),

  remove: (id: string) => api<void>(`/cards/${id}`, { method: "DELETE" }),

  search: (boardId: string, q: string) =>
    api<BackendCard[]>(
      `/boards/${boardId}/cards/search?q=${encodeURIComponent(q)}`,
    ),

  // Operaciones de miembros de cards
  addMember: (cardId: string, body: { boardMembershipId: string }) =>
    api<BackendCard>(`/cards/${cardId}/members`, { method: "POST", body }),

  removeMember: (cardId: string, boardMembershipId: string) =>
    api(`/cards/${cardId}/members/${boardMembershipId}`, {
      method: "DELETE",
    }),

  // Operaciones de checklists
  getChecklist: (cardId: string) =>
    api<BackendChecklistItem[]>(`/cards/${cardId}/checklist`),

  createChecklistItem: (cardId: string, body: { text: string }) =>
    api<BackendChecklistItem>(`/cards/${cardId}/checklist`, {
      method: "POST",
      body,
    }),

  updateChecklistItem: (
    cardId: string,
    itemId: string,
    body: { text?: string; done?: boolean },
  ) =>
    api<BackendChecklistItem>(`/cards/${cardId}/checklist/${itemId}`, {
      method: "PATCH",
      body,
    }),

  deleteChecklistItem: (cardId: string, itemId: string) =>
    api<void>(`/cards/${cardId}/checklist/${itemId}`, { method: "DELETE" }),

  // Operaciones de labels
  getLabels: (boardId: string) =>
    api<BackendLabel[]>(`/boards/${boardId}/labels`),

  createLabel: (boardId: string, body: { name: string; color: string }) =>
    api<BackendLabel>(`/boards/${boardId}/labels`, { method: "POST", body }),

  deleteLabel: (labelId: string) =>
    api<void>(`/labels/${labelId}`, { method: "DELETE" }),

  getCardLabels: (cardId: string) =>
    api<BackendLabel[]>(`/cards/${cardId}/labels`),

  attachLabel: (cardId: string, labelId: string) =>
    api<{ success: true }>(`/cards/${cardId}/labels/${labelId}`, {
      method: "POST",
    }),

  detachLabel: (cardId: string, labelId: string) =>
    api<void>(`/cards/${cardId}/labels/${labelId}`, { method: "DELETE" }),
};
