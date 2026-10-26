// 색깔 구역 퍼즐(설계서 보너스 1번, 미야오도쿠류): N×N 판이 N개 색깔 구역으로 나뉘고,
// 줄마다·칸줄마다·구역마다 디저트를 정확히 하나씩 놓습니다. 디저트끼리는 대각선으로도 붙을 수 없습니다.

export interface ZonePuzzle {
  id: string;
  size: number;
  /** 칸별 구역 번호(0..size-1) */
  regions: number[];
  /** 줄마다 디저트가 놓인 칸줄 */
  solution: number[];
}

/** 서로 붙어 있는지(대각선 포함, 같은 칸 제외) */
export function touching(size: number, a: number, b: number): boolean {
  const dr = Math.abs(Math.floor(a / size) - Math.floor(b / size));
  const dc = Math.abs((a % size) - (b % size));
  return a !== b && dr <= 1 && dc <= 1;
}

/** 놓은 디저트(칸 번호들) 중 규칙에 어긋난 것 */
export function zoneConflicts(size: number, regions: readonly number[], placed: readonly number[]): Set<number> {
  const bad = new Set<number>();
  for (let i = 0; i < placed.length; i += 1) {
    for (let j = i + 1; j < placed.length; j += 1) {
      const a = placed[i];
      const b = placed[j];
      const sameRow = Math.floor(a / size) === Math.floor(b / size);
      const sameCol = a % size === b % size;
      if (sameRow || sameCol || regions[a] === regions[b] || touching(size, a, b)) {
        bad.add(a);
        bad.add(b);
      }
    }
  }
  return bad;
}

/** 놓은 디저트가 완성된 답인지(수가 맞고 어긋난 것이 없으면 답이 하나라 곧 정답) */
export function isZoneSolved(size: number, regions: readonly number[], placed: readonly number[]): boolean {
  return placed.length === size && zoneConflicts(size, regions, placed).size === 0;
}
