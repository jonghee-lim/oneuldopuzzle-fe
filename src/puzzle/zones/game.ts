// 색깔 구역 퍼즐 한 판의 조작. 칸을 누르면 지금 도구(디저트 놓기·X 표시)대로 바뀝니다.
import type { Tier } from "../core/tier.ts";
import type { HintStep } from "../core/hint.ts";
import { popHistory, pushHistory, type History } from "../core/history.ts";
import { isZoneSolved, zoneConflicts, type ZonePuzzle } from "./rules.ts";

export type ZoneTool = "place" | "cross";

/** 칸 상태: 0 비움, 1 X, 2 디저트 */
export interface ZoneGame {
  level: number;
  /** 난이도(없으면 쉬움, 오늘의 퍼즐은 없음) */
  tier?: Tier;
  puzzle: ZonePuzzle;
  cells: number[];
  tool: ZoneTool;
  history: History<number[]>;
  elapsedSeconds: number;
  solved: boolean;
  /** 힌트를 쓴 판(별 하나를 받지 못함) */
  usedHint?: boolean;
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

/**
 * 막힌 칸: 놓은 마카롱과 같은 줄·칸줄·구역이거나 바로 붙은(대각선 포함) 빈칸. 마카롱이 갈 수 없는 칸을 흐린 X로 보여 줍니다(2026-10-27).
 * 저장하지 않고 놓인 마카롱에서 그때그때 셉니다(마카롱을 빼면 함께 사라짐).
 */
export function blockedZoneCells(game: ZoneGame): Set<number> {
  const { size, regions } = game.puzzle;
  const out = new Set<number>();
  for (const p of placedOf(game)) {
    const [pr, pc] = [Math.floor(p / size), p % size];
    game.cells.forEach((v, i) => {
      if (v !== 0) return;
      const [r, c] = [Math.floor(i / size), i % size];
      if (r === pr || c === pc || regions[i] === regions[p] || (Math.abs(r - pr) <= 1 && Math.abs(c - pc) <= 1)) out.add(i);
    });
  }
  return out;
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

/** 힌트를 놓기 전에 보여 줄 단계: 볼 구역, 그다음 자리 */
export function zoneHintSteps(game: ZoneGame, hint: ZoneHint): HintStep[] {
  const { size, regions } = game.puzzle;
  if (hint.remove) return [{ cells: [hint.index], text: "표시한 마카롱은 자리가 아니에요." }];
  const region = regions.flatMap((g, k) => (g === regions[hint.index] ? [k] : []));
  return [
    { cells: region, text: "표시한 색 구역을 보세요. 다른 마카롱과 같은 줄이거나 맞닿는 칸을 빼 보세요." },
    { cells: [hint.index], text: `이 구역의 마카롱은 ${Math.floor(hint.index / size) + 1}행 ${(hint.index % size) + 1}열이에요.` },
  ];
}

export function applyZoneHint(game: ZoneGame, hint: ZoneHint): ZoneGame {
  const cells = game.cells.slice();
  cells[hint.index] = hint.remove ? 0 : 2;
  const { size, regions } = game.puzzle;
  const solved = isZoneSolved(size, regions, cells.flatMap((v, i) => (v === 2 ? [i] : [])));
  return { ...game, cells, history: pushHistory(game.history, game.cells), solved, usedHint: true };
}
