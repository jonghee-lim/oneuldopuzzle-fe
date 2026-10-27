// 블록 채우기 한 판의 조작: 블록 고르기 → 칸 누르기로 놓기, 놓인 블록 누르기로 빼기.
import { popHistory, pushHistory, type History } from "../core/history.ts";
import type { BlockPuzzle } from "./generator.ts";
import { cellsAt } from "./rules.ts";

export interface BlockGame {
  level: number;
  puzzle: BlockPuzzle;
  /** 블록마다 기준 칸 위치(아직 안 놓았으면 null) */
  placed: (number | null)[];
  selected: number | null;
  history: History<(number | null)[]>;
  elapsedSeconds: number;
  solved: boolean;
}

export function newBlockGame(level: number, puzzle: BlockPuzzle): BlockGame {
  return { level, puzzle, placed: puzzle.shapes.map(() => null), selected: 0, history: [], elapsedSeconds: 0, solved: false };
}

/** 칸마다 놓인 블록 번호(-1 비어 있음) */
export function occupancy(game: BlockGame): number[] {
  const { size, shapes } = game.puzzle;
  const occ = new Array<number>(size * size).fill(-1);
  game.placed.forEach((anchor, k) => {
    if (anchor === null) return;
    for (const i of cellsAt(shapes[k], size, anchor) ?? []) occ[i] = k;
  });
  return occ;
}

export function selectBlock(game: BlockGame, piece: number): BlockGame {
  if (game.solved || game.placed[piece] !== null) return game;
  return { ...game, selected: game.selected === piece ? null : piece };
}

/** 첫 번째로 아직 안 놓은 블록 */
function nextFree(placed: readonly (number | null)[], after = -1): number | null {
  for (let k = 1; k <= placed.length; k += 1) {
    const j = (after + k) % placed.length;
    if (placed[j] === null) return j;
  }
  return null;
}

/** 이 칸에 고른 블록을 놓을 수 있는지 */
export function canPlace(game: BlockGame, anchor: number, occ = occupancy(game)): boolean {
  if (game.selected === null) return false;
  const cells = cellsAt(game.puzzle.shapes[game.selected], game.puzzle.size, anchor);
  return !!cells && cells.every((i) => occ[i] === -1);
}

export type BlockTapResult = "placed" | "removed" | "blocked" | "none";

export function tapBlockCell(game: BlockGame, index: number): { game: BlockGame; result: BlockTapResult } {
  if (game.solved) return { game, result: "none" };
  const occ = occupancy(game);
  if (occ[index] !== -1) {
    const placed = game.placed.slice();
    placed[occ[index]] = null;
    return { game: { ...game, placed, selected: occ[index], history: pushHistory(game.history, game.placed) }, result: "removed" };
  }
  if (game.selected === null) return { game, result: "none" };
  if (!canPlace(game, index, occ)) return { game, result: "blocked" };
  const placed = game.placed.slice();
  placed[game.selected] = index;
  const solved = placed.every((a) => a !== null);
  return {
    game: { ...game, placed, selected: solved ? null : nextFree(placed, game.selected), history: pushHistory(game.history, game.placed), solved },
    result: "placed",
  };
}

export function undoBlocks(game: BlockGame): BlockGame {
  if (game.solved) return game;
  const { entry, history } = popHistory(game.history);
  return entry ? { ...game, placed: entry, history, selected: nextFree(entry) } : game;
}

export function restartBlocks(game: BlockGame): BlockGame {
  return newBlockGame(game.level, game.puzzle);
}

export function tickBlocks(game: BlockGame, seconds = 1): BlockGame {
  return game.solved ? game : { ...game, elapsedSeconds: game.elapsedSeconds + seconds };
}

/** 힌트: 정답과 다른 곳에 놓은 블록이 있으면 그 블록(remove), 없으면 아직 안 놓은 블록 하나와 정답 자리 */
export interface BlockHint {
  piece: number;
  anchor: number;
  remove: boolean;
}

/** 블록마다 정답 기준 칸(모양의 맨 윗줄 왼쪽 칸 = 정답 칸 중 가장 앞 번호) */
export function solutionAnchors(puzzle: BlockPuzzle): number[] {
  return puzzle.shapes.map((_, k) => puzzle.solution.indexOf(k));
}

export function findBlockHint(game: BlockGame): BlockHint | null {
  if (game.solved) return null;
  const anchors = solutionAnchors(game.puzzle);
  const wrong = game.placed.findIndex((a, k) => a !== null && a !== anchors[k]);
  if (wrong >= 0) return { piece: wrong, anchor: game.placed[wrong]!, remove: true };
  const free = game.placed.findIndex((a) => a === null);
  return free < 0 ? null : { piece: free, anchor: anchors[free], remove: false };
}

export function applyBlockHint(game: BlockGame, hint: BlockHint): BlockGame {
  const placed = game.placed.slice();
  placed[hint.piece] = hint.remove ? null : hint.anchor;
  const solved = placed.every((a) => a !== null);
  const selected = solved ? null : hint.remove ? hint.piece : nextFree(placed, hint.piece);
  return { ...game, placed, selected, history: pushHistory(game.history, game.placed), solved };
}
