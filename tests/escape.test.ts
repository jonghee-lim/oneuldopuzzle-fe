import { test } from "node:test";
import assert from "node:assert/strict";
import { newEscapeGame, restartEscape, tapBlock, tapEscapeCell, targetCells, undoEscape } from "../src/puzzle/escape/game.ts";
import { ESCAPES } from "../src/puzzle/escape/puzzles.ts";
import { ESCAPE_SIZE, formatBoard, parseBoard } from "../src/puzzle/escape/rules.ts";
import { solveEscape } from "../src/puzzle/escape/solver.ts";

test("판 문자열을 읽고 다시 쓴다", () => {
  for (const p of ESCAPES) assert.equal(formatBoard(parseBoard(p.board)), p.board);
  assert.throws(() => parseBoard("A".repeat(36)));
});

test("검사기: 막힌 판은 풀 수 없다고 알려 준다", () => {
  // 출구 줄에 가로 블록이 딸기 블록 앞을 막으면 못 나갑니다.
  assert.equal(solveEscape("............XXAA......................".slice(0, 36)), null);
});

for (const p of ESCAPES) {
  test(`스페셜 블록 탈출 '${p.name}': 풀 수 있고 최소 이동 수가 적힌 값과 같다`, () => {
    const solved = solveEscape(p.board);
    assert.ok(solved);
    assert.equal(solved.minMoves, p.minMoves);
  });
}

test("조작: 검사기의 풀이대로 블록을 누르고 칸을 누르면 탈출한다", () => {
  const p = ESCAPES[0];
  const solved = solveEscape(p.board)!;
  let g = newEscapeGame(p.board);
  for (const [id, pos] of solved.moves) {
    g = tapBlock(g, id);
    const cell = [...targetCells(g)].find(([, target]) => target === pos)![0];
    g = tapEscapeCell(g, cell);
  }
  assert.equal(g.escaped, true);
  assert.equal(g.moves, p.minMoves);
});

test("조작: 갈 수 없는 칸을 누르면 선택만 풀리고, 되돌리기·다시 하기가 된다", () => {
  let g = newEscapeGame(ESCAPES[1].board);
  const movable = g.blocks.find((b) => targetCells(tapBlock(g, b.id)).size > 0)!;
  g = tapBlock(g, movable.id);
  const before = g.blocks;
  const blocked = Array.from({ length: ESCAPE_SIZE * ESCAPE_SIZE }, (_, i) => i).find((i) => !targetCells(g).has(i))!;
  g = tapEscapeCell(g, blocked);
  assert.equal(g.selected, null);
  assert.deepEqual(g.blocks, before);
  g = tapBlock(g, movable.id);
  g = tapEscapeCell(g, [...targetCells(g).keys()][0]);
  assert.notDeepEqual(g.blocks, before);
  assert.deepEqual(undoEscape(g).blocks, before);
  assert.deepEqual(restartEscape(g).blocks, before);
});

test("블록을 쓸어 옮기면 쓴 칸 수만큼, 막히면 갈 수 있는 데까지", async () => {
  const { newEscapeGame, swipeBlock } = await import("../src/puzzle/escape/game.ts");
  // 딸기 블록(X)이 2행 0~1칸, 오른쪽은 비어 있는 판
  const g = newEscapeGame("......" + "......" + "XX...." + "......" + "......" + "......");
  const one = swipeBlock(g, "X", 1, 1);
  assert.equal(one.blocks.find((b) => b.id === "X").col, 1);
  assert.equal(one.moves, 1);
  const far = swipeBlock(g, "X", 1, 9);
  assert.equal(far.blocks.find((b) => b.id === "X").col, 4);
  assert.ok(far.escaped);
  const back = swipeBlock(g, "X", -1, 2);
  assert.equal(back.blocks, g.blocks); // 왼쪽 끝이라 못 감
  assert.equal(back.moves, 0);
});
