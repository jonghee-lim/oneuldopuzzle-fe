import { test } from "node:test";
import assert from "node:assert/strict";
import { blockScore, slideScore, specialScore, sudokuScore, total, zoneScore } from "../src/puzzle/core/score.ts";

test("스도쿠 점수: 난이도·빠르기·도움 없이", () => {
  assert.equal(total(sudokuScore("easy", 600, true)), 10);
  assert.equal(total(sudokuScore("easy", 200, false)), 10 + 5 + 2);
  assert.equal(total(sudokuScore("expert", 2000, false)), 80 + 16);
});

test("색깔 구역·스페셜 점수", () => {
  assert.equal(total(zoneScore(5, 999)), 15);
  assert.equal(total(zoneScore(6, 60)), 18 + 9);
  assert.equal(total(specialScore(true, true)), 150);
  assert.equal(total(specialScore(false, false)), 0);
});

test("슬라이딩·블록 채우기 점수", () => {
  assert.equal(total(slideScore(3, 10, 8)), 12);
  assert.equal(total(slideScore(3, 8, 8)), 18);
  assert.equal(total(slideScore(4, 50, null)), 16);
  assert.equal(total(blockScore(5, 60)), 15 + 8);
  assert.equal(total(blockScore(5, 999)), 15);
});
