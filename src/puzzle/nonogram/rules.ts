// 노노그램: 줄마다 적힌 숫자(연속으로 칠한 칸 묶음 길이)를 보고 칸을 칠해 그림을 완성합니다.
// 판은 행 우선 배열이고 1은 칠한 칸, 0은 빈칸입니다.

export interface NonogramPicture {
  id: string;
  name: string;
  /** "X"는 칠한 칸, "."은 빈칸. 줄마다 같은 길이 */
  rows: string[];
}

export interface NonogramClues {
  width: number;
  height: number;
  rows: number[][];
  cols: number[][];
}

export function pictureGrid(picture: NonogramPicture): number[] {
  return picture.rows.flatMap((line) => Array.from(line, (ch) => (ch === "X" ? 1 : 0)));
}

/** 한 줄의 단서: 연속으로 칠한 칸 묶음 길이들. 빈 줄은 [0]으로 적습니다. */
export function lineClue(line: readonly number[]): number[] {
  const clue: number[] = [];
  let run = 0;
  for (const v of line) {
    if (v === 1) run += 1;
    else if (run) {
      clue.push(run);
      run = 0;
    }
  }
  if (run) clue.push(run);
  return clue.length ? clue : [0];
}

export function cluesOf(grid: readonly number[], width: number, height: number): NonogramClues {
  const rows = Array.from({ length: height }, (_, r) => lineClue(grid.slice(r * width, r * width + width)));
  const cols = Array.from({ length: width }, (_, c) => lineClue(Array.from({ length: height }, (_, r) => grid[r * width + c])));
  return { width, height, rows, cols };
}

export function sameClue(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
