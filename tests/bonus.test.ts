import { test } from "node:test";
import assert from "node:assert/strict";
import { blocksForLevel, blockSizeForLevel } from "../src/puzzle/blocks/generator.ts";
import { cellsAt, shapeOf } from "../src/puzzle/blocks/rules.ts";
import { countTilings } from "../src/puzzle/blocks/solver.ts";
import { newBlockGame, occupancy, restartBlocks, selectBlock, tapBlockCell, undoBlocks } from "../src/puzzle/blocks/game.ts";
import { slideForLevel, slideTargetMoves } from "../src/puzzle/sliding/generator.ts";
import { isSolvable, isSolved, movableCells, slideFrom, solvedBoard } from "../src/puzzle/sliding/rules.ts";
import { minSlides } from "../src/puzzle/sliding/solver.ts";
import { newSlideGame, tapSlide, undoSlide } from "../src/puzzle/sliding/game.ts";

test("슬라이딩: 한 번 누르면 같은 줄 조각이 한꺼번에 밀린다", () => {
  const b = solvedBoard(3); // 빈칸은 오른쪽 아래(8)
  assert.deepEqual(slideFrom(b, 3, 6), [1, 2, 3, 4, 5, 6, 0, 7, 8]);
  assert.deepEqual(slideFrom(b, 3, 2), [1, 2, 0, 4, 5, 3, 7, 8, 6]);
  assert.equal(slideFrom(b, 3, 0), null);
  assert.deepEqual([...movableCells(b, 3)].sort(), [2, 5, 6, 7]);
  assert.equal(minSlides([1, 2, 3, 4, 5, 6, 0, 7, 8], 3), 1);
});

test("슬라이딩: 레벨 1~40은 풀 수 있고 3×3은 최소 수가 레벨마다 늘어난다", () => {
  for (let level = 1; level <= 40; level += 1) {
    const p = slideForLevel(level);
    assert.ok(isSolvable(p.board, p.size), `레벨 ${level}`);
    assert.ok(!isSolved(p.board));
    if (p.size === 3) assert.equal(p.minMoves, slideTargetMoves(level));
  }
});

test("슬라이딩 판 조작: 밀기·되돌리기·완성", () => {
  const g0 = newSlideGame(1, { id: "t", size: 3, board: [1, 2, 3, 4, 5, 6, 0, 7, 8], minMoves: 1 });
  const g1 = tapSlide(g0, 8);
  assert.ok(g1.solved);
  assert.equal(g1.moves, 1);
  const g2 = undoSlide(tapSlide(g0, 0));
  assert.deepEqual(g2.board, g0.board);
});

test("블록 채우기: 모양은 기준 칸(맨 윗줄 왼쪽) 기준", () => {
  const s = shapeOf([1, 4, 5], 4); // ㄱ 뒤집은 모양
  assert.deepEqual(s, [[0, 0], [1, -1], [1, 0]]);
  assert.deepEqual(cellsAt(s, 4, 1), [1, 4, 5]);
  assert.equal(cellsAt(s, 4, 0), null);
});

test("블록 채우기: 레벨 1~60은 채우는 방법이 하나뿐이다", () => {
  for (let level = 1; level <= 60; level += 1) {
    const p = blocksForLevel(level);
    assert.equal(p.size, blockSizeForLevel(level));
    assert.equal(p.shapes.reduce((n, s) => n + s.length, 0), p.size * p.size);
    assert.equal(countTilings(p.size, p.shapes, 2), 1, `레벨 ${level}`);
  }
});

test("블록 채우기 판 조작: 놓기·막힘·빼기·되돌리기·완성", () => {
  const p = blocksForLevel(1);
  let g = newBlockGame(1, p);
  // 답대로 블록마다 기준 칸에 놓으면 완성
  const anchors = p.shapes.map((_, k) => p.solution.indexOf(k));
  assert.equal(selectBlock(g, 0).selected, null); // 이미 고른 블록을 다시 누르면 고르기 해제
  let r = tapBlockCell(g, anchors[0]);
  g = r.game;
  assert.equal(r.result, "placed");
  assert.equal(occupancy(g)[anchors[0]], 0);
  r = tapBlockCell(g, anchors[0]);
  assert.equal(r.result, "removed");
  g = undoBlocks(r.game);
  assert.equal(g.placed[0], anchors[0]);
  g = restartBlocks(g);
  for (let k = 0; k < p.shapes.length; k += 1) {
    g = { ...g, selected: k };
    g = tapBlockCell(g, anchors[k]).game;
  }
  assert.ok(g.solved);
  // 판 밖으로 나가거나 겹치는 자리는 막힘, 놓인 블록을 누르면 빠짐
  let h = tapBlockCell(newBlockGame(1, p), anchors[0]).game;
  const occ = occupancy(h);
  const results = occ.map((v, i) => (v === -1 ? tapBlockCell(h, i).result : "skip"));
  assert.ok(results.includes("blocked"));
  h = tapBlockCell(h, anchors[0]).game;
  assert.equal(h.placed[0], null);
});

test("슬라이딩: 빈칸 쪽으로 쓸면 밀리고 반대쪽은 그대로", async () => {
  const { swipeSlide } = await import("../src/puzzle/sliding/game.ts");
  const g = newSlideGame(1, { id: "t", size: 3, board: [1, 2, 3, 4, 5, 6, 0, 7, 8], minMoves: 2 });
  assert.equal(swipeSlide(g, 7, "right"), g);
  assert.deepEqual(swipeSlide(g, 7, "left").board, [1, 2, 3, 4, 5, 6, 7, 0, 8]);
  assert.deepEqual(swipeSlide(g, 8, "left").board, [1, 2, 3, 4, 5, 6, 7, 8, 0]);
  assert.deepEqual(swipeSlide(g, 3, "down").board, [1, 2, 3, 0, 5, 6, 4, 7, 8]);
});
