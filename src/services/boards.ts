import { ApiClient } from "./api";
import type {
  BoardResponse,
  StageResponse,
  BoardMemberResponse,
  FullBoardResponse,
} from "@/shared/types";

export class BoardsService {
  static list() {
    return ApiClient.get<BoardResponse[]>("/boards");
  }

  static get(id: string) {
    return ApiClient.get<BoardResponse>(`/boards/${id}`);
  }

  static getFull(id: string) {
    return ApiClient.get<FullBoardResponse>(`/boards/${id}/full`);
  }

  static create(data: {
    name: string;
    background?: string;
    preferences?: Record<string, unknown>;
  }) {
    return ApiClient.post<BoardResponse>("/boards", data);
  }

  static update(
    id: string,
    data: {
      name?: string;
      background?: string;
      preferences?: Record<string, unknown>;
    },
  ) {
    return ApiClient.patch<BoardResponse>(`/boards/${id}`, data);
  }

  static remove(id: string) {
    return ApiClient.delete<void>(`/boards/${id}`);
  }
}

export class StagesService {
  static create(boardId: string, name: string) {
    return ApiClient.post<StageResponse>(`/boards/${boardId}/stages`, { name });
  }

  static update(id: string, data: { name?: string; position?: number }) {
    return ApiClient.patch<StageResponse>(`/stages/${id}`, data);
  }

  static remove(id: string) {
    return ApiClient.delete<void>(`/stages/${id}`);
  }
}

export class MembersService {
  static list(boardId: string) {
    return ApiClient.get<BoardMemberResponse[]>(`/boards/${boardId}/members`);
  }

  static update(
    boardId: string,
    membershipId: string,
    data: { role?: "owner" | "member"; permissions?: string[] },
  ) {
    return ApiClient.patch<BoardMemberResponse>(
      `/boards/${boardId}/members/${membershipId}`,
      data,
    );
  }

  static remove(boardId: string, membershipId: string) {
    return ApiClient.delete<void>(`/boards/${boardId}/members/${membershipId}`);
  }

  static invite(
    boardId: string,
    email: string,
    role: "owner" | "member" = "member",
  ) {
    return ApiClient.post<{
      id: string;
      token: string;
      email: string;
      role: string;
    }>(`/boards/${boardId}/invitations`, { email, role });
  }
}
