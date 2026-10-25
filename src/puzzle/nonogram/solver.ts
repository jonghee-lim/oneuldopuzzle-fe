// 노노그램 검사기. 줄마다 가능한 배치를 모두 따져 확실한 칸을 채우고(줄 풀기),
// 그래도 남으면 한 칸을 가정해 나눠 봅니다. 답이 정확히 하나인지, 줄 풀기만으로 풀리는지 알려 줍니다.
import type { NonogramClues } from "./rules.ts";

const UNKNOWN = -1;

/** 한 줄에서 단서와 지금까지 정해진 칸에 맞는 배치를 모두 겹쳐, 칸마다 칠할 수 있는지·비울 수 있는지 구합니다. */
function solveLine(clue: readonly number[], cells: readonly number[]): number[] | null {
  const n = cells.length;
  const runs = clue[0] === 0 ? [] : clue;
  const canFill = new Array<boolean>(n).fill(false);
  const canEmpty = new Array<boolean>(n).fill(false);
  const memo = new Map<number, boolean>();

  // place(i, k): i번 칸부터 k번째 묶음 이후를 놓을 수 있는지. 놓을 수 있는 배치의 칸 표시도 함께 남깁니다.
  const place = (i: number, k: number): boolean => {
    const key = i * 64 + k;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;
    let ok = false;
    if (k === runs.length) {
      ok = true;
      for (let j = i; j < n; j += 1) if (cells[j] === 1) ok = false;
      if (ok) for (let j = i; j < n; j += 1) canEmpty[j] = true;
    } else {
      const len = runs[k];
      for (let start = i; start + len <= n; start += 1) {
        // start 앞 칸들은 비어 있어야 합니다.
        if (start > i && cells[start - 1] === 1) break;
        let fits = true;
        for (let j = start; j < start + len; j += 1) if (cells[j] === 0) fits = false;
        if (!fits) continue;
        const end = start + len;
        if (end < n && cells[end] === 1) continue;
        const next = end < n ? end + 1 : end;
        if (place(next, k + 1)) {
          ok = true;
          for (let j = i; j < start; j += 1) canEmpty[j] = true;
          for (let j = start; j < end; j += 1) canFill[j] = true;
          if (end < n) canEmpty[end] = true;
        }
      }
    }
    memo.set(key, ok);
    return ok;
  };

  if (!place(0, 0)) return null;
  return cells.map((v, j) => (v !== UNKNOWN ? v : canFill[j] && !canEmpty[j] ? 1 : canEmpty[j] && !canFill[j] ? 0 : UNKNOWN));
}

/** 줄 풀기를 더 바뀌는 칸이 없을 때까지 되풀이합니다. 모순이면 null. */
function propagate(clues: NonogramClues, grid: number[]): number[] | null {
  const { width, height } = clues;
  const cells = grid.slice();
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < height; r += 1) {
      const line = cells.slice(r * width, r * width + width);
      const solved = solveLine(clues.rows[r], line);
      if (!solved) return null;
      for (let c = 0; c < width; c += 1) {
        if (solved[c] !== line[c]) {
          cells[r * width + c] = solved[c];
          changed = true;
        }
      }
    }
    for (let c = 0; c < width; c += 1) {
      const line = Array.from({ length: height }, (_, r) => cells[r * width + c]);
      const solved = solveLine(clues.cols[c], line);
      if (!solved) return null;
      for (let r = 0; r < height; r += 1) {
        if (solved[r] !== line[r]) {
          cells[r * width + c] = solved[r];
          changed = true;
        }
      }
    }
  }
  return cells;
}

export interface NonogramSolveResult {
  /** 찾은 답 수(limit에서 멈춤) */
  count: number;
  solution?: number[];
  /** 가정 없이 줄 풀기만으로 다 풀리는지(사람이 막히지 않고 풀 수 있는지) */
  lineSolvable: boolean;
}

export function solveNonogram(clues: NonogramClues, limit = 2): NonogramSolveResult {
  const start = propagate(clues, new Array<number>(clues.width * clues.height).fill(UNKNOWN));
  const lineSolvable = !!start && start.every((v) => v !== UNKNOWN);
  let count = 0;
  let solution: number[] | undefined;

  const search = (grid: number[] | null): boolean => {
    if (!grid) return false;
    const unknown = grid.indexOf(UNKNOWN);
    if (unknown === -1) {
      count += 1;
      if (!solution) solution = grid;
      return count >= limit;
    }
    for (const guess of [1, 0]) {
      const next = grid.slice();
      next[unknown] = guess;
      if (search(propagate(clues, next))) return true;
    }
    return false;
  };

  search(start);
  return { count, solution, lineSolvable };
}
