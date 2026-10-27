// 노노그램 끝없는 레벨(2026-10-27 사용자 결정). 손으로 그린 디저트 그림은 정해 둔 레벨에 두고,
// 나머지 레벨은 좌우가 맞는 무늬를 무작위로 그린 뒤 답이 하나이고 줄 풀기만으로 풀리는 판만 씁니다.
import { tierSeed, type Tier } from "../core/tier.ts";
import { createRng, seedFrom, type Rng } from "../core/rng.ts";
import { NONOGRAMS } from "./puzzles.ts";
import { cluesOf, type NonogramPicture } from "./rules.ts";
import { solveNonogram } from "./solver.ts";

/** 난이도마다 손으로 그린 그림이 나오는 레벨(그림 크기가 그 난이도 판 크기와 같음) */
export const PICTURE_LEVELS: Readonly<Record<Tier, Readonly<Record<number, string>>>> = { easy: { 1: "heart" }, normal: {}, hard: { 1: "cupcake", 10: "strawberry" } };

export function pictureAt(level: number, tier: Tier = "easy"): string | undefined {
  return PICTURE_LEVELS[tier][level];
}

/** 난이도마다 판 크기: 쉬움 5×5, 보통 7×7, 어려움 10×10 */
export function nonogramSizeForLevel(_level: number, tier: Tier = "easy"): number {
  return tier === "hard" ? 10 : tier === "normal" ? 7 : 5;
}

/** 좌우 대칭 무늬. 이웃이 많은 칸은 칠하고 적은 칸은 비워 덩어리가 지게 합니다. */
function drawPattern(size: number, rng: Rng): number[] {
  const half = Math.ceil(size / 2);
  const density = 0.5 + rng() * 0.15;
  let grid: number[] = Array.from({ length: size * size }, (_, i) => {
    const c = i % size;
    return c < half ? (rng() < density ? 1 : 0) : 0;
  });
  const at = (g: number[], r: number, c: number) => (r >= 0 && r < size && c >= 0 && c < size ? g[r * size + c] : 0);
  const smooth = (g: number[]) =>
    g.map((v, i) => {
      const r = Math.floor(i / size);
      const c = i % size;
      if (c >= half) return 0;
      let n = 0;
      for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) if (dr || dc) n += at(g, r + dr, c + dc);
      return n >= 5 ? 1 : n <= 2 ? 0 : v;
    });
  grid = smooth(grid);
  // 오른쪽 절반은 왼쪽을 거울처럼 비춥니다.
  return grid.map((v, i) => {
    const r = Math.floor(i / size);
    const c = i % size;
    return c < half ? v : grid[r * size + (size - 1 - c)];
  });
}

function toPicture(id: string, name: string, grid: readonly number[], size: number): NonogramPicture {
  return { id, name, rows: Array.from({ length: size }, (_, r) => grid.slice(r * size, r * size + size).map((v) => (v ? "X" : ".")).join("")) };
}

function usable(grid: readonly number[], size: number): boolean {
  for (let r = 0; r < size; r += 1) if (!grid.slice(r * size, r * size + size).some(Boolean)) return false;
  for (let c = 0; c < size; c += 1) if (!Array.from({ length: size }, (_, r) => grid[r * size + c]).some(Boolean)) return false;
  const filled = grid.filter(Boolean).length / grid.length;
  if (filled < 0.4 || filled > 0.75) return false;
  const result = solveNonogram(cluesOf(grid, size, size));
  return result.count === 1 && result.lineSolvable;
}

const cache = new Map<string, NonogramPicture>();

export function nonogramForLevel(level: number, tier: Tier = "easy"): NonogramPicture {
  const key = `${tier}:${level}`;
  const known = cache.get(key);
  if (known) return known;
  const id = pictureAt(level, tier);
  let picture: NonogramPicture | undefined = id ? NONOGRAMS.find((p) => p.id === id) : undefined;
  if (!picture) {
    const size = nonogramSizeForLevel(level, tier);
    const rng = createRng(seedFrom(tierSeed("nonogram", tier, level, ":")));
    for (let attempt = 0; !picture; attempt += 1) {
      const grid = drawPattern(size, rng);
      if (usable(grid, size)) picture = toPicture(tierSeed("nonogram", tier, level), `레벨 ${level} 무늬`, grid, size);
      if (attempt > 5000) throw new Error(`노노그램 레벨 ${level}을 만들지 못했습니다.`);
    }
  }
  cache.set(key, picture);
  return picture;
}
