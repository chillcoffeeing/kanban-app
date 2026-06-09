import { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Header } from "@/shared/components/Header";
import { Footer } from "@/shared/components/Footer";
import { useApplySettings } from "@/shared/hooks/useApplySettings";
import { usePersistSettings } from "@/shared/hooks/usePersistSettings";
import { useSocket } from "@/shared/hooks/useSocket";
import { usePermissionDenied } from "@/shared/hooks/usePermissionDenied";
import { PermissionDeniedModal } from "@/shared/components/PermissionDeniedModal";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { AnimatedBg } from "@/shared/components/AnimatedBg";
import { ToastContainer } from "@/shared/components/ToastContainer";
import { PublicLayout } from "@/pages/PublicLayout";
import { AuthPage } from "@/pages/AuthPage";
import { LandingPage } from "@/pages/LandingPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { BoardsPage } from "@/pages/BoardsPage";
import { BoardRoute } from "@/pages/BoardRoute";
import { BoardConfigPage } from "@/pages/BoardConfigPage";
import { UserConfigPage } from "@/pages/UserConfigPage";
import { InvitationsPage } from "@/pages/InvitationsPage";
import { initActivityIntegration } from "@/features/activity/activityIntegration";

function App() {
  usePersistSettings();
  useApplySettings();
  useSocket();

  useEffect(() => {
    const cleanup = initActivityIntegration();
    return () => cleanup();
  }, []);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrate = useAuthStore((state) => state.hydrate);
  const location = useLocation();
  const navigate = useNavigate();
  const { pendingRequest, sendRequest, dismiss, isSubmitting, alreadyPending } =
    usePermissionDenied();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const isLandingOrLogin =
    location.pathname === "/" || location.pathname === "/login";

  return (
    <ErrorBoundary>
      <div className="mx-auto flex min-h-screen w-full flex-col">
        <AnimatedBg />
        <ToastContainer />
        {pendingRequest && (
          <PermissionDeniedModal
            request={pendingRequest}
            onSendRequest={sendRequest}
            onDismiss={dismiss}
            isSubmitting={isSubmitting}
            alreadyPending={alreadyPending}
          />
        )}
        {isAuthenticated && !isLandingOrLogin && <Header />}
        <main className="flex flex-1 flex-col">
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/boards" replace />
                  ) : (
                    <AuthPage />
                  )
                }
              />
              <Route
                path="/register"
                element={
                  isAuthenticated ? (
                    <Navigate to="/boards" replace />
                  ) : (
                    <RegisterPage />
                  )
                }
              />
            </Route>

            {isAuthenticated ? (
              <>
                <Route path="/invitations" element={<InvitationsPage />} />
                <Route path="/config/*" element={<UserConfigPage />} />
                <Route
                  path="/boards/:boardId/config/*"
                  element={<BoardConfigPage />}
                />
                <Route path="/boards/:boardId" element={<BoardRoute />} />
                <Route path="/board/:boardId" element={<BoardRoute />} />
                <Route path="/boards" element={<BoardsPage />} />
                <Route path="*" element={<Navigate to="/boards" replace />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/" replace />} />
            )}
          </Routes>
        </main>
        {isAuthenticated && location.pathname === "/boards" && <Footer />}
      </div>
    </ErrorBoundary>
  );
}

export default App;
