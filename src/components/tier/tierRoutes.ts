import type { TierPuzzle } from "../../puzzle/core/tier";

/** 다섯 퍼즐의 난이도 고르는 화면(스도쿠의 /sudoku에 해당)과 풀이 화면 */
export const TIER_ROUTE: Record<TierPuzzle, string> = {
  zones: "/levels/zones",
  blocks: "/levels/blocks",
  sliding: "/levels/sliding",
  nonogram: "/levels/nonogram",
  escape: "/levels/escape",
};

export const TIER_PLAY_ROUTE: Record<TierPuzzle, string> = {
  zones: "/zones",
  blocks: "/blocks",
  sliding: "/sliding",
  nonogram: "/special/nonogram",
  escape: "/special/escape",
};
