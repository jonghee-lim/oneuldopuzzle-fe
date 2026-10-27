import { test } from "node:test";
import assert from "node:assert/strict";
import { dailyRound, shareText } from "../src/puzzle/core/share.ts";

test("공유 글: 회차·날짜·퍼즐별 시간과 도움 여부, 연속 출석, 답은 담지 않음", () => {
  assert.equal(dailyRound("2026-10-27"), 1);
  assert.equal(dailyRound("2026-11-01"), 6);
  const text = shareText(
    "2026-10-27",
    [
      { kind: "sudoku", seconds: 252, helped: false },
      { kind: "zones", seconds: 65, helped: true },
      { kind: "sliding", seconds: null, helped: false },
    ],
    3,
    "https://example.com",
  );
  assert.equal(
    text,
    [
      "오늘Do퍼즐 #1 (10월 27일)",
      "🟩🟨⬜ 2/3 · 5:17",
      "🟩 스도쿠 4:12",
      "🟨 색깔 구역 1:05 💡",
      "⬜ 슬라이딩 -",
      "🔥 연속 3일",
      "",
      "오늘 같은 판 풀어 보기 https://example.com",
    ].join("\n"),
  );
  // 연속 0일이면 줄을 넣지 않음
  assert.ok(!shareText("2026-10-27", [{ kind: "sudoku", seconds: 1, helped: false }], 0, "u").includes("연속"));
});
