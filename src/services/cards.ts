import { ApiClient } from "./api";
import type { CardResponse, ChecklistItem, Label } from "@/shared/types";

export class CardsService {
  static create(
    stageId: string,
    data: {
      title: string;
      description?: string;
      startDate?: string;
      dueDate?: string;
    },
  ) {
    return ApiClient.post<CardResponse>(`/stages/${stageId}/cards`, data);
  }

  static get(id: string) {
    return ApiClient.get<CardResponse>(`/cards/${id}`);
  }

  static update(
    id: string,
    data: {
      title?: string;
      description?: string;
      startDate?: string | null;
      dueDate?: string | null;
    },
  ) {
    return ApiClient.patch<CardResponse>(`/cards/${id}`, data);
  }

  static move(id: string, stageId: string, index: number) {
    return ApiClient.patch<CardResponse>(`/cards/${id}/move`, {
      stageId,
      index,
    });
  }

  static remove(id: string) {
    return ApiClient.delete<void>(`/cards/${id}`);
  }

  static search(boardId: string, query: string) {
    return ApiClient.get<CardResponse[]>(
      `/boards/${boardId}/cards/search?q=${encodeURIComponent(query)}`,
    );
  }

  static addMember(cardId: string, data: { boardMembershipId: string }) {
    return ApiClient.post<CardResponse>(`/cards/${cardId}/members`, data);
  }

  static removeMember(cardId: string, boardMembershipId: string) {
    return ApiClient.delete(`/cards/${cardId}/members/${boardMembershipId}`);
  }

  static getChecklist(cardId: string) {
    return ApiClient.get<ChecklistItem[]>(`/cards/${cardId}/checklist`);
  }

  static createChecklistItem(cardId: string, data: { text: string }) {
    return ApiClient.post<ChecklistItem>(`/cards/${cardId}/checklist`, data);
  }

  static updateChecklistItem(
    cardId: string,
    itemId: string,
    data: { text?: string; done?: boolean },
  ) {
    return ApiClient.patch<ChecklistItem>(
      `/cards/${cardId}/checklist/${itemId}`,
      data,
    );
  }

  static deleteChecklistItem(cardId: string, itemId: string) {
    return ApiClient.delete<void>(`/cards/${cardId}/checklist/${itemId}`);
  }

  static getLabels(boardId: string) {
    return ApiClient.get<Label[]>(`/boards/${boardId}/labels`);
  }

  static createLabel(boardId: string, data: { name: string; color: string }) {
    return ApiClient.post<Label>(`/boards/${boardId}/labels`, data);
  }

  static deleteLabel(labelId: string) {
    return ApiClient.delete<void>(`/labels/${labelId}`);
  }

  static getCardLabels(cardId: string) {
    return ApiClient.get<Label[]>(`/cards/${cardId}/labels`);
  }

  static attachLabel(cardId: string, labelId: string) {
    return ApiClient.post<{ success: true }>(
      `/cards/${cardId}/labels/${labelId}`,
    );
  }

  static detachLabel(cardId: string, labelId: string) {
    return ApiClient.delete<void>(`/cards/${cardId}/labels/${labelId}`);
  }
}
