// 레벨 별 기록: 레벨마다 가장 많이 받은 별을 남깁니다(2026-10-27 디저트 도감은 없앰).
/** 별 기록 합계 */
export function totalStarsOf(stars: Readonly<Record<string, number>>): number {
  return Object.values(stars).reduce((a, b) => a + b, 0);
}

/** 별 기록 키: 퍼즐과 레벨(스도쿠는 난이도까지) */
export const starKey = {
  sudoku: (difficulty: string, level: number) => `sudoku:${difficulty}:${level}`,
  zones: (level: number) => `zones:${level}`,
  blocks: (level: number) => `blocks:${level}`,
  sliding: (level: number) => `sliding:${level}`,
  nonogram: (stage: number) => `nonogram:${stage}`,
  escape: (stage: number) => `escape:${stage}`,
};

/** 더 많이 받았을 때만 바꿉니다. */
export function keepBest(stars: Readonly<Record<string, number>>, key: string, got: number): Record<string, number> {
  return (stars[key] ?? 0) >= got ? { ...stars } : { ...stars, [key]: got };
}
