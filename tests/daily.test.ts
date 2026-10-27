import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, dailyBlocks, dailyKinds, dailySlide, dailySudoku, dailyZones, dateKey, dayNumber, streakOf } from "../src/puzzle/core/daily.ts";
import { checkSudoku } from "../src/puzzle/sudoku/checker.ts";
import { solveZones } from "../src/puzzle/zones/solver.ts";

test("날짜 키와 날짜 계산", () => {
  assert.equal(dateKey(new Date(2026, 9, 26, 23, 59)), "2026-10-26");
  assert.equal(dayNumber("2026-01-01"), 0);
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(addDays("2027-01-01", -1), "2026-12-31");
});

test("오늘의 퍼즐: 날마다 세 판, 같은 날은 같은 문제, 블록 채우기·슬라이딩 번갈아", () => {
  assert.deepEqual(dailyKinds("2026-10-26").slice(0, 2), ["sudoku", "zones"]);
  assert.notEqual(dailyKinds("2026-10-26")[2], dailyKinds("2026-10-27")[2]);
  assert.deepEqual(dailySudoku("2026-10-26"), dailySudoku("2026-10-26"));
  assert.notDeepEqual(dailySudoku("2026-10-26").puzzle, dailySudoku("2026-10-27").puzzle);
});

test("오늘의 퍼즐: 30일 동안 모든 판이 답 하나", () => {
  for (let k = 0; k < 30; k += 1) {
    const day = addDays("2026-10-26", k);
    const s = dailySudoku(day);
    assert.equal(checkSudoku(s.puzzle, s.solution).ok, true, day);
    const z = dailyZones(day);
    assert.equal(solveZones(z.size, z.regions).count, 1, day);
    const kind = dailyKinds(day)[2];
    if (kind === "blocks") assert.ok(dailyBlocks(day).shapes.length > 0);
    else assert.ok((dailySlide(day).minMoves ?? 0) >= 12);
  }
});

test("연속 출석", () => {
  assert.equal(streakOf([], "2026-10-26"), 0);
  assert.equal(streakOf(["2026-10-24", "2026-10-25"], "2026-10-26"), 2);
  assert.equal(streakOf(["2026-10-24", "2026-10-25", "2026-10-26"], "2026-10-26"), 3);
  assert.equal(streakOf(["2026-10-23", "2026-10-25"], "2026-10-26"), 1);
  assert.equal(streakOf(["2026-10-23"], "2026-10-26"), 0);
});
