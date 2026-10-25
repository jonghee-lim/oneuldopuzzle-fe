// 문제 검사기가 쓰는 풀이기. 비트 마스크 + 후보가 가장 적은 칸부터 고르는 백트래킹입니다.
import { ALL_DIGITS, CELLS, SIZE, boxOf, bitCount, type SudokuGrid } from "./rules.ts";

export interface SolveResult {
  /** 찾은 답 수(limit에서 멈춤). 0이면 풀 수 없음, 1이면 답이 하나, 2 이상이면 답이 여러 개. */
  count: number;
  /** 처음 찾은 답 */
  solution?: SudokuGrid;
}

/**
 * 답을 최대 limit개까지 셉니다. 답이 하나인지 확인할 때는 limit 2로 부르면 충분합니다.
 * order를 주면 숫자를 그 순서대로 넣어 봅니다(문제 생성 때 무작위 완성판을 만들 때 씁니다).
 */
export function solve(grid: SudokuGrid, limit = 2, order?: readonly number[]): SolveResult {
  const cells = grid.slice();
  const rows = new Array<number>(SIZE).fill(0);
  const cols = new Array<number>(SIZE).fill(0);
  const boxes = new Array<number>(SIZE).fill(0);

  for (let i = 0; i < CELLS; i += 1) {
    const v = cells[i];
    if (!v) continue;
    const bit = 1 << v;
    const r = Math.floor(i / SIZE);
    const c = i % SIZE;
    const b = boxOf(i);
    // 처음부터 같은 숫자가 겹치면 답이 없습니다.
    if (rows[r] & bit || cols[c] & bit || boxes[b] & bit) return { count: 0 };
    rows[r] |= bit;
    cols[c] |= bit;
    boxes[b] |= bit;
  }

  const digits = order ?? [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let count = 0;
  let solution: SudokuGrid | undefined;

  const search = (): boolean => {
    // 후보가 가장 적은 빈칸을 고릅니다.
    let best = -1;
    let bestMask = 0;
    let bestCount = 10;
    for (let i = 0; i < CELLS; i += 1) {
      if (cells[i]) continue;
      const mask = ALL_DIGITS & ~(rows[Math.floor(i / SIZE)] | cols[i % SIZE] | boxes[boxOf(i)]);
      const n = bitCount(mask);
      if (n < bestCount) {
        best = i;
        bestMask = mask;
        bestCount = n;
        if (n <= 1) break;
      }
    }
    if (best === -1) {
      count += 1;
      if (!solution) solution = cells.slice();
      return count >= limit;
    }
    if (bestCount === 0) return false;

    const r = Math.floor(best / SIZE);
    const c = best % SIZE;
    const b = boxOf(best);
    for (const d of digits) {
      const bit = 1 << d;
      if (!(bestMask & bit)) continue;
      cells[best] = d;
      rows[r] |= bit;
      cols[c] |= bit;
      boxes[b] |= bit;
      const stop = search();
      rows[r] &= ~bit;
      cols[c] &= ~bit;
      boxes[b] &= ~bit;
      cells[best] = 0;
      if (stop) return true;
    }
    return false;
  };

  search();
  return { count, solution };
}
