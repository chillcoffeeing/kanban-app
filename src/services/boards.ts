import { api } from "./api";
import type {
  BackendBoard,
  BackendStage,
  BackendCard,
  BackendBoardMember,
  FullBoard,
} from "@/shared/types";

export const boardsApi = {
  list: () => api<BackendBoard[]>("/boards"),
  get: (id: string) => api<BackendBoard>(`/boards/${id}`),
  getFull: (id: string) => api<FullBoard>(`/boards/${id}/full`),
  create: (body: {
    name: string;
    background?: string;
    preferences?: Record<string, unknown>;
  }) => api<BackendBoard>("/boards", { method: "POST", body }),
  update: (
    id: string,
    body: {
      name?: string;
      background?: string;
      preferences?: Record<string, unknown>;
    },
  ) => api<BackendBoard>(`/boards/${id}`, { method: "PATCH", body }),
  remove: (id: string) => api<void>(`/boards/${id}`, { method: "DELETE" }),
};

export const stagesApi = {
  create: (boardId: string, name: string) =>
    api<BackendStage>(`/boards/${boardId}/stages`, {
      method: "POST",
      body: { name },
    }),
  update: (id: string, body: { name?: string; position?: number }) =>
    api<BackendStage>(`/stages/${id}`, { method: "PATCH", body }),
  remove: (id: string) => api<void>(`/stages/${id}`, { method: "DELETE" }),
};

export const membersApi = {
  list: (boardId: string) =>
    api<BackendBoardMember[]>(`/boards/${boardId}/members`),
  update: (
    boardId: string,
    membershipId: string,
    body: { role?: "owner" | "admin" | "member"; permissions?: string[] },
  ) =>
    api<BackendBoardMember>(`/boards/${boardId}/members/${membershipId}`, {
      method: "PATCH",
      body,
    }),
  remove: (boardId: string, membershipId: string) =>
    api<void>(`/boards/${boardId}/members/${membershipId}`, { method: "DELETE" }),
  invite: (
    boardId: string,
    email: string,
    role: "admin" | "member" = "member",
  ) =>
    api<{ id: string; token: string; email: string; role: string }>(
      `/boards/${boardId}/invitations`,
      { method: "POST", body: { email, role } },
    ),
};
