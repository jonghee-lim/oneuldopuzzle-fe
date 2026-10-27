// 슬라이딩 퍼즐 한 판의 조작
import type { Tier } from "../core/tier.ts";
import { popHistory, pushHistory, type History } from "../core/history.ts";
import type { SlidePuzzle } from "./generator.ts";
import { isSolved, slideFrom, type SlideBoard } from "./rules.ts";

export interface SlideGame {
  level: number;
  /** 난이도(없으면 쉬움, 오늘의 퍼즐은 없음) */
  tier?: Tier;
  puzzle: SlidePuzzle;
  board: SlideBoard;
  moves: number;
  history: History<SlideBoard>;
  elapsedSeconds: number;
  solved: boolean;
  /** 힌트를 쓴 판(별 하나를 받지 못함) */
  usedHint?: boolean;
}

export function newSlideGame(level: number, puzzle: SlidePuzzle): SlideGame {
  return { level, puzzle, board: puzzle.board.slice(), moves: 0, history: [], elapsedSeconds: 0, solved: false };
}

export function tapSlide(game: SlideGame, index: number): SlideGame {
  if (game.solved) return game;
  const board = slideFrom(game.board, game.puzzle.size, index);
  if (!board) return game;
  return { ...game, board, moves: game.moves + 1, history: pushHistory(game.history, game.board), solved: isSolved(board) };
}

/** 힌트로 알려 준 조각을 밉니다(slideHint). */
export function applySlideHint(game: SlideGame, index: number): SlideGame {
  const next = tapSlide(game, index);
  return next === game ? game : { ...next, usedHint: true };
}

export function undoSlide(game: SlideGame): SlideGame {
  if (game.solved) return game;
  const { entry, history } = popHistory(game.history);
  return entry ? { ...game, board: entry, history, moves: game.moves + 1 } : game;
}

export function restartSlide(game: SlideGame): SlideGame {
  return newSlideGame(game.level, game.puzzle);
}

export function tickSlide(game: SlideGame, seconds = 1): SlideGame {
  return game.solved ? game : { ...game, elapsedSeconds: game.elapsedSeconds + seconds };
}

/** 조각을 쓸어 밀기: 빈칸이 쓴 방향(같은 줄·칸줄)에 있을 때만 그 조각부터 빈칸 쪽으로 밉니다. */
export function swipeSlide(game: SlideGame, index: number, dir: "up" | "down" | "left" | "right"): SlideGame {
  const size = game.puzzle.size;
  const blank = game.board.indexOf(0);
  const [r, c, br, bc] = [Math.floor(index / size), index % size, Math.floor(blank / size), blank % size];
  const toward =
    (dir === "left" && r === br && bc < c) || (dir === "right" && r === br && bc > c) || (dir === "up" && c === bc && br < r) || (dir === "down" && c === bc && br > r);
  return toward ? tapSlide(game, index) : game;
}
