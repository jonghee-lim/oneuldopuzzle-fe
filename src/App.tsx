import { Navigate, Route, Routes } from "react-router-dom";
import EscapePage from "./pages/EscapePage";
import HomePage from "./pages/HomePage";
import NonogramPage from "./pages/NonogramPage";
import PlayPage from "./pages/PlayPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/play" element={<PlayPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/special/nonogram" element={<NonogramPage />} />
      <Route path="/special/escape" element={<EscapePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
