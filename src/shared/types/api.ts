/**
 * Tipos de respuesta y modelos crudos del backend.
 * Centraliza las interfaces que vienen de la API para evitar duplicados.
 */

export interface BackendCardMember {
  userId: string;
  user: {
    name: string;
  };
}

export interface BackendChecklistItem {
  id: string;
  cardId: string;
  text: string;
  done: boolean;
  position: number;
}

export interface BackendLabel {
  id: string;
  boardId: string;
  name: string;
  color: string;
}

export interface BackendCard {
  id: string;
  stageId: string;
  title: string;
  description: string;
  position: number;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  members?: BackendCardMember[];
  memberIds?: string[];
  labels?: BackendLabel[];
  checklist?: BackendChecklistItem[];
}

export interface BackendStage {
  id: string;
  boardId: string;
  name: string;
  position: number;
  createdAt: string;
}

export interface BackendBoard {
  id: string;
  name: string;
  background: string;
  ownerId: string;
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  labels?: BackendLabel[];
  stagesCount?: number;
  membersCount?: number;
  cardsCount?: number;
}

export interface BackendMember {
  id: string;
  boardId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  permissions: string[];
  invitedAt: string;
  email?: string;
  user?: {
    name: string;
    avatarUrl: string | null;
    createdAt: string;
  };
}

export interface FullBoard {
  board: BackendBoard;
  members: BackendMember[];
  stages: (BackendStage & { cards: BackendCard[] })[];
}

export interface BackendUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  roles?: string[];
  profile?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: BackendUser;
}
