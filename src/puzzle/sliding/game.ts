// 슬라이딩 퍼즐 한 판의 조작
import { popHistory, pushHistory, type History } from "../core/history.ts";
import type { SlidePuzzle } from "./generator.ts";
import { isSolved, slideFrom, type SlideBoard } from "./rules.ts";

export interface SlideGame {
  level: number;
  puzzle: SlidePuzzle;
  board: SlideBoard;
  moves: number;
  history: History<SlideBoard>;
  elapsedSeconds: number;
  solved: boolean;
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
