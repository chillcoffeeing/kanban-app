import type {
  Board,
  BoardMember,
  Card,
  Stage,
  BackendBoard,
  BackendCard,
  BackendBoardMember,
  BackendStage,
} from "@/shared/types";

export function normalizeCard(card: BackendCard): Card {
  return {
    id: card.id,
    title: card.title,
    description: card.description ?? "",
    labels: card.labels ?? [],
    checklist: card.checklist ?? [],
    members: card.members || [],
    dueDate: card.dueDate,
    startDate: card.startDate,
    createdAt: card.createdAt,
    position: card.position,
  };
}

export function normalizeStage(
  stage: BackendStage,
  cards: BackendCard[] = [],
): Stage {
  return {
    id: stage.id,
    name: stage.name,
    cards: cards.map((card) => normalizeCard(card)),
    createdAt: stage.createdAt,
  };
}

export function normalizeMember(member: BackendBoardMember): BoardMember {
  return {
    id: member.id,
    email: member.email ?? "",
    permissions: member.permissions as import("@/shared/types").Permission[],
    role: member.role,
    invitedAt: member.invitedAt,
    user: member.user,
  };
}

export function normalizeBoard(
  board: BackendBoard,
  members: BackendBoardMember[] = [],
  stages: Stage[] = [],
): Board {
  return {
    id: board.id,
    name: board.name,
    background: board.background,
    members: members.map(normalizeMember),
    stages,
    labels: board.labels ?? [],
    preferences:
      (board.preferences as unknown as Board["preferences"]) || undefined,
    createdAt: board.createdAt,
    stagesCount: board.stagesCount,
    membersCount: board.membersCount,
    cardsCount: board.cardsCount,
  };
}
