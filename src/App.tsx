import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Header } from "@/shared/components/Header";
import { Footer } from "@/shared/components/Footer";
import { useApplySettings } from "@/shared/hooks/useApplySettings";
import { useSocket } from "@/shared/hooks/useSocket";
import { AuthPage } from "@/pages/AuthPage";
import { BoardsPage } from "@/pages/BoardsPage";
import { BoardRoute } from "@/pages/BoardRoute";
import { BoardConfigPage } from "@/pages/BoardConfigPage";
import { UserConfigPage } from "@/pages/UserConfigPage";
import { InvitationsPage } from "@/pages/InvitationsPage";

function App() {
  useApplySettings();
  useSocket(); // Connect to WebSocket when authenticated
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const location = useLocation();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col">
        <Routes>
          <Route path="/invitations" element={<InvitationsPage />} />
          <Route path="/config/*" element={<UserConfigPage />} />
          <Route path="/boards/:boardId/config/*" element={<BoardConfigPage />} />
          <Route path="/boards/:boardId" element={<BoardRoute />} />
          <Route path="/board/:boardId" element={<BoardRoute />} />
          <Route path="/boards" element={<BoardsPage />} />
          <Route path="/" element={<Navigate to="/boards" replace />} />
          <Route path="*" element={<Navigate to="/boards" replace />} />
        </Routes>
      </main>
      {location.pathname === "/boards" && <Footer />}
    </div>
  );
}

export default App;
