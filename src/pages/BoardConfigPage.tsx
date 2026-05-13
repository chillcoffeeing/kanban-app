import { useEffect } from "react";
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useBoardStore } from "@/stores/boardStore";
import { useAuthStore } from "@/stores/authStore";
import { BoardConfigLayout } from "./config/BoardConfigLayout";
import { BoardGeneralPage } from "./config/BoardGeneralPage";
import { BoardMembersPage } from "./config/BoardMembersPage";
import { BoardPreferencesPage } from "./config/BoardPreferencesPage";

export function BoardConfigPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const setCurrentBoard = useBoardStore((boardState) => boardState.setCurrentBoard);
  const currentBoard = useBoardStore((boardState) => boardState.currentBoard);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!boardId) return;
    void setCurrentBoard(boardId);
  }, [boardId, setCurrentBoard]);

  if (!boardId) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 text-neutral-dark">
        Tablero no válido.
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 text-neutral-dark">
        Cargando configuración del tablero…
      </div>
    );
  }

  const isOwner = currentBoard?.members?.some(m => m.user?.id === currentUser?.id && m.role === 'owner');

  if (!isOwner) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(`/boards/${boardId}`)}
          className="flex items-center gap-1 text-neutral-dark/70 hover:text-primary transition-colors"
        >
          <ArrowLeftIcon size={20} weight="duotone" />
          <span>Volver al tablero</span>
        </button>
      </div>
      <h1 className="text-2xl font-semibold text-neutral-dark">
        Configuración del tablero
      </h1>
      <p className="mt-1 mb-6 text-sm text-neutral-dark/60">
        Ajustes y miembros del tablero.
      </p>
        <p className="mt-2">
          Solo el propietario del tablero puede acceder a esta configuración.
        </p>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<BoardConfigLayout boardId={boardId} />}>
        <Route index element={<Navigate to="general" replace />} />
        <Route path="general" element={<BoardGeneralPage />} />
        <Route path="miembros" element={<BoardMembersPage />} />
        <Route path="preferencias" element={<BoardPreferencesPage />} />
      </Route>
    </Routes>
  );
}
