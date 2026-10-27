// 사람이 푸는 방식(단서 찾기)으로만 풀리는지 확인합니다. 난이도를 매길 때 씁니다.
// 쉬움·보통 문제는 '이 칸엔 이 숫자밖에 없다'와 '이 줄에서 이 숫자는 여기밖에 못 간다' 두 가지만으로 풀려야 합니다.
import { bitCount, shapeOf, type SudokuGrid } from "./rules.ts";

export interface LogicResult {
  solved: boolean;
  /** 단서를 몇 번 찾아 채웠는지(어려울수록 숨은 단서 비중이 큼) */
  steps: number;
  hiddenSteps: number;
}

export function solveWithSingles(grid: SudokuGrid): LogicResult {
  const cells = grid.slice();
  const { cells: CELLS, peers: PEERS, units: UNITS, all: ALL_DIGITS, size } = shapeOf(grid);
  const candidates = (i: number) => {
    let used = 0;
    for (const p of PEERS[i]) if (cells[p]) used |= 1 << cells[p];
    return ALL_DIGITS & ~used;
  };
  let steps = 0;
  let hiddenSteps = 0;

  for (;;) {
    let progressed = false;

    // 1) 이 칸에 들어갈 숫자가 하나뿐인 경우
    for (let i = 0; i < CELLS; i += 1) {
      if (cells[i]) continue;
      const mask = candidates(i);
      if (mask === 0) return { solved: false, steps, hiddenSteps };
      if (bitCount(mask) === 1) {
        cells[i] = Math.log2(mask);
        steps += 1;
        progressed = true;
      }
    }
    if (progressed) continue;

    // 2) 한 묶음에서 이 숫자가 갈 수 있는 칸이 하나뿐인 경우
    for (const unit of UNITS) {
      for (let d = 1; d <= size; d += 1) {
        if (unit.some((i) => cells[i] === d)) continue;
        const spots = unit.filter((i) => !cells[i] && candidates(i) & (1 << d));
        if (spots.length === 1) {
          cells[spots[0]] = d;
          steps += 1;
          hiddenSteps += 1;
          progressed = true;
        }
      }
    }
    if (!progressed) break;
  }

  return { solved: cells.every(Boolean), steps, hiddenSteps };
}
