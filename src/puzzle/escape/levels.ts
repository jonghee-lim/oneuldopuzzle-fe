// 블록 탈출 끝없는 레벨(2026-10-27 사용자 결정). tools/make-escape-pool.ts로 모은 판 가운데
// 레벨마다 최소 이동 수가 조금씩 늘도록 tools/pick-escape-levels.ts가 고른 표입니다(tests/escape.test.ts가 다시 풀어 확인).
// 표가 끝나면 가장 어려운 쪽 판을 돌려 가며 씁니다.
import { ESCAPE_TABLE } from "./table.ts";

export interface EscapeLevel {
  board: string;
  minMoves: number;
}

/** 표 끝에서 되풀이할 판 수 */
const REPEAT_LAST = 60;

export function escapeForLevel(level: number): EscapeLevel {
  const n = ESCAPE_TABLE.length;
  const repeat = Math.min(REPEAT_LAST, n);
  const index = level <= n ? Math.max(0, level - 1) : n - repeat + ((level - n - 1) % repeat);
  const [board, minMoves] = ESCAPE_TABLE[index];
  return { board, minMoves };
}
