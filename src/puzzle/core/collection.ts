// 레벨 별 기록: 레벨마다 가장 많이 받은 별을 남깁니다(2026-10-27 디저트 도감은 없앰).
/** 별 기록 합계 */
export function totalStarsOf(stars: Readonly<Record<string, number>>): number {
  return Object.values(stars).reduce((a, b) => a + b, 0);
}

/** 레벨 키: 쉬움은 예전 키("zones:3") 그대로, 다른 난이도는 "zones:normal:3" */
const tiered = (puzzle: string) => (level: number, tier: string = "easy") => (tier === "easy" ? `${puzzle}:${level}` : `${puzzle}:${tier}:${level}`);

/** 별 기록 키: 퍼즐과 레벨(스도쿠·다섯 퍼즐은 난이도까지) */
export const starKey = {
  sudoku: (difficulty: string, level: number) => `sudoku:${difficulty}:${level}`,
  zones: tiered("zones"),
  blocks: tiered("blocks"),
  sliding: tiered("sliding"),
  nonogram: tiered("nonogram"),
  escape: tiered("escape"),
};

/** 더 많이 받았을 때만 바꿉니다. */
export function keepBest(stars: Readonly<Record<string, number>>, key: string, got: number): Record<string, number> {
  return (stars[key] ?? 0) >= got ? { ...stars } : { ...stars, [key]: got };
}
