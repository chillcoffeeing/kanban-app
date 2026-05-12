import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBoardStore } from "@/stores/boardStore";
import { useAuthStore } from "@/stores/authStore";
import { BoardCard } from "@/features/boards/components/BoardCard";
import { CreateBoardModal } from "@/features/boards/components/CreateBoardModal";
import { Button } from "@/shared/components/Button";
import { PlusIcon } from "@phosphor-icons/react";

export function BoardsPage() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const boards = useBoardStore((boardState) => boardState.boards);
  const loading = useBoardStore((boardState) => boardState.loading);
  const error = useBoardStore((boardState) => boardState.error);
  const hydrateBoards = useBoardStore((boardState) => boardState.hydrateBoards);
  const createBoard = useBoardStore((boardState) => boardState.createBoard);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    void hydrateBoards();
  }, [hydrateBoards]);

  const myBoards = boards;

  const handleCreate = async (name: string, background: string) => {
    if (!user) return;
    try {
      await createBoard(name, background);
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">Mis Tableros</h1>
          <p className="mt-1 text-sm text-neutral-dark/60">{myBoards.length} tablero{myBoards.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <PlusIcon size={20} weight="duotone" /> Nuevo tablero
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
           {error}
         </div>
      )}

      {loading && myBoards.length === 0 ? (
        <div className="py-16 text-center text-neutral-dark/50">
          <div className="inline-block size-8 animate-spin rounded-full border-4 border-neutral-light border-t-primary"></div>
          <p className="mt-4">Cargando tableros…</p>
        </div>
      ) : myBoards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-light py-20">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <PlusIcon size={32} weight="duotone" className="text-primary" />
          </div>
          <p className="text-lg font-medium text-neutral-dark">No tienes tableros aún</p>
           <p className="mt-1 text-sm text-neutral-dark/60">
            Crea tu primer tablero para empezar a organizar
          </p>
          <Button className="mt-6" onClick={() => setShowCreate(true)}>
            <PlusIcon size={20} weight="duotone" /> Crear tablero
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {myBoards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onClick={() => navigate(`/boards/${board.id}`)}
            />
          ))}
        </div>
      )}

      <CreateBoardModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
