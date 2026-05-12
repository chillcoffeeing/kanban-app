/**
 * Tipos de respuesta y modelos crudos del backend.
 * Réplica exacta de los DTOs del servidor — sin mapeos.
 */

export interface UserProfileJson {
  displayName?: string;
  coverUrl?: string | null;
  bio?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  location?: string | null;
  socialWebsite?: string | null;
  socialTwitter?: string | null;
  socialGithub?: string | null;
  socialLinkedin?: string | null;
  socialInstagram?: string | null;
}

export interface UserPreferenceJson {
  theme?: "light" | "dark" | "midnight" | "solarized";
  background?: string;
  density?: "comfortable" | "compact";
  language?: "es" | "en";
  timezone?: string;
  timeFormat?: "12h" | "24h";
  dateFormat?: "DMY" | "MDY" | "YMD";
  reducedMotion?: boolean;
  showCompletedCards?: boolean;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  mentions?: boolean;
  cardAssigned?: boolean;
  cardDueSoon?: boolean;
  boardInvites?: boolean;
  weeklyDigest?: boolean;
  profileVisibility?: "public" | "workspace" | "private";
  showEmail?: boolean;
  showActivity?: boolean;
  allowDM?: boolean;
  analyticsOptOut?: boolean;
}

export interface UserProfile {
  id: string;
  userId: string;
  profile: UserProfileJson;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreference {
  id: string;
  userId: string;
  settings: UserPreferenceJson;
  createdAt: string;
  updatedAt: string;
}

export interface CardMember {
  boardMembershipId: string;
  boardMembership: {
    user: {
      name: string;
      email?: string;
      avatarUrl: string | null;
      id: string;
    };
  };
}

export interface ChecklistItem {
  id: string;
  cardId: string;
  text: string;
  done: boolean;
  position: number;
}

export interface Label {
  id: string;
  boardId: string;
  name: string;
  color: string;
}

export interface CardResponse {
  id: string;
  stageId: string;
  title: string;
  description: string;
  position: number;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  members: CardMember[];
  labels: Label[];
  checklist: ChecklistItem[];
}

export interface StageResponse {
  id: string;
  boardId: string;
  name: string;
  position: number;
  createdAt: string;
}

export interface BoardResponse {
  id: string;
  name: string;
  background: string;
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  labels: Label[];
  stagesCount?: number;
  membersCount?: number;
  cardsCount?: number;
}

export interface BoardMemberResponse {
  id: string;
  role: "owner" | "admin" | "member";
  permissions: string[];
  invitedAt: string;
  email?: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    avatarUrl: string | null;
    createdAt: string;
  };
}

export interface FullBoardResponse {
  board: BoardResponse;
  members: BoardMemberResponse[];
  stages: (StageResponse & { cards: CardResponse[] })[];
}

export interface UserResponse {
  id: string;
  email: string;
  avatarUrl: string;
  name: string;
  roles: string[];
  profile?: UserProfile;
  preference?: UserPreference;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}
