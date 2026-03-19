import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PlayerProfilePage } from "@/pages/PlayerProfilePage";
import { PlayersPage } from "@/pages/PlayersPage";
import { NewPlayerPage } from "@/pages/NewPlayerPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/player/new" element={<NewPlayerPage />} />
        <Route path="/player/:id" element={<PlayerProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
