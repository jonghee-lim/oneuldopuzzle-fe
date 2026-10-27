// 스도쿠 한 판의 상태와 조작. 화면과 떨어진 순수 함수라 단위 테스트로 확인합니다.
// 입력 방식 두 가지(설계서): 칸 먼저 누르기(cell-first), 숫자 먼저 고르기(number-first).
import { popHistory, pushHistory, type History } from "../core/history.ts";
import type { HintStep } from "../core/hint.ts";
import { CELLS, PEERS, UNITS, findConflicts, type SudokuGrid } from "./rules.ts";
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
  /** '틀린 칸 보기'를 쓴 판(도움 없이 점수를 주지 않음) */
  usedCheck?: boolean;
  /** 힌트를 쓴 판(도움 없이 점수를 주지 않음) */
  usedHint?: boolean;
}

/**
 * 힌트: 틀린 숫자가 있으면 그 칸부터 알려 주고, 없으면 사람이 찾을 수 있는 다음 칸(단서)을 알려 줍니다.
 * only: 이 칸에 들어갈 숫자가 하나뿐 · row/col/box: 그 줄·칸줄·상자에서 이 숫자가 갈 곳이 여기뿐 · answer: 단서로 못 찾아 답을 알려 줌
 */
export type SudokuHint = { kind: "wrong"; index: number } | { kind: "place"; index: number; digit: number; reason: "only" | "row" | "col" | "box" | "answer" };

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

/** 같은 문제를 처음부터 다시 풉니다. 넣은 숫자·메모·시간을 모두 비우고 입력 설정(메모·고른 숫자)만 둡니다. */
export function restart(game: SudokuGame): SudokuGame {
  const fresh = newGame({ id: game.id, level: game.level, difficulty: game.difficulty, puzzle: game.puzzle, solution: game.solution });
  return { ...fresh, memoMode: game.memoMode, activeNumber: game.activeNumber };
}

export function findHint(game: SudokuGame): SudokuHint | null {
  if (game.completed) return null;
  const wrong = game.values.findIndex((v, i) => v !== 0 && v !== game.solution[i]);
  if (wrong >= 0) return { kind: "wrong", index: wrong };
  const cells = game.values;
  const candidates = (i: number) => {
    let used = 0;
    for (const p of PEERS[i]) if (cells[p]) used |= 1 << cells[p];
    return 0x3fe & ~used;
  };
  // 고른 칸 가까이부터 보면 지금 보고 있던 곳의 단서를 먼저 알려 줄 수 있지만, 순서가 흔들리지 않게 앞에서부터 찾습니다.
  for (let i = 0; i < CELLS; i += 1) {
    if (cells[i]) continue;
    const mask = candidates(i);
    if (mask && (mask & (mask - 1)) === 0) return { kind: "place", index: i, digit: Math.log2(mask), reason: "only" };
  }
  for (let u = 0; u < UNITS.length; u += 1) {
    const unit = UNITS[u];
    for (let d = 1; d <= 9; d += 1) {
      if (unit.some((i) => cells[i] === d)) continue;
      const spots = unit.filter((i) => !cells[i] && candidates(i) & (1 << d));
      if (spots.length === 1) return { kind: "place", index: spots[0], digit: d, reason: u < 9 ? "row" : u < 18 ? "col" : "box" };
    }
  }
  const empty = cells.findIndex((v) => v === 0);
  return empty < 0 ? null : { kind: "place", index: empty, digit: game.solution[empty], reason: "answer" };
}

const BOX_NAME = ["왼쪽 위", "가운데 위", "오른쪽 위", "왼쪽 가운데", "한가운데", "오른쪽 가운데", "왼쪽 아래", "가운데 아래", "오른쪽 아래"];

/** 힌트를 넣기 전에 보여 줄 단계: 볼 곳, 그다음 이유 */
export function sudokuHintSteps(game: SudokuGame, hint: SudokuHint): HintStep[] {
  const i = hint.index;
  if (hint.kind === "wrong") return [{ cells: [i], text: "표시한 칸의 숫자가 답과 달라요." }];
  const d = hint.digit;
  const row = Math.floor(i / 9);
  const col = i % 9;
  const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
  if (hint.reason === "only") {
    return [
      { cells: [i], text: "표시한 칸을 보세요. 같은 가로줄·세로줄·상자에 이미 있는 숫자를 지워 보세요." },
      { cells: [i, ...PEERS[i].filter((p) => game.values[p])], text: `둘레에 있는 숫자를 빼면 이 칸에는 ${d}만 남아요.` },
    ];
  }
  if (hint.reason === "answer") return [{ cells: [i], text: "이 칸은 지금 보이는 단서만으로는 찾기 어려워요." }];
  const [unit, name] =
    hint.reason === "row" ? [UNITS[row], `${row + 1}번째 가로줄`] : hint.reason === "col" ? [UNITS[9 + col], `${col + 1}번째 세로줄`] : [UNITS[18 + box], `${BOX_NAME[box]} 상자`];
  const same = game.values.flatMap((v, k) => (v === d ? [k] : []));
  return [
    { cells: [...unit], text: `${name}에서 ${d}의 자리를 찾아보세요.` },
    { cells: [i, ...same], text: `다른 ${d}들이 막고 있어서 ${name}에서 ${d}의 자리는 여기 하나뿐이에요.` },
  ];
}

/** 힌트를 판에 반영: 틀린 칸은 비우고, 알려 준 칸에는 숫자를 넣습니다. 둘 다 그 칸을 골라 둡니다. */
export function applyHint(game: SudokuGame, hint: SudokuHint): SudokuGame {
  const next = hint.kind === "wrong" ? apply(game, [{ index: hint.index, value: 0, notes: 0 }]) : placeValue({ ...game, memoMode: false }, hint.index, hint.digit);
  return { ...next, memoMode: game.memoMode, selected: hint.index, usedHint: true };
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

/** 손댄 판인지. 열어 두기만 해도 시간은 흐르므로 시간이 아니라 넣은 숫자·메모로 봅니다(2026-10-26 '이어 하기 0:03' 신고). */
export function hasProgress(game: SudokuGame): boolean {
  return game.values.some((v, i) => v !== game.puzzle[i]) || game.notes.some(Boolean);
}

/** 빈칸인데 같은 줄·칸줄·상자 숫자 때문에 넣을 수 있는 숫자가 하나도 없는 칸. 앞에서 넣은 숫자 중 틀린 것이 있다는 뜻입니다. */
export function deadCells(game: SudokuGame): number[] {
  const dead: number[] = [];
  game.values.forEach((v, i) => {
    if (v) return;
    let used = 0;
    for (const p of PEERS[i]) used |= 1 << game.values[p];
    if ((used & 0b1111111110) === 0b1111111110) dead.push(i);
  });
  return dead;
}

/** 내가 넣은 숫자 중 답과 다른 칸 */
export function wrongCells(game: SudokuGame): number[] {
  const wrong: number[] = [];
  game.values.forEach((v, i) => {
    if (v && !isGiven(game, i) && v !== game.solution[i]) wrong.push(i);
  });
  return wrong;
}

/** 이번 조작으로 답대로 다 채워진 줄·칸줄·상자의 칸들(채우는 순간 반짝이는 데 씁니다) */
export function newlyCompletedCells(before: SudokuGame, after: SudokuGame): number[] {
  const solved = (g: SudokuGame, unit: readonly number[]) => unit.every((i) => g.values[i] === g.solution[i]);
  const cells = new Set<number>();
  for (const unit of UNITS) if (solved(after, unit) && !solved(before, unit)) unit.forEach((i) => cells.add(i));
  return [...cells];
}
