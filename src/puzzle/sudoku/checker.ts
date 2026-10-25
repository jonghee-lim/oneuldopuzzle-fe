// 문제 검사기: 판이 올바른 모양인지, 처음 숫자끼리 겹치지 않는지, 답이 정확히 하나인지 확인합니다.
// 이 검사를 통과한 문제만 사용자에게 내보냅니다(설계서: 틀린 문제는 하나도 내보내지 않는다).
import { CELLS, findConflicts, type SudokuGrid } from "./rules.ts";
import { solve } from "./solver.ts";

export type CheckFailure = "shape" | "conflict" | "no-solution" | "multiple-solutions" | "solution-mismatch";

export type CheckResult =
  | { ok: true; solution: SudokuGrid; clues: number }
  | { ok: false; reason: CheckFailure };

export function checkSudoku(puzzle: SudokuGrid, expectedSolution?: SudokuGrid): CheckResult {
  if (puzzle.length !== CELLS || puzzle.some((v) => !Number.isInteger(v) || v < 0 || v > 9)) {
    return { ok: false, reason: "shape" };
  }
  if (findConflicts(puzzle).size > 0) return { ok: false, reason: "conflict" };

  const { count, solution } = solve(puzzle, 2);
  if (count === 0 || !solution) return { ok: false, reason: "no-solution" };
  if (count > 1) return { ok: false, reason: "multiple-solutions" };
  if (expectedSolution && expectedSolution.some((v, i) => v !== solution[i])) {
    return { ok: false, reason: "solution-mismatch" };
  }
  return { ok: true, solution, clues: puzzle.filter(Boolean).length };
}
