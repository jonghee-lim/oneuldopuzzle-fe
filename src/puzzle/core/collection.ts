// 디저트 도감: 별을 모으면 도감 순서대로 하나씩 열리고, 오늘의 퍼즐 세 판을 다 풀면 그날의 디저트를 받습니다(받으면 바로 열림).
export const STARS_PER_DESSERT = 6;

/** 별로 열린 디저트 수(첫 디저트는 처음부터 열림) */
export function unlockedByStars(totalStars: number, dessertCount: number): number {
  return Math.min(dessertCount, 1 + Math.floor(totalStars / STARS_PER_DESSERT));
}

/** 다음 디저트가 열리는 별 수(다 열렸으면 null) */
export function nextUnlockAt(totalStars: number, dessertCount: number): number | null {
  const open = unlockedByStars(totalStars, dessertCount);
  return open >= dessertCount ? null : open * STARS_PER_DESSERT;
}

export function isUnlocked(index: number, id: string, totalStars: number, dessertCount: number, received: Readonly<Record<string, number>>): boolean {
  return index < unlockedByStars(totalStars, dessertCount) || (received[id] ?? 0) > 0;
}

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
