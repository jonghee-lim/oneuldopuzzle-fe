import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import { Snackbar } from "@mui/material";
import { useState } from "react";
import { cue } from "../../platform/feedback";
import { usePuzzleStore } from "../../stores/puzzleStore";
import ToolButton from "./ToolButton";

/**
 * 힌트 버튼과 설명 알림. give(찾기, 반영, 설명)으로 힌트를 하나 씁니다.
 * 힌트는 틀린 곳이 있으면 그곳부터 고치고, 없으면 다음 한 수를 놓아 줍니다(퍼즐마다 src/puzzle/<퍼즐>의 힌트 함수).
 */
export function useHint() {
  const hints = usePuzzleStore((s) => s.hints);
  const spendHint = usePuzzleStore((s) => s.spendHint);
  const [message, setMessage] = useState<string | null>(null);

  function give<H>(find: () => H | null, apply: (hint: H) => void, describe: (hint: H) => string) {
    const hint = find();
    if (hint === null || hint === undefined) return;
    if (!spendHint()) {
      setMessage("힌트를 다 썼어요. 오늘의 퍼즐을 풀면 힌트를 받아요.");
      return;
    }
    apply(hint);
    cue("place");
    setMessage(describe(hint));
  }

  const button = (onClick: () => void) => (
    <ToolButton label={`힌트 ${hints}`} onClick={onClick} icon={<LightbulbOutlinedIcon sx={{ fontSize: 18 }} />} />
  );
  const toast = (
    <Snackbar
      open={!!message}
      autoHideDuration={4000}
      onClose={(_, reason) => reason !== "clickaway" && setMessage(null)}
      message={message}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ top: "calc(env(safe-area-inset-top) + 12px)" }}
    />
  );
  return { hints, give, button, toast };
}
