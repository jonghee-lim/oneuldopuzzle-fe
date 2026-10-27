// 색깔 구역 퍼즐 생성기: 디저트 자리를 먼저 정하고 그 자리에서 구역을 키운 뒤,
// 답이 정확히 하나이고 찍지 않고 풀리는 판만 내보냅니다(설계서: 틀린 문제는 하나도 내보내지 않는다).
import { tierSeed, type Tier } from "../core/tier.ts";
import { createRng, seedFrom, shuffle, type Rng } from "../core/rng.ts";
import type { ZonePuzzle } from "./rules.ts";
import { logicGrade, solveZones } from "./solver.ts";

function placement(size: number, rng: Rng): number[] | null {
  const cols: number[] = [];
  const used = new Set<number>();
  const go = (row: number): boolean => {
    if (row === size) return true;
    for (const c of shuffle(Array.from({ length: size }, (_, k) => k), rng)) {
      if (used.has(c) || (row > 0 && Math.abs(cols[row - 1] - c) <= 1)) continue;
      cols.push(c);
      used.add(c);
      if (go(row + 1)) return true;
      cols.pop();
      used.delete(c);
    }
    return false;
  };
  return go(0) ? cols : null;
}

/** 디저트 칸에서 시작해 구역을 무작위로 넓힙니다. */
function growRegions(size: number, seeds: number[], rng: Rng): number[] {
  const regions = new Array<number>(size * size).fill(-1);
  seeds.forEach((cell, k) => (regions[cell] = k));
  let frontier = seeds.slice();
  while (regions.includes(-1)) {
    const next: number[] = [];
    for (const cell of shuffle(frontier.slice(), rng)) {
      const r = Math.floor(cell / size);
      const c = cell % size;
      const around = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ].filter(([y, x]) => y >= 0 && y < size && x >= 0 && x < size);
      for (const [y, x] of shuffle(around, rng)) {
        const j = y * size + x;
        // 구역마다 크기가 고르지 않게 가끔 건너뜁니다(모양이 다양해야 풀 맛이 납니다).
        if (regions[j] === -1 && rng() < 0.55) {
          regions[j] = regions[cell];
          next.push(j);
        }
      }
      next.push(cell);
    }
    frontier = next;
  }
  return regions;
}

/** 구역이 끊기지 않고 한 덩어리인지 */
function connected(size: number, regions: readonly number[], region: number): boolean {
  const cells = regions.flatMap((r, i) => (r === region ? [i] : []));
  if (cells.length === 0) return false;
  const seen = new Set([cells[0]]);
  const stack = [cells[0]];
  while (stack.length) {
    const i = stack.pop()!;
    const r = Math.floor(i / size);
    const c = i % size;
    for (const j of [r > 0 ? i - size : -1, r < size - 1 ? i + size : -1, c > 0 ? i - 1 : -1, c < size - 1 ? i + 1 : -1]) {
      if (j >= 0 && regions[j] === region && !seen.has(j)) {
        seen.add(j);
        stack.push(j);
      }
    }
  }
  return seen.size === cells.length;
}

/**
 * 답이 여럿이면 다른 답의 디저트 칸 하나를 이웃 구역으로 넘겨 그 답을 막습니다. 답이 하나가 될 때까지 되풀이합니다.
 * 정한 답(seeds)은 늘 지켜지도록 디저트 칸 자체는 옮기지 않습니다.
 */
function repair(size: number, regions: number[], seeds: readonly number[], rng: Rng): boolean {
  const seedSet = new Set(seeds);
  for (let step = 0; step < 60; step += 1) {
    const { count, solutions } = solveZones(size, regions, 2);
    if (count === 1) return true;
    if (count === 0) return false;
    const other = solutions.find((s) => s.some((c, r) => r * size + c !== seeds[r]))!;
    const cells = shuffle(other.map((c, r) => r * size + c).filter((i) => !seedSet.has(i)), rng);
    let moved = false;
    for (const i of cells) {
      const r = Math.floor(i / size);
      const c = i % size;
      const around = shuffle([r > 0 ? i - size : -1, r < size - 1 ? i + size : -1, c > 0 ? i - 1 : -1, c < size - 1 ? i + 1 : -1].filter((j) => j >= 0), rng);
      for (const j of around) {
        if (regions[j] === regions[i]) continue;
        const before = regions[i];
        regions[i] = regions[j];
        if (connected(size, regions, before)) {
          moved = true;
          break;
        }
        regions[i] = before;
      }
      if (moved) break;
    }
    if (!moved) return false;
  }
  return false;
}

export function generateZones(seed: string, size: number, minGrade = 1, tries = 400): ZonePuzzle {
  const rng = createRng(seedFrom(seed));
  for (let t = 0; t < tries; t += 1) {
    const cols = placement(size, rng);
    if (!cols) continue;
    const seeds = cols.map((c, r) => r * size + c);
    const regions = growRegions(size, seeds, rng);
    if (!repair(size, regions, seeds, rng)) continue;
    // 한 칸짜리 구역은 보자마자 답이 보여 큰 판에서는 빼고, 찍지 않고 풀리는 판만 씁니다.
    if (size >= 6 && regions.some((_, k) => k < size && regions.filter((r) => r === k).length < 2)) continue;
    const grade = logicGrade(size, regions);
    if (grade === 0 || grade < minGrade) continue;
    return { id: `${seed}`, size, regions, solution: cols };
  }
  throw new Error(`색깔 구역 퍼즐을 만들지 못했습니다: ${seed}`);
}

/** 난이도마다 판 크기: 쉬움 5×5(처음 세 판)·6×6, 보통 7×7, 어려움 8×8 */
export function zoneSizeForLevel(level: number, tier: Tier = "easy"): number {
  if (tier === "hard") return 8;
  if (tier === "normal") return 7;
  return level <= 3 ? 5 : 6;
}

export function zonesForLevel(level: number, tier: Tier = "easy"): ZonePuzzle {
  // 쉬움 처음 세 판 말고는 '몰린 자리' 추론이 한 번은 필요한 판만 씁니다(너무 쉬우면 재미가 없습니다).
  return generateZones(tierSeed("zones", tier, level), zoneSizeForLevel(level, tier), tier === "easy" && level <= 3 ? 1 : 2);
}
