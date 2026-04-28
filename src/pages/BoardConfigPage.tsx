import { useEffect } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { useBoardStore } from "@/stores/boardStore";
import { useAuthStore } from "@/stores/authStore";
import { BoardConfigLayout } from "./config/BoardConfigLayout";
import { BoardGeneralPage } from "./config/BoardGeneralPage";
import { BoardMembersPage } from "./config/BoardMembersPage";
import { BoardPreferencesPage } from "./config/BoardPreferencesPage";

export function BoardConfigPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const setCurrentBoard = useBoardStore((s) => s.setCurrentBoard);
  const currentBoard = useBoardStore((s) => s.currentBoard);
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!boardId) return;
    void setCurrentBoard(boardId);
  }, [boardId, setCurrentBoard]);

  if (!boardId) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 text-surface-500">
        Tablero no válido.
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 text-surface-500">
        Cargando configuración del tablero…
      </div>
    );
  }

  const isOwner = currentUser?.id === currentBoard.ownerId;

  if (!isOwner) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 text-center text-surface-600">
        <p className="text-lg font-semibold text-surface-900">
          Acceso denegado
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