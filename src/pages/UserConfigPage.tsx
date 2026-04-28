import { Routes, Route, Navigate } from "react-router-dom";
import { UserConfigLayout } from "./config/UserConfigLayout";
import { UserProfilePage } from "./config/UserProfilePage";
import { UserAppearancePage } from "./config/UserAppearancePage";
import { UserNotificationsPage } from "./config/UserNotificationsPage";
import { UserPrivacyPage } from "./config/UserPrivacyPage";

export function UserConfigPage() {
  return (
    <Routes>
      <Route element={<UserConfigLayout />}>
        <Route index element={<Navigate to="perfil" replace />} />
        <Route path="perfil" element={<UserProfilePage />} />
        <Route path="apariencia" element={<UserAppearancePage />} />
        <Route path="notificaciones" element={<UserNotificationsPage />} />
        <Route path="privacidad" element={<UserPrivacyPage />} />
      </Route>
    </Routes>
  );
}