// 스도쿠의 칸·줄·상자 관계. 판은 길이 81(미니 36) 배열이고 0은 빈칸입니다.

/**
 * 판 모양: 클래식 9×9(상자 3×3)와 미니 6×6(상자 가로 3 × 세로 2, 2026-10-27). 판 배열 길이로 어느 쪽인지 압니다(shapeOf).
 * 묶음 번호(units): 0..size-1 가로줄, size..2size-1 세로줄, 그 뒤 상자.
 */
export interface Shape {
  size: number;
  cells: number;
  boxRows: number;
  boxCols: number;
  /** 1~size 숫자 비트 */
  all: number;
  digits: readonly number[];
  peers: readonly (readonly number[])[];
  units: readonly (readonly number[])[];
  boxOf: (index: number) => number;
}

function makeShape(size: number, boxRows: number, boxCols: number): Shape {
  const cells = size * size;
  const perRow = size / boxCols;
  const boxOf = (index: number) => Math.floor(Math.floor(index / size) / boxRows) * perRow + Math.floor((index % size) / boxCols);
  const units = [
    ...Array.from({ length: size }, (_, r) => Array.from({ length: size }, (_, c) => r * size + c)),
    ...Array.from({ length: size }, (_, c) => Array.from({ length: size }, (_, r) => r * size + c)),
    ...Array.from({ length: size }, (_, b) =>
      Array.from({ length: size }, (_, k) => (Math.floor(b / perRow) * boxRows + Math.floor(k / boxCols)) * size + (b % perRow) * boxCols + (k % boxCols)),
    ),
  ];
  const peers = Array.from({ length: cells }, (_, index) => {
    const out: number[] = [];
    for (let other = 0; other < cells; other += 1) {
      if (other === index) continue;
      if (Math.floor(other / size) === Math.floor(index / size) || other % size === index % size || boxOf(other) === boxOf(index)) out.push(other);
    }
    return out;
  });
  const digits = Array.from({ length: size }, (_, k) => k + 1);
  return { size, cells, boxRows, boxCols, all: digits.reduce((m, d) => m | (1 << d), 0), digits, peers, units, boxOf };
}

export const CLASSIC = makeShape(9, 3, 3);
export const MINI = makeShape(6, 2, 3);

export function shapeOf(grid: { length: number }): Shape {
  return grid.length === MINI.cells ? MINI : CLASSIC;
}

// 아래는 클래식 9×9 이름(예전 코드와 테스트가 씀)
export const SIZE = 9;
export const CELLS = 81;
export const ALL_DIGITS = 0x3fe; // 1~9 비트

export type SudokuGrid = number[];

export const boxOf = CLASSIC.boxOf;

/** 각 칸과 같은 줄·칸줄·상자에 있는 다른 20칸(이웃). */
export const PEERS = CLASSIC.peers;

/** 줄 9개 + 칸줄 9개 + 상자 9개 = 27개 묶음. */
export const UNITS = CLASSIC.units;

export function bitCount(mask: number): number {
  let count = 0;
  let m = mask;
  while (m) {
    m &= m - 1;
    count += 1;
  }
  return count;
}

/** 규칙에 어긋나는(같은 묶음에 같은 숫자가 있는) 칸 번호들. */
export function findConflicts(grid: SudokuGrid): Set<number> {
  const conflicts = new Set<number>();
  const { cells, peers } = shapeOf(grid);
  for (let i = 0; i < cells; i += 1) {
    const value = grid[i];
    if (!value) continue;
    for (const peer of peers[i]) {
      if (grid[peer] === value) {
        conflicts.add(i);
        break;
      }
    }
  }
  return conflicts;
}

/** 81칸(미니는 36칸) 문자열(빈칸은 0 또는 .)과 판 배열을 오갑니다. 서버 문제 풀에 이 문자열로 저장합니다. */
export function parseGrid(text: string): SudokuGrid {
  const cleaned = text.replace(/\s/g, "");
  if (cleaned.length !== CELLS && cleaned.length !== MINI.cells) throw new Error(`스도쿠 문자열은 81자(미니 36자)여야 합니다(${cleaned.length}자).`);
  const { size } = shapeOf(cleaned);
  return Array.from(cleaned, (ch) => {
    if (ch === "." || ch === "0") return 0;
    const digit = Number(ch);
    if (!Number.isInteger(digit) || digit < 1 || digit > size) throw new Error(`스도쿠 문자열에 쓸 수 없는 글자: ${ch}`);
    return digit;
  });
}

export function formatGrid(grid: SudokuGrid): string {
  return grid.map((v) => (v ? String(v) : "0")).join("");
}
