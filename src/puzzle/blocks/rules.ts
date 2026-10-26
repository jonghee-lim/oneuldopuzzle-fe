// 블록 채우기(설계서 보너스 2번): 1·2·3·4칸짜리 블록을 정사각형 판에 빈틈없이 채웁니다.
// 터치만 씁니다. 아래 블록을 고르고 판의 칸을 누르면, 블록의 '기준 칸'(맨 윗줄 왼쪽 칸)이 그 칸에 오도록 놓입니다.
// 블록은 돌리지 않습니다(보이는 모양 그대로). 놓은 블록을 누르면 다시 아래로 돌아갑니다.

/** 블록 모양: 기준 칸(0,0)에서의 [줄, 칸줄] 차이. 첫 칸이 늘 기준 칸입니다. */
export type Shape = readonly (readonly [number, number])[];

/** 칸 묶음을 기준 칸 기준 모양으로 바꿉니다(맨 윗줄 왼쪽 칸이 [0,0]). */
export function shapeOf(cells: readonly number[], size: number): Shape {
  const pts = cells.map((i) => [Math.floor(i / size), i % size] as const).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const [r0, c0] = pts[0];
  return pts.map(([r, c]) => [r - r0, c - c0] as const);
}

export function shapeKey(shape: Shape): string {
  return shape.map(([r, c]) => `${r},${c}`).join(";");
}

/** 기준 칸을 anchor에 두었을 때 덮는 칸들, 판 밖으로 나가면 null */
export function cellsAt(shape: Shape, size: number, anchor: number): number[] | null {
  const r0 = Math.floor(anchor / size);
  const c0 = anchor % size;
  const out: number[] = [];
  for (const [dr, dc] of shape) {
    const r = r0 + dr;
    const c = c0 + dc;
    if (r < 0 || r >= size || c < 0 || c >= size) return null;
    out.push(r * size + c);
  }
  return out;
}
