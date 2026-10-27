// 노노그램 한 판의 조작. 칸을 누르면 지금 도구(칠하기·X 표시)대로 바뀝니다. 끌어서 여러 칸 칠하기는 쓰지 않습니다.
import type { HintStep } from "../core/hint.ts";
import { popHistory, pushHistory, type History } from "../core/history.ts";
import { cluesOf, lineClue, pictureGrid, sameClue, type NonogramClues, type NonogramPicture } from "./rules.ts";

export type NonogramTool = "fill" | "cross";

/** 칸 상태: 0 비움, 1 칠함, 2 X(비어 있다고 표시) */
export interface NonogramGame {
  /** 레벨 번호(끝없는 레벨, 2026-10-27). 0이면 레벨 밖 판(시험용) */
  level: number;
  /** 그림 이름(손으로 그린 그림이면 완성 창에 보여 줌) */
  name: string;
  width: number;
  height: number;
  solution: number[];
  clues: NonogramClues;
  cells: number[];
  tool: NonogramTool;
  history: History<number[]>;
  solved: boolean;
  /** 답에서 비어 있어야 할 칸을 칠한 횟수(별 조건) */
  mistakes?: number;
  /** 힌트를 쓴 판(별 하나를 받지 못함) */
  usedHint?: boolean;
}

export function newNonogramGame(picture: NonogramPicture, level = 0): NonogramGame {
  const width = picture.rows[0].length;
  const height = picture.rows.length;
  const solution = pictureGrid(picture);
  return {
    level,
    name: picture.name,
    width,
    height,
    solution,
    clues: cluesOf(solution, width, height),
    cells: new Array<number>(width * height).fill(0),
    tool: "fill",
    history: [],
    solved: false,
  };
}

export function tapNonogramCell(game: NonogramGame, index: number): NonogramGame {
  if (game.solved) return game;
  const want = game.tool === "fill" ? 1 : 2;
  const cells = game.cells.slice();
  cells[index] = cells[index] === want ? 0 : want;
  const mistakes = (game.mistakes ?? 0) + (cells[index] === 1 && game.solution[index] !== 1 ? 1 : 0);
  // 단서는 칠한 칸만 봅니다. 답과 같은 그림이면 완성입니다(답이 하나라 단서가 맞으면 곧 답입니다).
  const solved = cells.every((v, i) => (v === 1) === (game.solution[i] === 1));
  return { ...game, cells, history: pushHistory(game.history, game.cells), solved, mistakes };
}

export function setTool(game: NonogramGame, tool: NonogramTool): NonogramGame {
  return { ...game, tool };
}

export function undoNonogram(game: NonogramGame): NonogramGame {
  if (game.solved) return game;
  const { entry, history } = popHistory(game.history);
  return entry ? { ...game, cells: entry, history } : game;
}

export function restartNonogram(game: NonogramGame): NonogramGame {
  return { ...game, cells: new Array<number>(game.cells.length).fill(0), history: [], solved: false, mistakes: 0, usedHint: false };
}

/** 줄의 칠한 칸이 단서와 맞으면 그 단서를 흐리게 보여 줍니다. */
export function rowDone(game: NonogramGame, r: number): boolean {
  const line = game.cells.slice(r * game.width, r * game.width + game.width).map((v) => (v === 1 ? 1 : 0));
  return sameClue(lineClue(line), game.clues.rows[r]);
}

export function colDone(game: NonogramGame, c: number): boolean {
  const line = Array.from({ length: game.height }, (_, r) => (game.cells[r * game.width + c] === 1 ? 1 : 0));
  return sameClue(lineClue(line), game.clues.cols[c]);
}

/** 힌트: 잘못 칠한 칸이 있으면 X로 바꾸고(remove), 없으면 칠해야 하는 칸 하나를 칠합니다. 이미 많이 맞춘 줄부터 채웁니다. */
export interface NonogramHint {
  index: number;
  remove: boolean;
}

export function findNonogramHint(game: NonogramGame): NonogramHint | null {
  if (game.solved) return null;
  const wrong = game.cells.findIndex((v, i) => v === 1 && game.solution[i] !== 1);
  if (wrong >= 0) return { index: wrong, remove: true };
  let best: number | null = null;
  let bestDone = -1;
  for (let r = 0; r < game.height; r += 1) {
    const row = Array.from({ length: game.width }, (_, c) => r * game.width + c);
    const missing = row.filter((i) => game.solution[i] === 1 && game.cells[i] !== 1);
    if (!missing.length) continue;
    const done = row.filter((i) => game.solution[i] === 1 && game.cells[i] === 1).length;
    if (done > bestDone) [best, bestDone] = [missing[0], done];
  }
  return best === null ? null : { index: best, remove: false };
}

/** 힌트를 칠하기 전에 보여 줄 단계: 볼 줄, 그다음 칸 */
export function nonogramHintSteps(game: NonogramGame, hint: NonogramHint): HintStep[] {
  if (hint.remove) return [{ cells: [hint.index], text: "표시한 칸은 비어 있어야 해요." }];
  const r = Math.floor(hint.index / game.width);
  const row = Array.from({ length: game.width }, (_, c) => r * game.width + c);
  return [
    { cells: row, text: `${r + 1}번째 줄 단서를 보세요. 칠한 칸과 단서를 맞춰 보세요.` },
    { cells: [hint.index], text: "이 줄에서 표시한 칸은 칠해야 해요." },
  ];
}

export function applyNonogramHint(game: NonogramGame, hint: NonogramHint): NonogramGame {
  const cells = game.cells.slice();
  cells[hint.index] = hint.remove ? 2 : 1;
  const solved = cells.every((v, i) => (v === 1) === (game.solution[i] === 1));
  return { ...game, cells, history: pushHistory(game.history, game.cells), solved, usedHint: true };
}
