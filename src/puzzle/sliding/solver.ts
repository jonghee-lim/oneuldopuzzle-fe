// 3×3 판의 최소 이동 수(한 번 누르기 = 한 수, 여러 조각을 한꺼번에 밀어도 한 수).
// 3×3은 배치가 18만 개뿐이라 맞춘 판에서 한 번 거꾸로 넓혀 모든 배치의 최소 수를 표로 만들어 둡니다(처음 쓸 때 한 번).
// 4×4는 배치가 너무 많아 세지 않습니다.
import { slideFrom, solvedBoard } from "./rules.ts";

let table: { dist: Map<string, number>; byDepth: string[][] } | null = null;

function build() {
  const start = solvedBoard(3);
  const dist = new Map<string, number>([[start.join(""), 0]]);
  const byDepth: string[][] = [[start.join("")]];
  let frontier = [start];
  for (let depth = 1; frontier.length; depth += 1) {
    const next: number[][] = [];
    const keys: string[] = [];
    for (const b of frontier) {
      for (let i = 0; i < 9; i += 1) {
        const n = slideFrom(b, 3, i);
        if (!n) continue;
        const k = n.join("");
        if (dist.has(k)) continue;
        dist.set(k, depth);
        keys.push(k);
        next.push(n);
      }
    }
    if (keys.length) byDepth.push(keys);
    frontier = next;
  }
  return { dist, byDepth };
}

function slideTable() {
  table ??= build();
  return table;
}

export function minSlides(board: readonly number[], size: number): number | null {
  if (size !== 3) return null;
  return slideTable().dist.get(board.join("")) ?? null;
}

/** 최소 이동 수가 정확히 depth인 3×3 배치들 */
export function boardsAtDepth(depth: number): readonly string[] {
  const { byDepth } = slideTable();
  return byDepth[Math.min(depth, byDepth.length - 1)];
}
