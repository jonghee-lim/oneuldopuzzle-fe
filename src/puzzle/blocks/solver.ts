// 블록 채우기 검사기: 주어진 블록들로 판을 채우는 방법을 limit개까지 셉니다.
// 같은 모양 블록끼리 자리만 바꾼 것은 같은 답으로 봅니다(모양별 개수로 셈).
import { cellsAt, shapeKey, type Shape } from "./rules.ts";

export function countTilings(size: number, shapes: readonly Shape[], limit = 2): number {
  const kinds = new Map<string, { shape: Shape; left: number }>();
  for (const s of shapes) {
    const k = shapeKey(s);
    const e = kinds.get(k);
    if (e) e.left += 1;
    else kinds.set(k, { shape: s, left: 1 });
  }
  const list = [...kinds.values()];
  const filled = new Array<boolean>(size * size).fill(false);
  let count = 0;
  const go = () => {
    if (count >= limit) return;
    const first = filled.indexOf(false);
    if (first === -1) {
      count += 1;
      return;
    }
    // 비어 있는 첫 칸(읽는 순서)은 어떤 블록의 기준 칸이어야 합니다.
    for (const kind of list) {
      if (kind.left === 0) continue;
      const cells = cellsAt(kind.shape, size, first);
      if (!cells || cells.some((i) => filled[i])) continue;
      for (const i of cells) filled[i] = true;
      kind.left -= 1;
      go();
      kind.left += 1;
      for (const i of cells) filled[i] = false;
    }
  };
  go();
  return count;
}
