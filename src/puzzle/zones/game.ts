// 색깔 구역 퍼즐 한 판의 조작. 칸을 누르면 지금 도구(디저트 놓기·X 표시)대로 바뀝니다.
import { popHistory, pushHistory, type History } from "../core/history.ts";
import { isZoneSolved, zoneConflicts, type ZonePuzzle } from "./rules.ts";

export type ZoneTool = "place" | "cross";

/** 칸 상태: 0 비움, 1 X, 2 디저트 */
export interface ZoneGame {
  level: number;
  puzzle: ZonePuzzle;
  cells: number[];
  tool: ZoneTool;
  history: History<number[]>;
  elapsedSeconds: number;
  solved: boolean;
}

export function newZoneGame(level: number, puzzle: ZonePuzzle): ZoneGame {
  return { level, puzzle, cells: new Array<number>(puzzle.size * puzzle.size).fill(0), tool: "place", history: [], elapsedSeconds: 0, solved: false };
}

export function placedOf(game: ZoneGame): number[] {
  return game.cells.flatMap((v, i) => (v === 2 ? [i] : []));
}

export function tapZoneCell(game: ZoneGame, index: number): ZoneGame {
  if (game.solved) return game;
  const want = game.tool === "place" ? 2 : 1;
  const cells = game.cells.slice();
  cells[index] = cells[index] === want ? 0 : want;
  const { size, regions } = game.puzzle;
  const solved = isZoneSolved(size, regions, cells.flatMap((v, i) => (v === 2 ? [i] : [])));
  return { ...game, cells, history: pushHistory(game.history, game.cells), solved };
}

export function setZoneTool(game: ZoneGame, tool: ZoneTool): ZoneGame {
  return { ...game, tool };
}

export function undoZone(game: ZoneGame): ZoneGame {
  if (game.solved) return game;
  const { entry, history } = popHistory(game.history);
  return entry ? { ...game, cells: entry, history } : game;
}

export function restartZone(game: ZoneGame): ZoneGame {
  return { ...newZoneGame(game.level, game.puzzle), tool: game.tool };
}

export function tickZone(game: ZoneGame, seconds = 1): ZoneGame {
  return game.solved ? game : { ...game, elapsedSeconds: game.elapsedSeconds + seconds };
}

export function zoneGameConflicts(game: ZoneGame): Set<number> {
  return zoneConflicts(game.puzzle.size, game.puzzle.regions, placedOf(game));
}

/** 힌트: 잘못 놓은 마카롱이 있으면 그 칸(remove), 없으면 아직 비어 있는 줄의 정답 칸 하나 */
export interface ZoneHint {
  index: number;
  remove: boolean;
}

export function findZoneHint(game: ZoneGame): ZoneHint | null {
  if (game.solved) return null;
  const { size, solution } = game.puzzle;
  const wrong = game.cells.findIndex((v, i) => v === 2 && solution[Math.floor(i / size)] !== i % size);
  if (wrong >= 0) return { index: wrong, remove: true };
  for (let r = 0; r < size; r += 1) {
    const index = r * size + solution[r];
    if (game.cells[index] !== 2) return { index, remove: false };
  }
  return null;
}

export function applyZoneHint(game: ZoneGame, hint: ZoneHint): ZoneGame {
  const cells = game.cells.slice();
  cells[hint.index] = hint.remove ? 0 : 2;
  const { size, regions } = game.puzzle;
  const solved = isZoneSolved(size, regions, cells.flatMap((v, i) => (v === 2 ? [i] : [])));
  return { ...game, cells, history: pushHistory(game.history, game.cells), solved };
}
