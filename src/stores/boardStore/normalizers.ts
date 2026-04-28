import type {
  Board,
  BoardMember,
  Card,
  Stage,
  BackendBoard,
  BackendCard,
  BackendMember,
  BackendStage,
} from "@/shared/types";

export function normalizeCard(
  card: BackendCard,
  boardMembers: BackendMember[] = [],
): Card {
  const members = card.members?.length
    ? card.members
    : (card.memberIds?.map((id) => {
        const boardMember = boardMembers.find((member) => member.userId === id);
        return {
          userId: id,
          user: {
            name: boardMember?.user?.name ?? boardMember?.email ?? "Invitado",
          },
        };
      }) ?? []);

  return {
    id: card.id,
    title: card.title,
    description: card.description ?? "",
    labels: card.labels ?? [],
    checklist: card.checklist ?? [],
    members,
    dueDate: card.dueDate,
    startDate: card.startDate,
    createdAt: card.createdAt,
    position: card.position,
  };
}

export function normalizeStage(
  stage: BackendStage,
  cards: BackendCard[] = [],
  boardMembers: BackendMember[] = [],
): Stage {
  return {
    id: stage.id,
    name: stage.name,
    cards: cards.map((card) => normalizeCard(card, boardMembers)),
    createdAt: stage.createdAt,
  };
}

export function normalizeMember(member: BackendMember): BoardMember {
  return {
    id: member.id,
    boardId: member.boardId,
    userId: member.userId,
    email: member.email ?? "",
    permissions: member.permissions as import("@/shared/types").Permission[],
    role: member.role,
    invitedAt: member.invitedAt,
    user: member.user,
  };
}

export function normalizeBoard(
  board: BackendBoard,
  members: BackendMember[] = [],
  stages: Stage[] = [],
): Board {
  return {
    id: board.id,
    name: board.name,
    background: board.background,
    ownerId: board.ownerId,
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
