// 색깔 구역 퍼즐 검사기: 답을 limit개까지 세고, 찍지 않고 논리로만 풀리는지도 봅니다.
import { touching } from "./rules.ts";

export interface ZoneSolveResult {
  count: number;
  /** 줄마다 디저트 칸줄 */
  solution: number[] | null;
  /** 찾은 답들(최대 limit개) */
  solutions: number[][];
}

export function solveZones(size: number, regions: readonly number[], limit = 2): ZoneSolveResult {
  const cols = new Array<number>(size).fill(-1);
  const usedCol = new Array<boolean>(size).fill(false);
  const usedRegion = new Array<boolean>(size).fill(false);
  let count = 0;
  const solutions: number[][] = [];
  const go = (row: number) => {
    if (count >= limit) return;
    if (row === size) {
      count += 1;
      solutions.push(cols.slice());
      return;
    }
    for (let c = 0; c < size; c += 1) {
      const region = regions[row * size + c];
      if (usedCol[c] || usedRegion[region]) continue;
      if (row > 0 && Math.abs(cols[row - 1] - c) <= 1) continue;
      cols[row] = c;
      usedCol[c] = true;
      usedRegion[region] = true;
      go(row + 1);
      usedCol[c] = false;
      usedRegion[region] = false;
    }
  };
  go(0);
  return { count, solution: solutions[0] ?? null, solutions };
}

/**
 * 사람이 하는 추론만으로 풀리는지 봅니다. 쓰는 방법:
 * 1) 줄·칸줄·구역에 남은 자리가 하나면 놓기, 2) 한 구역의 남은 자리가 모두 한 줄(칸줄)에 있으면 그 줄의 다른 칸 지우기,
 * 3) 어떤 칸에 놓으면 다른 줄·칸줄·구역의 자리가 하나도 안 남는다면 그 칸 지우기.
 * 돌려주는 값은 쓴 방법 중 가장 어려운 단계(1~3), 풀리지 않으면 0입니다.
 */
export function logicGrade(size: number, regions: readonly number[]): number {
  const n = size * size;
  const open = new Array<boolean>(n).fill(true);
  const placed = new Array<boolean>(n).fill(false);
  const groups: number[][] = [];
  for (let r = 0; r < size; r += 1) groups.push(Array.from({ length: size }, (_, c) => r * size + c));
  for (let c = 0; c < size; c += 1) groups.push(Array.from({ length: size }, (_, r) => r * size + c));
  for (let g = 0; g < size; g += 1) groups.push(regions.flatMap((reg, i) => (reg === g ? [i] : [])));
  const groupsOf = Array.from({ length: n }, (_, i) => groups.filter((g) => g.includes(i)));

  const place = (i: number) => {
    placed[i] = true;
    for (const g of groupsOf[i]) for (const j of g) if (j !== i) open[j] = false;
    for (let j = 0; j < n; j += 1) if (touching(size, i, j)) open[j] = false;
  };
  const left = (g: number[]) => g.filter((i) => open[i] && !placed[i]);
  const done = (g: number[]) => g.some((i) => placed[i]);
  let hardest = 0;

  for (let guard = 0; guard < 500; guard += 1) {
    if (placed.filter(Boolean).length === size) return Math.max(hardest, 1);
    let progressed = false;
    // 1) 하나 남은 자리
    for (const g of groups) {
      if (done(g)) continue;
      const l = left(g);
      if (l.length === 0) return 0;
      if (l.length === 1) {
        place(l[0]);
        progressed = true;
        break;
      }
    }
    if (progressed) continue;
    // 2) 구역 자리가 한 줄(칸줄)에 몰림 → 그 줄의 다른 칸 지우기(줄·칸줄 묶음 사이에도 똑같이)
    for (const g of groups) {
      if (done(g)) continue;
      const l = left(g);
      for (const h of groups) {
        if (h === g || done(h)) continue;
        if (l.every((i) => h.includes(i))) {
          for (const j of left(h)) {
            if (!l.includes(j)) {
              open[j] = false;
              progressed = true;
            }
          }
        }
      }
      if (progressed) break;
    }
    if (progressed) {
      hardest = Math.max(hardest, 2);
      continue;
    }
    // 3) 놓아 보면 다른 묶음이 막히는 칸 지우기
    for (let i = 0; i < n && !progressed; i += 1) {
      if (!open[i] || placed[i]) continue;
      const blocked = new Set<number>([i]);
      for (const g of groupsOf[i]) for (const j of g) blocked.add(j);
      for (let j = 0; j < n; j += 1) if (touching(size, i, j)) blocked.add(j);
      const breaks = groups.some((g) => !groupsOf[i].includes(g) && !done(g) && left(g).every((j) => blocked.has(j)));
      if (breaks) {
        open[i] = false;
        progressed = true;
      }
    }
    if (progressed) {
      hardest = 3;
      continue;
    }
    return 0;
  }
  return 0;
}
