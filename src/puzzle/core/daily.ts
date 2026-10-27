// 오늘의 퍼즐: 날짜로 고른 세 판(스도쿠·색깔 구역·블록 채우기나 슬라이딩). 같은 날이면 누구에게나 같은 문제가 나옵니다.
// 레벨 진행과는 따로라 레벨 문제와 겹치지 않게 씨앗에 날짜를 넣습니다.
import { createRng, seedFrom } from "./rng.ts";
import { generateBlocks, type BlockPuzzle } from "../blocks/generator.ts";
import type { SlidePuzzle } from "../sliding/generator.ts";
import { boardsAtDepth, minSlides } from "../sliding/solver.ts";
import { generateSudoku, type SudokuDifficulty, type SudokuPuzzle } from "../sudoku/generator.ts";
import { generateZones } from "../zones/generator.ts";
import type { ZonePuzzle } from "../zones/rules.ts";

export type DailyKind = "sudoku" | "zones" | "blocks" | "sliding";

/** 기기 시간대 기준 날짜 "YYYY-MM-DD" */
export function dateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 2026-01-01부터 며칠째인지(날짜 계산은 UTC로 해서 서머타임에 흔들리지 않게) */
export function dayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(2026, 0, 1)) / 86_400_000);
}

export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`;
}

/** 오늘의 세 판 종류: 스도쿠, 색깔 구역, 그리고 날마다 번갈아 블록 채우기·슬라이딩 */
export function dailyKinds(key: string): readonly DailyKind[] {
  return ["sudoku", "zones", dayNumber(key) % 2 === 0 ? "blocks" : "sliding"];
}

/** 스도쿠는 쉬움·보통을 번갈아(매일 부담 없이 풀 수 있게) */
export function dailySudokuDifficulty(key: string): SudokuDifficulty {
  return dayNumber(key) % 2 === 0 ? "easy" : "normal";
}

export function dailySudoku(key: string): SudokuPuzzle {
  return generateSudoku(`daily-sudoku-${key}`, dailySudokuDifficulty(key));
}

export function dailyZones(key: string): ZonePuzzle {
  return generateZones(`daily-zones-${key}`, 6, 2);
}

export function dailyBlocks(key: string): BlockPuzzle {
  return generateBlocks(`daily-blocks-${key}`, 5);
}

/** 슬라이딩은 3×3에서 최소 12~16수 판 */
export function dailySlide(key: string): SlidePuzzle {
  const rng = createRng(seedFrom(`daily-slide-${key}`));
  const pool = boardsAtDepth(12 + Math.floor(rng() * 5));
  const board = pool[Math.floor(rng() * pool.length)].split("").map(Number);
  return { id: `daily-slide-${key}`, size: 3, board, minMoves: minSlides(board, 3) };
}

/** 연속 출석: 오늘(또는 아직 오늘을 안 풀었으면 어제)까지 세 판을 다 푼 날이 며칠 이어지는지 */
export function streakOf(days: readonly string[], today: string): number {
  const set = new Set(days);
  let day = set.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (set.has(day)) {
    n += 1;
    day = addDays(day, -1);
  }
  return n;
}

/** 가장 길게 이어 간 연속 출석(일) */
export function longestStreak(days: readonly string[]): number {
  const nums = [...new Set(days)].map(dayNumber).sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  nums.forEach((n, k) => {
    run = k > 0 && n === nums[k - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return best;
}
