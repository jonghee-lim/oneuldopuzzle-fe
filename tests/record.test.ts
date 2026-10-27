import { test } from "node:test";
import assert from "node:assert/strict";
import { RECENT_KEEP, addRecord, speedup } from "../src/puzzle/core/record.ts";
import { longestStreak } from "../src/puzzle/core/daily.ts";

test("내 기록: 최고·평균·최근 판·힌트 없이 푼 판을 쌓는다", () => {
  let st = addRecord(undefined, 300, false);
  st = addRecord(st, 240, true);
  assert.deepEqual(st, { cleared: 2, totalSeconds: 540, bestSeconds: 240, recent: [300, 240], clean: 1 });
  // 예전 저장본(recent·clean 없음)에도 이어 붙는다
  st = addRecord({ cleared: 5, totalSeconds: 1000, bestSeconds: 150 }, 200, false);
  assert.deepEqual(st.recent, [200]);
  assert.equal(st.clean, 1);
  assert.equal(st.bestSeconds, 150);
  for (let k = 0; k < 20; k += 1) st = addRecord(st, 100 + k, false);
  assert.equal(st.recent!.length, RECENT_KEEP);
  assert.equal(st.recent![RECENT_KEEP - 1], 119);
});

test("빨라진 정도: 뒤 절반이 앞 절반보다 몇 % 짧은지", () => {
  assert.equal(speedup([300, 300, 200, 200]), 33);
  assert.equal(speedup([200, 200, 300, 300]), -50);
  assert.equal(speedup([300, 200]), null);
  assert.equal(speedup(undefined), null);
});

test("가장 긴 연속 출석", () => {
  assert.equal(longestStreak([]), 0);
  assert.equal(longestStreak(["2026-10-01", "2026-10-02", "2026-10-04", "2026-10-05", "2026-10-06"]), 3);
  assert.equal(longestStreak(["2026-10-31", "2026-11-01", "2026-10-31"]), 2);
});
