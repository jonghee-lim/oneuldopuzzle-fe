import { useShallow } from "zustand/react/shallow";
import type { TierPuzzle } from "../../puzzle/core/tier";
import { tierNext, usePuzzleStore } from "../../stores/puzzleStore";

/** 고른 난이도와 그 난이도의 다음 레벨 */
export function useTierNext(puzzle: TierPuzzle) {
  return usePuzzleStore(useShallow((s) => tierNext(s, puzzle)));
}

/** 풀이 화면을 열 때: 지금 판이 고른 난이도·다음 레벨이 아니면 새로 준비합니다(방금 푼 판은 완성 창을 보여 주려고 그대로 둠). */
export function needsStart(current: { level: number; tier?: string } | null, done: boolean, next: { tier: string; level: number }): boolean {
  return !current || (!done && (current.level !== next.level || (current.tier ?? "easy") !== next.tier));
}
