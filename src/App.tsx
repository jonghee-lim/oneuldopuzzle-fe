import { Navigate, Route, Routes } from "react-router-dom";
import EscapePage from "./pages/EscapePage";
import HomePage from "./pages/HomePage";
import NonogramPage from "./pages/NonogramPage";
import PlayPage from "./pages/PlayPage";
import RecordsPage from "./pages/RecordsPage";
import SettingsPage from "./pages/SettingsPage";
import ZonesPage from "./pages/ZonesPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/play" element={<PlayPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/zones" element={<ZonesPage />} />
      <Route path="/records" element={<RecordsPage />} />
      <Route path="/special/nonogram" element={<NonogramPage />} />
      <Route path="/special/escape" element={<EscapePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
