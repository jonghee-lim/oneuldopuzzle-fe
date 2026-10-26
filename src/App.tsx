import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { setupNative } from "./platform/native";
import BlocksPage from "./pages/BlocksPage";
import EscapePage from "./pages/EscapePage";
import HomePage from "./pages/HomePage";
import NonogramPage from "./pages/NonogramPage";
import PlayPage from "./pages/PlayPage";
import RecordsPage from "./pages/RecordsPage";
import SettingsPage from "./pages/SettingsPage";
import SlidingPage from "./pages/SlidingPage";
import ZonesPage from "./pages/ZonesPage";

export default function App() {
  const navigate = useNavigate();

  // 안드로이드 뒤로 가기: 화면 위 뒤로 버튼처럼 처음 화면으로, 처음 화면이면 앱을 닫습니다.
  useEffect(() => {
    void setupNative(() => {
      if (window.location.pathname === "/") return false;
      navigate("/");
      return true;
    });
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/play" element={<PlayPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/zones" element={<ZonesPage />} />
      <Route path="/sliding" element={<SlidingPage />} />
      <Route path="/blocks" element={<BlocksPage />} />
      <Route path="/records" element={<RecordsPage />} />
      <Route path="/special/nonogram" element={<NonogramPage />} />
      <Route path="/special/escape" element={<EscapePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
