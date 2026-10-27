// 스도쿠 한 판의 상태와 조작. 화면과 떨어진 순수 함수라 단위 테스트로 확인합니다.
// 입력 방식 두 가지(설계서): 칸 먼저 누르기(cell-first), 숫자 먼저 고르기(number-first).
import { popHistory, pushHistory, type History } from "../core/history.ts";
import type { HintStep } from "../core/hint.ts";
import { findConflicts, shapeOf, type Shape, type SudokuGrid } from "./rules.ts";
import type { SudokuDifficulty } from "./generator.ts";
import { TECHNIQUE_NAME, nextPlacement, type TechStep } from "./techniques.ts";

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
 * technique: 짝 숫자·X날개 같은 기술로 후보를 지운 뒤 찾은 칸(via는 마지막 지우기, then은 그 뒤 넣는 방법, 2026-10-27)
 */
export type SudokuHint =
  | { kind: "wrong"; index: number }
  | { kind: "place"; index: number; digit: number; reason: "only" | "row" | "col" | "box" | "answer" }
  | { kind: "place"; index: number; digit: number; reason: "technique"; via: TechStep; then: TechStep };

export function newGame(args: { id: string; level: number; difficulty: SudokuDifficulty; puzzle: SudokuGrid; solution: SudokuGrid }): SudokuGame {
  return {
    ...args,
    values: args.puzzle.slice(),
    notes: new Array<number>(args.puzzle.length).fill(0),
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
  for (const peer of shapeOf(game.values).peers[index]) {
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

/**
 * 자동 메모: 빈칸마다 같은 줄·칸줄·상자에 없는 숫자를 모두 메모합니다(되돌리기 한 번에 취소, 2026-10-27).
 * 힌트가 아니라 메모를 대신 적어 주는 것이라 도움으로 세지 않습니다.
 */
export function autoNotes(game: SudokuGame): SudokuGame {
  if (game.completed) return game;
  const updates: Change[] = [];
  const { cells, peers, digits } = shapeOf(game.values);
  for (let index = 0; index < cells; index += 1) {
    if (game.values[index] !== 0) continue;
    let notes = 0;
    for (const d of digits) if (!peers[index].some((p) => game.values[p] === d)) notes |= 1 << d;
    updates.push({ index, value: 0, notes });
  }
  return apply(game, updates);
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
  const { cells: CELLS, peers: PEERS, units: UNITS, all, digits, size } = shapeOf(cells);
  const candidates = (i: number) => {
    let used = 0;
    for (const p of PEERS[i]) if (cells[p]) used |= 1 << cells[p];
    return all & ~used;
  };
  // 고른 칸 가까이부터 보면 지금 보고 있던 곳의 단서를 먼저 알려 줄 수 있지만, 순서가 흔들리지 않게 앞에서부터 찾습니다.
  for (let i = 0; i < CELLS; i += 1) {
    if (cells[i]) continue;
    const mask = candidates(i);
    if (mask && (mask & (mask - 1)) === 0) return { kind: "place", index: i, digit: Math.log2(mask), reason: "only" };
  }
  for (let u = 0; u < UNITS.length; u += 1) {
    const unit = UNITS[u];
    for (const d of digits) {
      if (unit.some((i) => cells[i] === d)) continue;
      const spots = unit.filter((i) => !cells[i] && candidates(i) & (1 << d));
      if (spots.length === 1) return { kind: "place", index: spots[0], digit: d, reason: u < size ? "row" : u < 2 * size ? "col" : "box" };
    }
  }
  // 단서로 바로 못 찾으면 기술로 후보를 지워 가며 찾습니다(어려움·아주 어려움).
  const found = nextPlacement(cells);
  if (found?.eliminations.length && found.place.place) {
    const { index, digit } = found.place.place;
    return { kind: "place", index, digit, reason: "technique", via: found.eliminations[found.eliminations.length - 1], then: found.place };
  }
  const empty = cells.findIndex((v) => v === 0);
  return empty < 0 ? null : { kind: "place", index: empty, digit: game.solution[empty], reason: "answer" };
}

const BOX_NAME = ["왼쪽 위", "가운데 위", "오른쪽 위", "왼쪽 가운데", "한가운데", "오른쪽 가운데", "왼쪽 아래", "가운데 아래", "오른쪽 아래"];
/** 미니 6×6은 상자가 두 칸줄 × 세 줄 */
const MINI_BOX_NAME = ["왼쪽 위", "오른쪽 위", "왼쪽 가운데", "오른쪽 가운데", "왼쪽 아래", "오른쪽 아래"];

/** 숫자 뒤 조사: 받침 있는 숫자(0·1·3·6·7·8) 뒤에는 은·이 */
const hasBatchim = (n: number | string) => "013678".includes(String(n).slice(-1));
const topic = (n: number | string) => `${n}${hasBatchim(n) ? "은" : "는"}`;
const subject = (n: number | string) => `${n}${hasBatchim(n) ? "이" : "가"}`;

function unitNameOf(u: number, { size }: Shape): string {
  const boxes = size === 9 ? BOX_NAME : MINI_BOX_NAME;
  return u < size ? `${u + 1}번째 가로줄` : u < 2 * size ? `${u - size + 1}번째 세로줄` : `${boxes[u - 2 * size]} 상자`;
}

/** 기술마다 왜 후보를 지울 수 있는지 한 문장으로 */
export function techniqueText(step: TechStep, shape: Shape): string {
  const unitName = (u: number) => unitNameOf(u, shape);
  const [a, b, c] = step.digits;
  const list = step.digits.join(", ");
  switch (step.technique) {
    case "pointing":
      return `${unitName(step.units[0])}에서 ${topic(a)} 표시한 칸에만 갈 수 있고 모두 ${unitName(step.units[1])}에 있어요. 그래서 이 줄의 상자 밖 칸에는 ${subject(a)} 못 와요.`;
    case "claiming":
      return `${unitName(step.units[0])}에서 ${topic(a)} 표시한 칸에만 갈 수 있고 모두 ${unitName(step.units[1])}에 있어요. 그래서 이 상자의 다른 칸에는 ${subject(a)} 못 와요.`;
    case "nakedPair":
    case "nakedTriple":
      return `표시한 ${step.cells.length === 2 ? "두" : "세"} 칸에는 ${list}만 들어갈 수 있어요. 그래서 ${unitName(step.units[0])}의 다른 칸에는 ${subject(list)} 못 와요.`;
    case "hiddenPair":
    case "hiddenTriple":
      return `${unitName(step.units[0])}에서 ${topic(list)} 표시한 ${step.cells.length === 2 ? "두" : "세"} 칸에만 갈 수 있어요. 그래서 이 칸들에는 다른 숫자가 못 와요.`;
    case "xWing":
    case "swordfish": {
      const n = step.technique === "xWing" ? 2 : 3;
      const rows = step.units[0] < shape.size;
      return `${topic(a)} 표시한 ${n}개 ${rows ? "가로줄" : "세로줄"}에서 같은 ${n}개 ${rows ? "세로줄" : "가로줄"} 안에만 갈 수 있어요. 그래서 그 ${rows ? "세로줄" : "가로줄"}의 다른 칸에는 ${subject(a)} 못 와요.`;
    }
    case "xyWing":
      return `가운데 칸은 ${a}${hasBatchim(a) ? "이나" : "나"} ${b}이고, 어느 쪽이든 두 날개 칸 가운데 하나는 꼭 ${subject(c)} 돼요. 그래서 두 날개 칸을 함께 보는 칸에는 ${subject(c)} 못 와요.`;
    default:
      return "";
  }
}

/** 힌트를 넣기 전에 보여 줄 단계: 볼 곳, 그다음 이유 */
export function sudokuHintSteps(game: SudokuGame, hint: SudokuHint): HintStep[] {
  const i = hint.index;
  if (hint.kind === "wrong") return [{ cells: [i], text: "표시한 칸의 숫자가 답과 달라요." }];
  const d = hint.digit;
  const shape = shapeOf(game.values);
  const { size, peers: PEERS, units: UNITS } = shape;
  const unitName = (u: number) => unitNameOf(u, shape);
  const row = Math.floor(i / size);
  const col = i % size;
  const box = shape.boxOf(i);
  if (hint.reason === "only") {
    return [
      { cells: [i], text: "표시한 칸을 보세요. 같은 가로줄·세로줄·상자에 이미 있는 숫자를 지워 보세요." },
      { cells: [i, ...PEERS[i].filter((p) => game.values[p])], text: `둘레에 있는 숫자를 빼면 이 칸에는 ${d}만 남아요.` },
    ];
  }
  if (hint.reason === "answer") return [{ cells: [i], text: "이 칸은 지금 보이는 단서만으로는 찾기 어려워요." }];
  if (hint.reason === "technique") {
    const removed = [...new Set(hint.via.eliminate.map((e) => e.index))];
    const then =
      hint.then.technique === "nakedSingle"
        ? `후보를 지우고 나면 이 칸에는 ${d}만 남아요.`
        : `후보를 지우고 나면 ${unitName(hint.then.units[0])}에서 ${subject(d)} 갈 곳은 여기뿐이에요.`;
    return [
      { cells: hint.via.cells, text: `${TECHNIQUE_NAME[hint.via.technique]}: ${techniqueText(hint.via, shape)}` },
      { cells: [i, ...removed.filter((k) => k !== i)], text: then },
    ];
  }
  const [unit, name] =
    hint.reason === "row" ? [UNITS[row], unitName(row)] : hint.reason === "col" ? [UNITS[size + col], unitName(size + col)] : [UNITS[2 * size + box], unitName(2 * size + box)];
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

/** 숫자마다 판에 몇 개 놓였는지(한 숫자를 판 크기만큼 다 놓으면 패드에서 흐리게) */
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
  const { peers, all } = shapeOf(game.values);
  game.values.forEach((v, i) => {
    if (v) return;
    let used = 0;
    for (const p of peers[i]) used |= 1 << game.values[p];
    if ((used & all) === all) dead.push(i);
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
  for (const unit of shapeOf(after.values).units) if (solved(after, unit) && !solved(before, unit)) unit.forEach((i) => cells.add(i));
  return [...cells];
}
