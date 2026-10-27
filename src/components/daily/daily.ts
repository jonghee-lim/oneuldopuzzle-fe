// 오늘의 퍼즐 화면 공통: 주소에 ?daily가 붙으면 오늘의 퍼즐 판을 엽니다.
import { useSearchParams } from "react-router-dom";
import { dailyKinds, type DailyKind } from "../../puzzle/core/daily";
import { DAILY_KIND_NAME, type DailyResult } from "../../puzzle/core/share";
import type { PuzzleState } from "../../stores/puzzleStore";

export const DAILY_ROUTE: Record<DailyKind, string> = {
  sudoku: "/play?daily",
  zones: "/zones?daily",
  blocks: "/blocks?daily",
  sliding: "/sliding?daily",
};

export const DAILY_NAME = DAILY_KIND_NAME;

export function useIsDaily(): boolean {
  const [params] = useSearchParams();
  return params.has("daily");
}

/** 오늘의 퍼즐 판마다 결과(푼 판만 시간, 힌트·'틀린 칸 보기'를 썼는지) */
export function dailyResults(s: Pick<PuzzleState, "dailyDate" | "dailyDone" | "dailySudoku" | "dailyZone" | "dailyBlocks" | "dailySlide">): DailyResult[] {
  if (!s.dailyDate) return [];
  return dailyKinds(s.dailyDate).map((kind) => {
    const game = kind === "sudoku" ? s.dailySudoku : kind === "zones" ? s.dailyZone : kind === "blocks" ? s.dailyBlocks : s.dailySlide;
    const done = s.dailyDone.includes(kind) && !!game;
    const helped = !!game?.usedHint || (kind === "sudoku" && !!s.dailySudoku?.usedCheck);
    return { kind, seconds: done ? game.elapsedSeconds : null, helped };
  });
}
