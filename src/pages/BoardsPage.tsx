import { useEffect, useState } from 'react'
import { useBoardStore } from '@/stores/boardStore'
import { useAuthStore } from '@/stores/authStore'
import { BoardCard } from '@/features/boards/components/BoardCard'
import { CreateBoardModal } from '@/features/boards/components/CreateBoardModal'
import { Button } from '@/shared/components/Button'
import { Plus } from '@phosphor-icons/react'

interface BoardsPageProps {
  onSelectBoard: (boardId: string) => void
}

export function BoardsPage({ onSelectBoard }: BoardsPageProps) {
  const [showCreate, setShowCreate] = useState(false)
  const boards = useBoardStore((s) => s.boards)
  const loading = useBoardStore((s) => s.loading)
  const error = useBoardStore((s) => s.error)
  const hydrateBoards = useBoardStore((s) => s.hydrateBoards)
  const createBoard = useBoardStore((s) => s.createBoard)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    void hydrateBoards()
  }, [hydrateBoards])

  // El backend ya devuelve solo los boards donde el usuario es miembro.
  const myBoards = boards

  const handleCreate = async (name: string, background: string) => {
    if (!user) return
    try {
      await createBoard(name, background)
    } catch (err) {
      console.error('createBoard failed', err)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">Mis Tableros</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={20} weight="duotone" /> Nuevo tablero
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && myBoards.length === 0 ? (
        <div className="py-16 text-center text-surface-400">Cargando tableros…</div>
      ) : myBoards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-200 py-16">
          <p className="text-lg text-surface-400">No tienes tableros aún</p>
          <p className="mt-1 text-sm text-surface-400">Crea tu primer tablero para empezar a organizar</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}>
            <Plus size={20} weight="duotone" /> Crear tablero
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {myBoards.map((board) => (
            <BoardCard key={board.id} board={board} onClick={() => onSelectBoard(board.id)} />
          ))}
        </div>
      )}

      <CreateBoardModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}
