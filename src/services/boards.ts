import { api } from "./api";
import type {
  BoardResponse,
  StageResponse,
  CardResponse,
  BoardMemberResponse,
  FullBoardResponse,
} from "@/shared/types";

export const boardsApi = {
  list: () => api<BoardResponse[]>("/boards"),
  get: (id: string) => api<BoardResponse>(`/boards/${id}`),
  getFull: (id: string) => api<FullBoardResponse>(`/boards/${id}/full`),
  create: (body: {
    name: string;
    background?: string;
    preferences?: Record<string, unknown>;
  }) => api<BoardResponse>("/boards", { method: "POST", body }),
  update: (
    id: string,
    body: {
      name?: string;
      background?: string;
      preferences?: Record<string, unknown>;
    },
  ) => api<BoardResponse>(`/boards/${id}`, { method: "PATCH", body }),
  remove: (id: string) => api<void>(`/boards/${id}`, { method: "DELETE" }),
};

export const stagesApi = {
  create: (boardId: string, name: string) =>
    api<StageResponse>(`/boards/${boardId}/stages`, {
      method: "POST",
      body: { name },
    }),
  update: (id: string, body: { name?: string; position?: number }) =>
    api<StageResponse>(`/stages/${id}`, { method: "PATCH", body }),
  remove: (id: string) => api<void>(`/stages/${id}`, { method: "DELETE" }),
};

export const membersApi = {
  list: (boardId: string) =>
    api<BoardMemberResponse[]>(`/boards/${boardId}/members`),
  update: (
    boardId: string,
    membershipId: string,
    body: { role?: "owner" | "admin" | "member"; permissions?: string[] },
  ) =>
    api<BoardMemberResponse>(`/boards/${boardId}/members/${membershipId}`, {
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
