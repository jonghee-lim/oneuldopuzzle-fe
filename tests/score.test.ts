import { test } from "node:test";
import assert from "node:assert/strict";
import { dailyHintReward, starCount, sudokuStars, zoneStars, blockStars, slideStars, nonogramStars, escapeStars } from "../src/puzzle/core/score.ts";

test("오늘의 퍼즐 힌트 보상: 한 판 1개, 세 번째 판은 보너스 2개 더", () => {
  assert.equal(dailyHintReward(0, 3), 1);
  assert.equal(dailyHintReward(1, 3), 1);
  assert.equal(dailyHintReward(2, 3), 3);
});

test("레벨 별: 완성 1개 + 조건마다 1개, 최대 3개", () => {
  assert.equal(starCount(sudokuStars("easy", 200, false)), 3);
  assert.equal(starCount(sudokuStars("easy", 400, false)), 2);
  assert.equal(starCount(sudokuStars("easy", 400, true)), 1);
  assert.equal(starCount(zoneStars(5, 60, true)), 2);
  assert.equal(starCount(blockStars(4, 100, false)), 2);
  assert.equal(starCount(slideStars(4, 4, 999, false)), 3);
  assert.equal(starCount(slideStars(40, null, 200, false)), 2);
  assert.equal(starCount(nonogramStars(1, false)), 2);
  assert.equal(starCount(escapeStars(5, 5, true)), 2);
  assert.equal(sudokuStars("normal", 0, false)[1].label, "9분 안에");
});
