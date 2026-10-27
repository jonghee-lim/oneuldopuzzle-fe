import { test } from "node:test";
import assert from "node:assert/strict";
import { isUnlocked, keepBest, nextUnlockAt, totalStarsOf, unlockedByStars } from "../src/puzzle/core/collection.ts";

test("도감: 별 6개마다 하나씩 열리고, 받은 디저트는 바로 열림", () => {
  assert.equal(unlockedByStars(0, 18), 1);
  assert.equal(unlockedByStars(5, 18), 1);
  assert.equal(unlockedByStars(6, 18), 2);
  assert.equal(unlockedByStars(999, 18), 18);
  assert.equal(nextUnlockAt(7, 18), 12);
  assert.equal(nextUnlockAt(999, 18), null);
  assert.equal(isUnlocked(5, "cookie", 0, 18, {}), false);
  assert.equal(isUnlocked(5, "cookie", 0, 18, { cookie: 1 }), true);
});

test("별 기록은 가장 많이 받은 것을 남긴다", () => {
  let s = keepBest({}, "zones:1", 2);
  s = keepBest(s, "zones:1", 1);
  assert.equal(s["zones:1"], 2);
  s = keepBest(s, "zones:1", 3);
  assert.equal(totalStarsOf(s), 3);
});
