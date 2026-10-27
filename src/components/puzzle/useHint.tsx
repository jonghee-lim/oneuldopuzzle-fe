import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import { Snackbar } from "@mui/material";
import { useState } from "react";
import { cue } from "../../platform/feedback";
import type { HintStep } from "../../puzzle/core/hint";
import { usePuzzleStore } from "../../stores/puzzleStore";
import ToolButton from "./ToolButton";

interface Shown {
  /** 같은 힌트를 이어서 누르는지 알아보는 값 */
  key: string;
  /** 보여 준 판(판이 바뀌면 단계를 처음부터) */
  board: unknown;
  stage: number;
  cells: number[];
}

/**
 * 힌트 버튼과 설명 알림. 힌트는 틀린 곳이 있으면 그곳부터, 없으면 다음 한 수(퍼즐마다 src/puzzle/<퍼즐>의 힌트 함수).
 * 누를 때마다 '볼 곳 → 이유'를 차례로 비춰 주고(힌트를 쓰지 않음), 그다음 누르면 대신 해 주며 힌트 1개를 씁니다(2026-10-27).
 * board에는 지금 판의 놓인 내용(문자열 등, 시간은 빼고)을 넘깁니다. 바뀌면 비춘 칸을 지우고 단계를 처음부터 다시 셉니다.
 * size(판 한 변 칸 수)를 주면 설명이 비춘 칸을 가리지 않게, 비춘 곳이 판 위쪽이면 설명을 화면 아래에 띄웁니다.
 */
export function useHint(board: unknown, size = 0) {
  const hints = usePuzzleStore((s) => s.hints);
  const spendHint = usePuzzleStore((s) => s.spendHint);
  const [message, setMessage] = useState<string | null>(null);
  const [shown, setShown] = useState<Shown | null>(null);
  const current = shown && shown.board === board ? shown : null;
  const focusTop = !!current && size > 0 && current.cells.reduce((a, i) => a + Math.floor(i / size), 0) / current.cells.length < size / 2;

  function give<H>(find: () => H | null, steps: (hint: H) => HintStep[], apply: (hint: H) => void, describe: (hint: H) => string) {
    const hint = find();
    if (hint === null || hint === undefined) return;
    const key = JSON.stringify(hint);
    const list = steps(hint);
    const stage = current && current.key === key ? current.stage + 1 : 0;
    if (stage < list.length) {
      const last = stage === list.length - 1;
      setShown({ key, board, stage, cells: list[stage].cells });
      setMessage(`${list[stage].text}${last ? " 힌트를 한 번 더 누르면 대신 해 줘요(힌트 1개)." : ""}`);
      cue("tap");
      return;
    }
    if (!spendHint()) {
      setMessage("힌트를 다 썼어요. 비춘 곳을 보고 직접 풀어 보세요. 오늘의 퍼즐을 풀면 힌트를 받아요.");
      return;
    }
    setShown(null);
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
      autoHideDuration={6000}
      onClose={(_, reason) => reason !== "clickaway" && setMessage(null)}
      message={message}
      anchorOrigin={{ vertical: focusTop ? "bottom" : "top", horizontal: "center" }}
      sx={focusTop ? { bottom: "calc(env(safe-area-inset-bottom) + 12px)" } : { top: "calc(env(safe-area-inset-top) + 12px)" }}
    />
  );
  return { hints, give, button, toast, focus: current?.cells ?? null };
}
