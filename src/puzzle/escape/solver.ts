// 블록 탈출 검사기: 너비 우선 탐색으로 가장 적은 이동 수를 구합니다. 한 번 밀기(거리와 상관없이)가 1수입니다.
// 풀 수 없는 판은 null을 돌려줍니다.
import { formatBoard, isEscaped, moveBlock, parseBoard, reachablePositions, type Block } from "./rules.ts";

export interface EscapeSolution {
  minMoves: number;
  /** 첫 수부터 차례로 [블록, 옮길 위치] */
  moves: [string, number][];
  /** 탐색한 판 수(어려움 참고용) */
  explored: number;
}

export function solveEscape(board: string, maxStates = 200_000): EscapeSolution | null {
  const start = parseBoard(board);
  if (isEscaped(start)) return { minMoves: 0, moves: [], explored: 1 };
  type Step = { prev: string | null; move: [string, number] | null };
  const seen = new Map<string, Step>();
  const startKey = formatBoard(start);
  seen.set(startKey, { prev: null, move: null });
  let frontier: Block[][] = [start];
  while (frontier.length && seen.size < maxStates) {
    const next: Block[][] = [];
    for (const blocks of frontier) {
      const key = formatBoard(blocks);
      for (const b of blocks) {
        for (const pos of reachablePositions(blocks, b.id)) {
          const moved = moveBlock(blocks, b.id, pos);
          const movedKey = formatBoard(moved);
          if (seen.has(movedKey)) continue;
          seen.set(movedKey, { prev: key, move: [b.id, pos] });
          if (isEscaped(moved)) {
            const moves: [string, number][] = [];
            let cursor: string | null = movedKey;
            while (cursor) {
              const step: Step = seen.get(cursor)!;
              if (step.move) moves.unshift(step.move);
              cursor = step.prev;
            }
            return { minMoves: moves.length, moves, explored: seen.size };
          }
          next.push(moved);
        }
      }
    }
    frontier = next;
  }
  return null;
}
