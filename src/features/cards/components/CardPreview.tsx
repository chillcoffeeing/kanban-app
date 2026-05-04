import type { Card } from "@/shared/types/domain";

interface CardPreviewProps {
  card: Card;
  stageId: string;
  boardId: string;
}

export function CardPreview({ card }: CardPreviewProps) {
  const coverColor = card.labels?.[0]?.color;

  return (
    <div className="overflow-hidden rounded-card border border-border-default bg-bg-card shadow-lg w-72 opacity-90 rotate-2">
      {coverColor ? (
        <div className="h-2 w-full" style={{ backgroundColor: coverColor }} />
      ) : null}
      <div className="p-3">
        <div className="h-4 w-3/4 rounded bg-bg-muted animate-pulse" />
        <div className="mt-2 flex gap-2">
          <div className="h-3 w-16 rounded-badge bg-bg-muted animate-pulse" />
          <div className="h-3 w-12 rounded-badge bg-bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
