import { test } from "node:test";
import assert from "node:assert/strict";
import { NONOGRAMS } from "../src/puzzle/nonogram/puzzles.ts";
import { cluesOf, lineClue, pictureGrid } from "../src/puzzle/nonogram/rules.ts";
import { solveNonogram } from "../src/puzzle/nonogram/solver.ts";

test("단서 계산", () => {
  assert.deepEqual(lineClue([1, 1, 0, 1, 0]), [2, 1]);
  assert.deepEqual(lineClue([0, 0, 0]), [0]);
});

test("검사기: 답이 여러 개인 그림을 거른다", () => {
  // 대각선 두 칸은 반대 대각선과 단서가 같아 답이 둘
  const clues = cluesOf([1, 0, 0, 1], 2, 2);
  assert.equal(solveNonogram(clues).count, 2);
});

for (const picture of NONOGRAMS) {
  test(`스페셜 노노그램 '${picture.name}': 모양이 맞고, 답이 하나이며, 줄 풀기만으로 풀린다`, () => {
    const width = picture.rows[0].length;
    assert.ok(picture.rows.every((r) => r.length === width && /^[X.]+$/.test(r)));
    const grid = pictureGrid(picture);
    const result = solveNonogram(cluesOf(grid, width, picture.rows.length));
    assert.equal(result.count, 1);
    assert.deepEqual(result.solution, grid);
    assert.equal(result.lineSolvable, true);
  });
}

import { colDone, newNonogramGame, restartNonogram, rowDone, setTool, tapNonogramCell, undoNonogram } from "../src/puzzle/nonogram/game.ts";

test("조작: 칠하기·X 표시, 줄 완료 표시, 완성, 되돌리기·다시 하기", () => {
  let g = newNonogramGame(NONOGRAMS[0]);
  g = setTool(g, "cross");
  g = tapNonogramCell(g, 0);
  assert.equal(g.cells[0], 2);
  g = setTool(g, "fill");
  g.solution.forEach((v, i) => {
    if (v === 1 && !g.solved) g = tapNonogramCell(g, i);
  });
  assert.equal(g.solved, true);
  assert.equal(rowDone(g, 0), true);
  assert.equal(colDone(g, 0), true);
  let h = tapNonogramCell(newNonogramGame(NONOGRAMS[0]), 1);
  assert.equal(undoNonogram(h).cells[1], 0);
  h = tapNonogramCell(h, 2);
  assert.equal(restartNonogram(h).cells.every((v) => v === 0), true);
});
