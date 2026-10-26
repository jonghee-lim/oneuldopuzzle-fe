// 슬라이딩 퍼즐 생성기: 맞춘 판에서 무작위로 밀어 섞으므로 언제나 풀 수 있습니다(설계서: 풀 수 있는 배치인지 확인).
import { createRng, seedFrom } from "../core/rng.ts";
import { isSolvable, isSolved, slideFrom, solvedBoard, type SlideBoard } from "./rules.ts";
import { boardsAtDepth, minSlides } from "./solver.ts";

export interface SlidePuzzle {
  id: string;
  size: number;
  board: SlideBoard;
  /** 3×3만: 최소 이동 수 */
  minMoves: number | null;
}

export function slideSizeForLevel(level: number): number {
  return level <= 15 ? 3 : 4;
}

export function generateSlide(seed: string, size: number, scramble: number): SlidePuzzle {
  const rng = createRng(seedFrom(seed));
  let board = solvedBoard(size);
  let last = -1;
  for (let k = 0; k < scramble || isSolved(board); k += 1) {
    const blank = board.indexOf(0);
    const options = Array.from({ length: size * size }, (_, i) => i).filter((i) => i !== last && slideFrom(board, size, i));
    const pick = options[Math.floor(rng() * options.length)];
    board = slideFrom(board, size, pick)!;
    last = blank;
  }
  if (!isSolvable(board, size)) throw new Error("풀 수 없는 배치");
  return { id: seed, size, board, minMoves: minSlides(board, size) };
}

/** 3×3 레벨이 목표로 하는 최소 이동 수: 레벨마다 한 수씩 늘어 18수에서 멈춥니다. */
export function slideTargetMoves(level: number): number {
  return Math.min(3 + level, 18);
}

export function slideForLevel(level: number): SlidePuzzle {
  const size = slideSizeForLevel(level);
  if (size > 3) return generateSlide(`slide-${level}`, size, Math.min(30 + level, 120));
  // 무작위로 섞으면 레벨이 올라도 오히려 쉬워질 수 있어, 최소 이동 수가 목표와 같은 배치 중에서 고릅니다.
  const pool = boardsAtDepth(slideTargetMoves(level));
  const pick = pool[Math.floor(createRng(seedFrom(`slide-${level}`))() * pool.length)];
  const board = pick.split("").map(Number);
  return { id: `slide-${level}`, size, board, minMoves: minSlides(board, size) };
}
