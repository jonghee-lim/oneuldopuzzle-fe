import { useNavigate } from "react-router-dom";
import { dailyKinds, streakOf } from "../../puzzle/core/daily";
import { formatTime } from "../../puzzle/sudoku/game";
import { usePuzzleStore } from "../../stores/puzzleStore";
import { DAILY_ROUTE } from "./daily";

/** 오늘의 퍼즐 완성 창 문구와 '다음 오늘의 퍼즐' 버튼 */
export function useDailyClear(seconds: number) {
  const navigate = useNavigate();
  const date = usePuzzleStore((s) => s.dailyDate);
  const done = usePuzzleStore((s) => s.dailyDone);
  const days = usePuzzleStore((s) => s.dailyDays);
  const reward = usePuzzleStore((s) => s.lastHintReward);
  const kinds = date ? dailyKinds(date) : [];
  const next = kinds.find((k) => !done.includes(k));
  const allDone = !!date && kinds.length > 0 && !next;
  return {
    title: allDone ? "오늘의 퍼즐 모두 완성!" : "오늘의 퍼즐 완성!",
    detail: `걸린 시간 ${formatTime(seconds)} · 힌트 +${reward}개${allDone && date ? ` · 연속 ${streakOf(days, date)}일` : ""}`,
    nextLabel: next ? `다음 오늘의 퍼즐 (${done.length}/${kinds.length})` : undefined,
    onNext: next ? () => navigate(DAILY_ROUTE[next], { replace: true }) : undefined,
  };
}
