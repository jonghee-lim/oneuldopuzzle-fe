// 스도쿠 한 판의 상태와 조작. 화면과 떨어진 순수 함수라 단위 테스트로 확인합니다.
// 입력 방식 두 가지(설계서): 칸 먼저 누르기(cell-first), 숫자 먼저 고르기(number-first).
import { popHistory, pushHistory, type History } from "../core/history.ts";
import { CELLS, PEERS, findConflicts, type SudokuGrid } from "./rules.ts";
import type { SudokuDifficulty } from "./generator.ts";

export type InputMode = "cell-first" | "number-first";

interface Change {
  index: number;
  value: number;
  notes: number;
}

/** 한 번의 조작으로 바뀐 칸들(되돌리기 단위) */
type Step = Change[];

export interface SudokuGame {
  id: string;
  level: number;
  difficulty: SudokuDifficulty;
  puzzle: SudokuGrid;
  solution: SudokuGrid;
  values: SudokuGrid;
  /** 칸별 메모(후보 숫자) 비트: 1<<숫자 */
  notes: number[];
  selected: number | null;
  /** 숫자 먼저 고르기에서 골라 둔 숫자 */
  activeNumber: number | null;
  memoMode: boolean;
  history: History<Step>;
  elapsedSeconds: number;
  completed: boolean;
}

export function newGame(args: { id: string; level: number; difficulty: SudokuDifficulty; puzzle: SudokuGrid; solution: SudokuGrid }): SudokuGame {
  return {
    ...args,
    values: args.puzzle.slice(),
    notes: new Array<number>(CELLS).fill(0),
    selected: null,
    activeNumber: null,
    memoMode: false,
    history: [],
    elapsedSeconds: 0,
    completed: false,
  };
}

export function isGiven(game: SudokuGame, index: number): boolean {
  return game.puzzle[index] !== 0;
}

/** 칸들을 바꾸고 되돌리기 기록을 남깁니다. */
function apply(game: SudokuGame, updates: Change[]): SudokuGame {
  const changed = updates.filter((u) => game.values[u.index] !== u.value || game.notes[u.index] !== u.notes);
  if (changed.length === 0) return game;
  const before: Step = changed.map((u) => ({ index: u.index, value: game.values[u.index], notes: game.notes[u.index] }));
  const values = game.values.slice();
  const notes = game.notes.slice();
  for (const u of changed) {
    values[u.index] = u.value;
    notes[u.index] = u.notes;
  }
  const completed = values.every((v, i) => v === game.solution[i]);
  return { ...game, values, notes, history: pushHistory(game.history, before), completed };
}

function placeValue(game: SudokuGame, index: number, digit: number): SudokuGame {
  if (isGiven(game, index) || game.completed) return game;
  // 같은 숫자를 다시 넣으면 지웁니다(실수로 넣었을 때 바로 고치기).
  if (game.values[index] === digit) return apply(game, [{ index, value: 0, notes: 0 }]);
  const updates: Change[] = [{ index, value: digit, notes: 0 }];
  // 숫자를 넣으면 같은 줄·칸줄·상자 메모에서 그 숫자를 지웁니다.
  const bit = 1 << digit;
  for (const peer of PEERS[index]) {
    if (game.notes[peer] & bit) updates.push({ index: peer, value: game.values[peer], notes: game.notes[peer] & ~bit });
  }
  return apply(game, updates);
}

function toggleNote(game: SudokuGame, index: number, digit: number): SudokuGame {
  if (isGiven(game, index) || game.completed || game.values[index] !== 0) return game;
  return apply(game, [{ index, value: 0, notes: game.notes[index] ^ (1 << digit) }]);
}

function enter(game: SudokuGame, index: number, digit: number): SudokuGame {
  return game.memoMode ? toggleNote(game, index, digit) : placeValue(game, index, digit);
}

/** 칸을 눌렀을 때 */
export function tapCell(game: SudokuGame, index: number, mode: InputMode): SudokuGame {
  if (mode === "number-first" && game.activeNumber !== null && !isGiven(game, index)) {
    return { ...enter(game, index, game.activeNumber), selected: index };
  }
  return { ...game, selected: index };
}

/** 숫자 패드를 눌렀을 때 */
export function tapNumber(game: SudokuGame, digit: number, mode: InputMode): SudokuGame {
  if (mode === "number-first") {
    return { ...game, activeNumber: game.activeNumber === digit ? null : digit };
  }
  if (game.selected === null) return game;
  return enter(game, game.selected, digit);
}

export function erase(game: SudokuGame): SudokuGame {
  const index = game.selected;
  if (index === null || isGiven(game, index) || game.completed) return game;
  return apply(game, [{ index, value: 0, notes: 0 }]);
}

export function undo(game: SudokuGame): SudokuGame {
  if (game.completed) return game;
  const { entry, history } = popHistory(game.history);
  if (!entry) return game;
  const values = game.values.slice();
  const notes = game.notes.slice();
  for (const c of entry) {
    values[c.index] = c.value;
    notes[c.index] = c.notes;
  }
  return { ...game, values, notes, history };
}

export function toggleMemo(game: SudokuGame): SudokuGame {
  return { ...game, memoMode: !game.memoMode };
}

export function tick(game: SudokuGame, seconds = 1): SudokuGame {
  return game.completed ? game : { ...game, elapsedSeconds: game.elapsedSeconds + seconds };
}

/** 규칙에 어긋난 칸(같은 묶음에 같은 숫자) */
export function conflictsOf(game: SudokuGame): Set<number> {
  return findConflicts(game.values);
}

/** 판을 다 채웠는데 답과 다른 경우: 어딘가 틀렸다고 알려 줍니다. */
export function isFilledButWrong(game: SudokuGame): boolean {
  return !game.completed && game.values.every(Boolean);
}

/** 숫자마다 판에 몇 개 놓였는지(9개 다 놓이면 패드에서 흐리게) */
export function digitCounts(game: SudokuGame): number[] {
  const counts = new Array<number>(10).fill(0);
  for (const v of game.values) if (v) counts[v] += 1;
  return counts;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
