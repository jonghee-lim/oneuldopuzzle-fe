// 슬라이딩 퍼즐(설계서 보너스 3번): 빈칸 하나가 있는 N×N 판에서 조각을 밀어 1, 2, 3… 순서로 맞춥니다.
// 터치만 씁니다. 빈칸과 같은 줄·칸줄의 조각을 누르면 그 사이 조각들이 빈칸 쪽으로 한꺼번에 밀립니다.

/** 판: 칸마다 조각 번호, 0은 빈칸 */
export type SlideBoard = number[];

export function solvedBoard(size: number): SlideBoard {
  return Array.from({ length: size * size }, (_, i) => (i === size * size - 1 ? 0 : i + 1));
}

export function isSolved(board: readonly number[]): boolean {
  return board.every((v, i) => (i === board.length - 1 ? v === 0 : v === i + 1));
}

/** 누른 칸이 빈칸과 같은 줄·칸줄이면 밀고 새 판을, 아니면 null */
export function slideFrom(board: readonly number[], size: number, index: number): SlideBoard | null {
  const blank = board.indexOf(0);
  if (index === blank) return null;
  const br = Math.floor(blank / size);
  const bc = blank % size;
  const r = Math.floor(index / size);
  const c = index % size;
  if (r !== br && c !== bc) return null;
  const step = r === br ? (c > bc ? 1 : -1) : c === bc ? (r > br ? size : -size) : 0;
  const next = board.slice();
  let hole = blank;
  while (hole !== index) {
    next[hole] = next[hole + step];
    hole += step;
  }
  next[index] = 0;
  return next;
}

/** 누르면 움직이는 칸들(빈칸과 같은 줄·칸줄) */
export function movableCells(board: readonly number[], size: number): Set<number> {
  const blank = board.indexOf(0);
  const set = new Set<number>();
  board.forEach((_, i) => {
    if (i !== blank && (Math.floor(i / size) === Math.floor(blank / size) || i % size === blank % size)) set.add(i);
  });
  return set;
}

/** 풀 수 있는 배치인지(뒤바뀜 수 홀짝 규칙) */
export function isSolvable(board: readonly number[], size: number): boolean {
  const tiles = board.filter((v) => v !== 0);
  let inversions = 0;
  for (let i = 0; i < tiles.length; i += 1) for (let j = i + 1; j < tiles.length; j += 1) if (tiles[i] > tiles[j]) inversions += 1;
  if (size % 2 === 1) return inversions % 2 === 0;
  const blankRowFromBottom = size - Math.floor(board.indexOf(0) / size);
  return (inversions + blankRowFromBottom) % 2 === 1;
}
