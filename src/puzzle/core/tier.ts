// 다섯 퍼즐(색깔 구역·블록 채우기·슬라이딩·노노그램·블록 탈출)의 난이도. 스도쿠처럼 직접 고르고,
// 레벨은 난이도마다 따로 이어집니다(2026-10-27 사용자 결정). 예전 진행은 '쉬움'으로 옮겼습니다(저장본 버전 5).
export const TIERS = ["easy", "normal", "hard"] as const;
export type Tier = (typeof TIERS)[number];
export const TIER_LABEL: Record<Tier, string> = { easy: "쉬움", normal: "보통", hard: "어려움" };

export type TierPuzzle = "zones" | "blocks" | "sliding" | "nonogram" | "escape";
export const TIER_PUZZLES: readonly TierPuzzle[] = ["zones", "blocks", "sliding", "nonogram", "escape"];

/** 난이도를 고른 적이 없으면 쉬움부터 */
export const DEFAULT_TIER: Tier = "easy";

/** 문제 씨앗: 쉬움은 예전 씨앗을 그대로 써서 옮긴 진행과 같은 판이 나오게 합니다. */
export function tierSeed(prefix: string, tier: Tier, level: number, sep = "-"): string {
  return tier === "easy" ? `${prefix}${sep}${level}` : `${prefix}${sep}${tier}${sep}${level}`;
}
