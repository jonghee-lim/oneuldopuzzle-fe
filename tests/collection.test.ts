import { test } from "node:test";
import assert from "node:assert/strict";
import { keepBest, totalStarsOf } from "../src/puzzle/core/collection.ts";

test("별 기록은 가장 많이 받은 것을 남긴다", () => {
  let s = keepBest({}, "zones:1", 2);
  s = keepBest(s, "zones:1", 1);
  assert.equal(s["zones:1"], 2);
  s = keepBest(s, "zones:1", 3);
  assert.equal(totalStarsOf(s), 3);
});
