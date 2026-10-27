// 슬라이딩 힌트: 다음에 누를 조각. 3×3은 최소 수 표로 정확히, 4×4는 가중 A* 탐색으로 맞춘 판까지 가는 길의 첫 수를 고릅니다.
import { isSolved, movableCells, slideFrom } from "./rules.ts";
import { minSlides } from "./solver.ts";

export function slideHint(board: readonly number[], size: number): number | null {
  if (isSolved(board)) return null;
  if (size === 3) {
    let best: number | null = null;
    let bestDist = Infinity;
    for (const i of movableCells(board, 3)) {
      const d = minSlides(slideFrom(board, 3, i)!, 3) ?? Infinity;
      if (d < bestDist) [best, bestDist] = [i, d];
    }
    return best;
  }
  return searchFirstMove(board, size);
}

/** 맨해튼 거리 + 같은 줄에서 순서가 뒤바뀐 조각 쌍(한 쌍마다 2수 더) */
function heuristic(board: readonly number[], size: number): number {
  let h = 0;
  for (let i = 0; i < board.length; i += 1) {
    const v = board[i];
    if (!v) continue;
    const t = v - 1;
    h += Math.abs(Math.floor(i / size) - Math.floor(t / size)) + Math.abs((i % size) - (t % size));
  }
  for (let line = 0; line < size; line += 1) {
    for (let a = 0; a < size; a += 1) {
      for (let b = a + 1; b < size; b += 1) {
        const ra = board[line * size + a];
        const rb = board[line * size + b];
        if (ra && rb && Math.floor((ra - 1) / size) === line && Math.floor((rb - 1) / size) === line && ra > rb) h += 2;
        const ca = board[a * size + line];
        const cb = board[b * size + line];
        if (ca && cb && (ca - 1) % size === line && (cb - 1) % size === line && ca > cb) h += 2;
      }
    }
  }
  return h;
}

/** 작은 우선순위 큐(최소 힙) */
class Heap<T> {
  private items: [number, T][] = [];
  get size() {
    return this.items.length;
  }
  push(priority: number, value: T) {
    const a = this.items;
    a.push([priority, value]);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop(): T | undefined {
    const a = this.items;
    if (!a.length) return undefined;
    const top = a[0][1];
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

function searchFirstMove(start: readonly number[], size: number, budget = 200_000): number | null {
  type Node = { board: number[]; g: number; first: number };
  const seen = new Map<string, number>();
  const heap = new Heap<Node>();
  const w = 2;
  heap.push(heuristic(start, size) * w, { board: start.slice(), g: 0, first: -1 });
  seen.set(start.join(","), 0);
  let fallback: { h: number; first: number } | null = null;
  for (let n = 0; heap.size && n < budget; n += 1) {
    const node = heap.pop()!;
    if (isSolved(node.board)) return node.first;
    const blank = node.board.indexOf(0);
    const br = Math.floor(blank / size);
    const bc = blank % size;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const r = br + dr;
      const c = bc + dc;
      if (r < 0 || r >= size || c < 0 || c >= size) continue;
      const tile = r * size + c;
      const next = slideFrom(node.board, size, tile)!;
      const key = next.join(",");
      const g = node.g + 1;
      if ((seen.get(key) ?? Infinity) <= g) continue;
      seen.set(key, g);
      const first = node.first < 0 ? tile : node.first;
      const h = heuristic(next, size);
      if (!fallback || h < fallback.h) fallback = { h, first };
      heap.push(g + h * w, { board: next, g, first });
    }
  }
  // 예산 안에 못 찾으면 가장 맞춘 판에 가까워지는 길의 첫 수
  return fallback?.first ?? null;
}
