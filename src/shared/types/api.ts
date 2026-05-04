/**
 * Tipos de respuesta y modelos crudos del backend.
 * Centraliza las interfaces que vienen de la API para evitar duplicados.
 */

export interface BackendCardMember {
  boardMembershipId: string;
  boardMembership: {
    user: {
      name: string;
      avatarUrl: string | null;
      id: string;
    };
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
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  labels?: BackendLabel[];
  stagesCount?: number;
  membersCount?: number;
  cardsCount?: number;
}

export interface BackendBoardMember {
  id: string;
  role: "owner" | "admin" | "member";
  permissions: string[];
  invitedAt: string;
  email: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    createdAt: string;
  };
}

export interface FullBoard {
  board: BackendBoard;
  members: BackendBoardMember[];
  stages: (BackendStage & { cards: BackendCard[] })[];
}

export interface BackendUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  roles?: string[];
  profile?: BackendProfile;
  preferences?: BackendPreferences;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
}

export interface BackendProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  coverUrl: string | null;
  jobTitle: string | null;
  company: string | null;
  location: string | null;
  socialWebsite: string | null;
  socialTwitter: string | null;
  socialGithub: string | null;
  socialLinkedin: string | null;
  socialInstagram: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendPreferences {
  id: string;
  userId: string;
  theme: string;
  background: string;
  density: string;
  language: string;
  timezone: string;
  timeFormat: string;
  dateFormat: string;
  reducedMotion: boolean;
  showCompletedCards: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  mentions: boolean;
  cardAssigned: boolean;
  cardDueSoon: boolean;
  boardInvites: boolean;
  weeklyDigest: boolean;
  profileVisibility: string;
  showEmail: boolean;
  showActivity: boolean;
  allowDM: boolean;
  analyticsOptOut: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: BackendUser;
}
