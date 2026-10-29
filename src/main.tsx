import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import AppTheme from "./theme/AppTheme";
import "./index.css";
import { startUsage } from "./platform/usage";
import { usePuzzleStore } from "./stores/puzzleStore";

// 익명 사용 통계: 오늘 연 것을 세고, 돌아올 때·내릴 때 쌓인 횟수를 보냅니다(설정에서 끔).
startUsage(() => usePuzzleStore.getState().settings.shareUsage);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppTheme>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppTheme>
  </StrictMode>,
);
