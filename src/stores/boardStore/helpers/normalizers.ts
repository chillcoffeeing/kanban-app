import type {
  Board,
  BoardMember,
  Card,
  Stage,
  BoardResponse,
  CardResponse,
  BoardMemberResponse,
  StageResponse,
} from "@/shared/types";

export function normalizeCard(card: CardResponse): Card {
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
  stage: StageResponse,
  cards: CardResponse[] = [],
): Stage {
  return {
    id: stage.id,
    name: stage.name,
    cards: cards.map((card) => normalizeCard(card)),
    createdAt: stage.createdAt,
  };
}

function normalizeMember(member: BoardMemberResponse): BoardMember {
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
  board: BoardResponse,
  members: BoardMemberResponse[] = [],
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
