// 노노그램 한 판의 조작. 칸을 누르면 지금 도구(칠하기·X 표시)대로 바뀝니다. 끌어서 여러 칸 칠하기는 쓰지 않습니다.
import { popHistory, pushHistory, type History } from "../core/history.ts";
import { cluesOf, lineClue, pictureGrid, sameClue, type NonogramClues, type NonogramPicture } from "./rules.ts";

export type NonogramTool = "fill" | "cross";

/** 칸 상태: 0 비움, 1 칠함, 2 X(비어 있다고 표시) */
export interface NonogramGame {
  width: number;
  height: number;
  solution: number[];
  clues: NonogramClues;
  cells: number[];
  tool: NonogramTool;
  history: History<number[]>;
  solved: boolean;
}

export function newNonogramGame(picture: NonogramPicture): NonogramGame {
  const width = picture.rows[0].length;
  const height = picture.rows.length;
  const solution = pictureGrid(picture);
  return {
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
  // 단서는 칠한 칸만 봅니다. 답과 같은 그림이면 완성입니다(답이 하나라 단서가 맞으면 곧 답입니다).
  const solved = cells.every((v, i) => (v === 1) === (game.solution[i] === 1));
  return { ...game, cells, history: pushHistory(game.history, game.cells), solved };
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
  return { ...game, cells: new Array<number>(game.cells.length).fill(0), history: [], solved: false };
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
