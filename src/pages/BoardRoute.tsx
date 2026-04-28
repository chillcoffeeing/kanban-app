import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { BoardView } from "./BoardView";

export function BoardRoute() {
  const { boardId } = useParams<{ boardId: string }>();
  const [searchParams] = useSearchParams();
  const cardId = useMemo(
    () => searchParams.get("card-id") ?? undefined,
    [searchParams],
  );

  if (!boardId) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 text-surface-500">
        Tablero no encontrado.
      </div>
    );
  }

  return <BoardView boardId={boardId} openCardId={cardId} />;
}
