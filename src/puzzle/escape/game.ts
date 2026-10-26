// 블록 탈출 한 판의 조작. '블록 누르기 → 갈 칸 누르기' 또는 블록을 쓸어서(스와이프) 옮깁니다.
import { popHistory, pushHistory, type History } from "../core/history.ts";
import { ESCAPE_SIZE, isEscaped, moveBlock, parseBoard, reachablePositions, type Block } from "./rules.ts";

export interface EscapeGame {
  blocks: Block[];
  start: Block[];
  selected: string | null;
  moves: number;
  history: History<Block[]>;
  escaped: boolean;
}

export function newEscapeGame(board: string): EscapeGame {
  const blocks = parseBoard(board);
  return { blocks, start: blocks, selected: null, moves: 0, history: [], escaped: false };
}

/** 고른 블록이 갈 수 있는 칸(칸 번호 → 그 칸을 누르면 옮길 위치) */
export function targetCells(game: EscapeGame): Map<number, number> {
  const targets = new Map<number, number>();
  const block = game.blocks.find((b) => b.id === game.selected);
  if (!block) return targets;
  for (const pos of reachablePositions(game.blocks, block.id)) {
    const current = block.horizontal ? block.col : block.row;
    // 누른 칸까지 블록 끝이 닿게 옮깁니다: 앞으로 가면 앞쪽 끝, 뒤로 가면 뒤쪽 끝 칸이 대상입니다.
    const edge = pos > current ? pos + block.length - 1 : pos;
    const index = block.horizontal ? block.row * ESCAPE_SIZE + edge : edge * ESCAPE_SIZE + block.col;
    targets.set(index, pos);
  }
  return targets;
}

export function tapBlock(game: EscapeGame, id: string): EscapeGame {
  if (game.escaped) return game;
  return { ...game, selected: game.selected === id ? null : id };
}

export function tapEscapeCell(game: EscapeGame, index: number): EscapeGame {
  if (game.escaped || !game.selected) return game;
  const pos = targetCells(game).get(index);
  if (pos === undefined) return { ...game, selected: null };
  const blocks = moveBlock(game.blocks, game.selected, pos);
  const escaped = isEscaped(blocks);
  return {
    ...game,
    blocks,
    moves: game.moves + 1,
    history: pushHistory(game.history, game.blocks),
    escaped,
    selected: escaped ? null : game.selected,
  };
}

export function undoEscape(game: EscapeGame): EscapeGame {
  if (game.escaped) return game;
  const { entry, history } = popHistory(game.history);
  if (!entry) return game;
  return { ...game, blocks: entry, history, moves: game.moves + 1, selected: null };
}

export function restartEscape(game: EscapeGame): EscapeGame {
  return { ...game, blocks: game.start, selected: null, moves: 0, history: [], escaped: false };
}

/** 블록을 쓸어 옮기기: 쓴 칸 수만큼(최소 1칸) 그 방향으로, 막히면 갈 수 있는 데까지 갑니다. */
export function swipeBlock(game: EscapeGame, id: string, step: -1 | 1, cells: number): EscapeGame {
  if (game.escaped) return game;
  const block = game.blocks.find((b) => b.id === id);
  if (!block) return game;
  const current = block.horizontal ? block.col : block.row;
  const reach = reachablePositions(game.blocks, id).filter((p) => (p - current) * step > 0);
  if (reach.length === 0) return { ...game, selected: id };
  const want = current + step * Math.max(1, cells);
  const far = step > 0 ? Math.max(...reach) : Math.min(...reach);
  const pos = step > 0 ? Math.min(want, far) : Math.max(want, far);
  const blocks = moveBlock(game.blocks, id, pos);
  const escaped = isEscaped(blocks);
  return { ...game, blocks, moves: game.moves + 1, history: pushHistory(game.history, game.blocks), escaped, selected: escaped ? null : id };
}
