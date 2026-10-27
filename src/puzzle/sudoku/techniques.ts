// 사람이 쓰는 풀이 기술로 스도쿠를 풉니다(2026-10-27). 어려움·아주 어려움 문제를 '찍지 않고 풀리는' 판으로 고르고,
// 필요한 가장 어려운 기술로 난이도를 매기며, 힌트가 그 기술을 판에 비춰 가르칠 때 씁니다.
// 기술 단계: 1 단서 찾기(하나뿐인 숫자·숨은 자리) · 2 한 줄 몰림·짝 숫자 · 3 세 칸 묶음·X날개·XY날개·황새치
import { ALL_DIGITS, CELLS, PEERS, UNITS, bitCount, type SudokuGrid } from "./rules.ts";

export type Technique =
  | "nakedSingle"
  | "hiddenSingle"
  | "pointing"
  | "claiming"
  | "nakedPair"
  | "hiddenPair"
  | "nakedTriple"
  | "hiddenTriple"
  | "xWing"
  | "xyWing"
  | "swordfish";

export const TECHNIQUE_GRADE: Record<Technique, 1 | 2 | 3> = {
  nakedSingle: 1,
  hiddenSingle: 1,
  pointing: 2,
  claiming: 2,
  nakedPair: 2,
  hiddenPair: 2,
  nakedTriple: 3,
  hiddenTriple: 3,
  xWing: 3,
  xyWing: 3,
  swordfish: 3,
};

export const TECHNIQUE_NAME: Record<Technique, string> = {
  nakedSingle: "하나뿐인 숫자",
  hiddenSingle: "숨은 자리",
  pointing: "한 줄 몰림",
  claiming: "한 상자 몰림",
  nakedPair: "짝 숫자",
  hiddenPair: "숨은 짝",
  nakedTriple: "세 칸 묶음",
  hiddenTriple: "숨은 세 칸",
  xWing: "X날개",
  xyWing: "XY날개",
  swordfish: "황새치",
};

/** 기술 한 번: 숫자를 넣거나(place) 후보를 지웁니다(eliminate). cells는 그 기술의 근거가 되는 칸, unit은 근거 묶음(UNITS 번호). */
export interface TechStep {
  technique: Technique;
  place?: { index: number; digit: number };
  eliminate: { index: number; digit: number }[];
  cells: number[];
  digits: number[];
  units: number[];
}

/** 판의 숫자에서 칸마다 후보를 셉니다(사용자 메모는 보지 않음). */
export function candidatesOf(values: SudokuGrid): number[] {
  return values.map((v, i) => {
    if (v) return 0;
    let used = 0;
    for (const p of PEERS[i]) if (values[p]) used |= 1 << values[p];
    return ALL_DIGITS & ~used;
  });
}

const digitsOf = (mask: number): number[] => {
  const out: number[] = [];
  for (let d = 1; d <= 9; d += 1) if (mask & (1 << d)) out.push(d);
  return out;
};

function combos<T>(items: readonly T[], k: number): T[][] {
  if (k === 0) return [[]];
  const out: T[][] = [];
  items.forEach((item, i) => {
    for (const rest of combos(items.slice(i + 1), k - 1)) out.push([item, ...rest]);
  });
  return out;
}

const sees = (a: number, b: number) => a !== b && PEERS[a].includes(b);

interface State {
  values: number[];
  cands: number[];
}

function eliminations(state: State, cells: Iterable<number>, mask: number): { index: number; digit: number }[] {
  const out: { index: number; digit: number }[] = [];
  for (const i of cells) {
    if (state.values[i]) continue;
    for (const d of digitsOf(state.cands[i] & mask)) out.push({ index: i, digit: d });
  }
  return out;
}

function nakedSingle({ values, cands }: State): TechStep | null {
  for (let i = 0; i < CELLS; i += 1) {
    if (values[i] || bitCount(cands[i]) !== 1) continue;
    const digit = Math.log2(cands[i]);
    return { technique: "nakedSingle", place: { index: i, digit }, eliminate: [], cells: [i], digits: [digit], units: [] };
  }
  return null;
}

function hiddenSingle({ values, cands }: State): TechStep | null {
  for (let u = 0; u < UNITS.length; u += 1) {
    for (let d = 1; d <= 9; d += 1) {
      if (UNITS[u].some((i) => values[i] === d)) continue;
      const spots = UNITS[u].filter((i) => !values[i] && cands[i] & (1 << d));
      if (spots.length === 1) return { technique: "hiddenSingle", place: { index: spots[0], digit: d }, eliminate: [], cells: [spots[0]], digits: [d], units: [u] };
    }
  }
  return null;
}

/** 한 줄 몰림: 상자 안에서 숫자가 한 줄에만 있으면 그 줄의 상자 밖에서 지움. 한 상자 몰림: 줄 안에서 한 상자에만 있으면 그 상자의 줄 밖에서 지움. */
function locked(state: State): TechStep | null {
  for (let pass = 0; pass < 2; pass += 1) {
    const [from, to] = pass === 0 ? [[18, 27], [0, 18]] : [[0, 18], [18, 27]];
    for (let u = from[0]; u < from[1]; u += 1) {
      for (let d = 1; d <= 9; d += 1) {
        const spots = UNITS[u].filter((i) => !state.values[i] && state.cands[i] & (1 << d));
        if (spots.length < 2) continue;
        for (let v = to[0]; v < to[1]; v += 1) {
          if (!spots.every((i) => UNITS[v].includes(i))) continue;
          const eliminate = eliminations(state, UNITS[v].filter((i) => !UNITS[u].includes(i)), 1 << d);
          if (eliminate.length) return { technique: pass === 0 ? "pointing" : "claiming", eliminate, cells: spots, digits: [d], units: [u, v] };
        }
      }
    }
  }
  return null;
}

function nakedSet(state: State, k: number): TechStep | null {
  for (let u = 0; u < UNITS.length; u += 1) {
    const open = UNITS[u].filter((i) => !state.values[i] && bitCount(state.cands[i]) <= k);
    for (const group of combos(open, k)) {
      const mask = group.reduce((m, i) => m | state.cands[i], 0);
      if (bitCount(mask) !== k) continue;
      const eliminate = eliminations(state, UNITS[u].filter((i) => !group.includes(i)), mask);
      if (eliminate.length) return { technique: k === 2 ? "nakedPair" : "nakedTriple", eliminate, cells: group, digits: digitsOf(mask), units: [u] };
    }
  }
  return null;
}

function hiddenSet(state: State, k: number): TechStep | null {
  for (let u = 0; u < UNITS.length; u += 1) {
    const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !UNITS[u].some((i) => state.values[i] === d));
    for (const group of combos(missing, k)) {
      const mask = group.reduce((m, d) => m | (1 << d), 0);
      const spots = UNITS[u].filter((i) => !state.values[i] && state.cands[i] & mask);
      if (spots.length !== k) continue;
      if (!group.every((d) => spots.some((i) => state.cands[i] & (1 << d)))) continue;
      const eliminate = eliminations(state, spots, ALL_DIGITS & ~mask);
      if (eliminate.length) return { technique: k === 2 ? "hiddenPair" : "hiddenTriple", eliminate, cells: spots, digits: group, units: [u] };
    }
  }
  return null;
}

/** X날개(n=2)·황새치(n=3): n개 줄에서 숫자 자리가 같은 n개 칸줄 안에만 있으면 그 칸줄의 나머지에서 지움(가로·세로 둘 다). */
function fish(state: State, n: number): TechStep | null {
  for (let pass = 0; pass < 2; pass += 1) {
    const base = pass === 0 ? 0 : 9;
    const cover = pass === 0 ? 9 : 0;
    const line = (i: number) => (pass === 0 ? i % 9 : Math.floor(i / 9));
    for (let d = 1; d <= 9; d += 1) {
      const lines = Array.from({ length: 9 }, (_, k) => base + k).filter((u) => {
        const count = UNITS[u].filter((i) => !state.values[i] && state.cands[i] & (1 << d)).length;
        return count >= 2 && count <= n;
      });
      for (const group of combos(lines, n)) {
        const spots = group.flatMap((u) => UNITS[u].filter((i) => !state.values[i] && state.cands[i] & (1 << d)));
        const covers = [...new Set(spots.map(line))];
        if (covers.length !== n) continue;
        const coverCells = covers.flatMap((c) => UNITS[cover + c]).filter((i) => !spots.includes(i));
        const eliminate = eliminations(state, coverCells, 1 << d);
        if (eliminate.length) return { technique: n === 2 ? "xWing" : "swordfish", eliminate, cells: spots, digits: [d], units: [...group, ...covers.map((c) => cover + c)] };
      }
    }
  }
  return null;
}

/** XY날개: 후보 두 개인 가운데 칸(xy)이 xz 칸과 yz 칸을 보면, 두 날개 칸을 함께 보는 칸에서 z를 지움. */
function xyWing(state: State): TechStep | null {
  const pairs = state.cands.flatMap((m, i) => (!state.values[i] && bitCount(m) === 2 ? [i] : []));
  for (const pivot of pairs) {
    const [x, y] = digitsOf(state.cands[pivot]);
    const wings = pairs.filter((w) => sees(pivot, w));
    for (const a of wings) {
      if (!(state.cands[a] & (1 << x)) || state.cands[a] & (1 << y)) continue;
      const z = digitsOf(state.cands[a] & ~(1 << x))[0];
      for (const b of wings) {
        if (b === a || state.cands[b] !== ((1 << y) | (1 << z))) continue;
        const eliminate = eliminations(state, PEERS[a].filter((i) => i !== b && i !== pivot && sees(i, b)), 1 << z);
        if (eliminate.length) return { technique: "xyWing", eliminate, cells: [pivot, a, b], digits: [x, y, z], units: [] };
      }
    }
  }
  return null;
}

const FINDERS: ((state: State) => TechStep | null)[] = [
  nakedSingle,
  hiddenSingle,
  locked,
  (s) => nakedSet(s, 2),
  (s) => hiddenSet(s, 2),
  (s) => nakedSet(s, 3),
  (s) => hiddenSet(s, 3),
  (s) => fish(s, 2),
  xyWing,
  (s) => fish(s, 3),
];

function applyStep(state: State, step: TechStep): void {
  if (step.place) {
    const { index, digit } = step.place;
    state.values[index] = digit;
    state.cands[index] = 0;
    for (const p of PEERS[index]) state.cands[p] &= ~(1 << digit);
  }
  for (const { index, digit } of step.eliminate) state.cands[index] &= ~(1 << digit);
}

/** 쉬운 기술부터 하나씩 찾아 적용합니다. maxGrade보다 어려운 기술은 쓰지 않습니다. */
function nextStep(state: State, maxGrade: number): TechStep | null {
  for (const find of FINDERS) {
    const step = find(state);
    if (step && TECHNIQUE_GRADE[step.technique] <= maxGrade) return step;
    if (step) return null;
  }
  return null;
}

export interface Rating {
  solved: boolean;
  /** 쓴 기술 가운데 가장 어려운 단계(못 풀면 막힌 곳까지) */
  grade: number;
  techniques: Technique[];
}

/** 기술만으로 풀어 본 차례(맞는지는 tests/sudoku.test.ts가 답과 맞춰 봄). 후보가 바닥난 칸이 생기면(답이 없는 판) 멈춥니다. */
export function solveSteps(grid: SudokuGrid, maxGrade = 3): { solved: boolean; steps: TechStep[] } {
  const state: State = { values: grid.slice(), cands: candidatesOf(grid) };
  const steps: TechStep[] = [];
  for (;;) {
    if (state.values.every(Boolean)) return { solved: true, steps };
    if (state.values.some((v, i) => !v && !state.cands[i])) break;
    const step = nextStep(state, maxGrade);
    if (!step) break;
    steps.push(step);
    applyStep(state, step);
  }
  return { solved: false, steps };
}

/** 기술만으로 풀어 보고 필요한 가장 어려운 단계를 매깁니다. */
export function rateSudoku(grid: SudokuGrid, maxGrade = 3): Rating {
  const { solved, steps } = solveSteps(grid, maxGrade);
  const techniques = [...new Set(steps.map((s) => s.technique))];
  return { solved, grade: Math.max(1, ...techniques.map((t) => TECHNIQUE_GRADE[t])), techniques };
}

/**
 * 힌트용: 지금 판에서 다음에 넣을 수 있는 칸을 찾고, 그 전에 필요한 지우기 기술들을 함께 돌려줍니다.
 * 지우기 없이 단서로 바로 넣을 수 있으면 eliminations는 비어 있습니다. 기술로 못 찾으면 null.
 */
export function nextPlacement(values: SudokuGrid): { place: TechStep; eliminations: TechStep[] } | null {
  const state: State = { values: values.slice(), cands: candidatesOf(values) };
  const steps: TechStep[] = [];
  for (let guard = 0; guard < 200; guard += 1) {
    const step = nextStep(state, 3);
    if (!step) return null;
    if (step.place) return { place: step, eliminations: steps };
    steps.push(step);
    applyStep(state, step);
  }
  return null;
}
