// 정사각형 판의 칸 번호 계산. 칸 번호는 왼쪽 위부터 오른쪽으로 0, 1, 2 … 입니다.

export function rowOf(index: number, size: number): number {
  return Math.floor(index / size);
}

export function colOf(index: number, size: number): number {
  return index % size;
}

export function indexOf(row: number, col: number, size: number): number {
  return row * size + col;
}

/** 판 크기(예: 9×9)로 전체 칸 수를 구합니다. */
export function cellCount(size: number): number {
  return size * size;
}
