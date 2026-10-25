// 클래식 스도쿠(9×9)의 칸·줄·상자 관계. 판은 길이 81 배열이고 0은 빈칸입니다.

export const SIZE = 9;
export const CELLS = 81;
export const ALL_DIGITS = 0x3fe; // 1~9 비트

export type SudokuGrid = number[];

export function boxOf(index: number): number {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

/** 각 칸과 같은 줄·칸줄·상자에 있는 다른 20칸(이웃). */
export const PEERS: readonly (readonly number[])[] = Array.from({ length: CELLS }, (_, index) => {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  const box = boxOf(index);
  const peers: number[] = [];
  for (let other = 0; other < CELLS; other += 1) {
    if (other === index) continue;
    if (Math.floor(other / SIZE) === row || other % SIZE === col || boxOf(other) === box) peers.push(other);
  }
  return peers;
});

/** 줄 9개 + 칸줄 9개 + 상자 9개 = 27개 묶음. */
export const UNITS: readonly (readonly number[])[] = [
  ...Array.from({ length: SIZE }, (_, r) => Array.from({ length: SIZE }, (_, c) => r * SIZE + c)),
  ...Array.from({ length: SIZE }, (_, c) => Array.from({ length: SIZE }, (_, r) => r * SIZE + c)),
  ...Array.from({ length: SIZE }, (_, b) =>
    Array.from({ length: SIZE }, (_, k) => (Math.floor(b / 3) * 3 + Math.floor(k / 3)) * SIZE + (b % 3) * 3 + (k % 3)),
  ),
];

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
  for (let i = 0; i < CELLS; i += 1) {
    const value = grid[i];
    if (!value) continue;
    for (const peer of PEERS[i]) {
      if (grid[peer] === value) {
        conflicts.add(i);
        break;
      }
    }
  }
  return conflicts;
}

/** 81칸 문자열(빈칸은 0 또는 .)과 판 배열을 오갑니다. 서버 문제 풀에 이 문자열로 저장합니다. */
export function parseGrid(text: string): SudokuGrid {
  const cleaned = text.replace(/\s/g, "");
  if (cleaned.length !== CELLS) throw new Error(`스도쿠 문자열은 81자여야 합니다(${cleaned.length}자).`);
  return Array.from(cleaned, (ch) => {
    if (ch === "." || ch === "0") return 0;
    const digit = Number(ch);
    if (!Number.isInteger(digit) || digit < 1 || digit > 9) throw new Error(`스도쿠 문자열에 쓸 수 없는 글자: ${ch}`);
    return digit;
  });
}

export function formatGrid(grid: SudokuGrid): string {
  return grid.map((v) => (v ? String(v) : "0")).join("");
}
