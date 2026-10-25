// 스도쿠 문제 생성기. 무작위 완성판을 만든 뒤, 답이 하나로 유지되는 동안만 숫자를 지웁니다.
// 마지막에 검사기(checkSudoku)를 한 번 더 통과해야 문제로 인정합니다.
import { createRng, seedFrom, shuffle, type Rng } from "../core/rng.ts";
import { checkSudoku } from "./checker.ts";
import { solveWithSingles } from "./logic.ts";
import { CELLS, type SudokuGrid } from "./rules.ts";
import { solve } from "./solver.ts";

export type SudokuDifficulty = "easy" | "normal" | "hard" | "expert";

export const DIFFICULTY_LABEL: Record<SudokuDifficulty, string> = {
  easy: "쉬움",
  normal: "보통",
  hard: "어려움",
  expert: "아주 어려움",
};

interface DifficultyRule {
  /** 이 개수까지 지우기를 시도합니다(답이 하나인 동안만). */
  targetClues: number;
  /** 사람이 단서 찾기만으로 풀 수 있어야 하는지 */
  singlesOnly: boolean;
  /** 단서 찾기만으로 풀리면 안 되는지(더 깊은 추론이 필요한 문제) */
  needsDeeper: boolean;
}

const RULES: Record<SudokuDifficulty, DifficultyRule> = {
  easy: { targetClues: 40, singlesOnly: true, needsDeeper: false },
  normal: { targetClues: 32, singlesOnly: true, needsDeeper: false },
  hard: { targetClues: 26, singlesOnly: false, needsDeeper: false },
  expert: { targetClues: 22, singlesOnly: false, needsDeeper: true },
};

export interface SudokuPuzzle {
  /** 문제를 다시 만들 수 있는 씨앗 문자열 */
  id: string;
  difficulty: SudokuDifficulty;
  puzzle: SudokuGrid;
  solution: SudokuGrid;
}

function randomSolution(rng: Rng): SudokuGrid {
  const empty = new Array<number>(CELLS).fill(0);
  const order = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
  // 첫 줄을 무작위로 깔면 같은 순서로 넣어도 판이 다양해집니다.
  for (let c = 0; c < 9; c += 1) empty[c] = order[c];
  const { solution } = solve(empty, 1, shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng));
  if (!solution) throw new Error("완성판을 만들지 못했습니다.");
  return solution;
}

function carve(solution: SudokuGrid, rule: DifficultyRule, rng: Rng): SudokuGrid {
  const puzzle = solution.slice();
  let clues = CELLS;
  // 가운데를 기준으로 마주 보는 두 칸을 함께 지워 판이 고르게 보이게 합니다.
  const positions = shuffle(Array.from({ length: 41 }, (_, i) => i), rng);
  for (const i of positions) {
    if (clues <= rule.targetClues) break;
    const mirror = CELLS - 1 - i;
    const saved = [puzzle[i], puzzle[mirror]];
    puzzle[i] = 0;
    puzzle[mirror] = 0;
    const removed = i === mirror ? 1 : 2;
    const unique = solve(puzzle, 2).count === 1;
    const humanOk = !rule.singlesOnly || solveWithSingles(puzzle).solved;
    if (unique && humanOk) {
      clues -= removed;
    } else {
      puzzle[i] = saved[0];
      puzzle[mirror] = saved[1];
    }
  }
  return puzzle;
}

function fits(puzzle: SudokuGrid, rule: DifficultyRule): boolean {
  const human = solveWithSingles(puzzle);
  if (rule.singlesOnly && !human.solved) return false;
  if (rule.needsDeeper && human.solved) return false;
  return true;
}

/** 씨앗 문자열로 문제를 만듭니다. 같은 씨앗이면 언제나 같은 문제입니다. */
export function generateSudoku(seed: string, difficulty: SudokuDifficulty): SudokuPuzzle {
  const rule = RULES[difficulty];
  const rng = createRng(seedFrom(`${seed}:${difficulty}`));
  // 난이도 조건에 맞는 문제가 나올 때까지 다시 만듭니다. 아주 어려움도 보통 몇 번 안에 나옵니다.
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const solution = randomSolution(rng);
    const puzzle = carve(solution, rule, rng);
    if (!fits(puzzle, rule) && attempt < 59) continue;
    const check = checkSudoku(puzzle, solution);
    if (!check.ok) continue;
    return { id: seed, difficulty, puzzle, solution };
  }
  throw new Error(`문제를 만들지 못했습니다: ${seed}`);
}

/** 레벨에 맞는 난이도. 서버 문제 풀이 생기면 서버 값이 이 표를 대신합니다. */
export function difficultyForLevel(level: number): SudokuDifficulty {
  if (level <= 10) return "easy";
  if (level <= 40) return "normal";
  if (level % 10 === 0) return "expert";
  return "hard";
}

/** 레벨의 문제. 사용자가 시작 화면에서 난이도를 고르면 그 난이도로 만듭니다(같은 레벨·난이도면 같은 문제). */
export function puzzleForLevel(level: number, difficulty: SudokuDifficulty = difficultyForLevel(level)): SudokuPuzzle {
  return generateSudoku(`sudoku-level-${level}`, difficulty);
}
