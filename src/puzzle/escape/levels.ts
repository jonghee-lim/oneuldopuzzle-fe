// 블록 탈출 끝없는 레벨(2026-10-27 사용자 결정). tools/make-escape-pool.ts로 모은 판 가운데
// 레벨마다 최소 이동 수가 조금씩 늘도록 tools/pick-escape-levels.ts가 고른 표입니다(tests/escape.test.ts가 다시 풀어 확인).
// 난이도마다 최소 이동 수로 표를 나누어(쉬움 10수까지, 보통 11~18수, 어려움 19수부터) 그 안에서 차례로 쓰고,
// 끝나면 그 난이도의 어려운 쪽 절반을 돌려 가며 씁니다.
import type { Tier } from "../core/tier.ts";
import { ESCAPE_TABLE } from "./table.ts";

export interface EscapeLevel {
  board: string;
  minMoves: number;
}

const RANGE: Record<Tier, readonly [number, number]> = { easy: [0, 10], normal: [11, 18], hard: [19, Infinity] };
const SLICES = Object.fromEntries(
  (Object.keys(RANGE) as Tier[]).map((tier) => [tier, ESCAPE_TABLE.filter(([, m]) => m >= RANGE[tier][0] && m <= RANGE[tier][1])]),
) as unknown as Record<Tier, typeof ESCAPE_TABLE>;

export function escapeForLevel(level: number, tier: Tier = "easy"): EscapeLevel {
  const table = SLICES[tier];
  const n = table.length;
  const repeat = Math.ceil(n / 2);
  const index = level <= n ? Math.max(0, level - 1) : n - repeat + ((level - n - 1) % repeat);
  const [board, minMoves] = table[index];
  return { board, minMoves };
}
