// 점수 규칙. 설계서: 스페셜 스테이지는 점수를 많이 준다. 화면과 떨어진 순수 함수라 단위 테스트로 고정합니다.
import type { SudokuDifficulty } from "../sudoku/generator.ts";

export const SUDOKU_POINTS: Record<SudokuDifficulty, number> = { easy: 10, normal: 20, hard: 40, expert: 80 };

/** 난이도별 기준 시간(초). 이보다 빨리 풀면 빠르기 점수를 더 줍니다. */
export const SUDOKU_PAR_SECONDS: Record<SudokuDifficulty, number> = { easy: 300, normal: 540, hard: 900, expert: 1500 };

export interface ScoreLine {
  label: string;
  points: number;
}

/** 스도쿠 한 판: 난이도 점수 + 기준 시간보다 빠르면 절반 더 + 틀린 칸 보기를 안 썼으면 깔끔 점수 */
export function sudokuScore(difficulty: SudokuDifficulty, seconds: number, usedCheck: boolean): ScoreLine[] {
  const base = SUDOKU_POINTS[difficulty];
  const lines: ScoreLine[] = [{ label: "완성", points: base }];
  if (seconds <= SUDOKU_PAR_SECONDS[difficulty]) lines.push({ label: "빠르게", points: Math.round(base / 2) });
  if (!usedCheck) lines.push({ label: "도움 없이", points: Math.round(base / 5) });
  return lines;
}

/** 색깔 구역 한 판: 판 크기가 클수록 */
export function zoneScore(size: number, seconds: number): ScoreLine[] {
  const base = size * 3;
  const lines: ScoreLine[] = [{ label: "완성", points: base }];
  if (seconds <= size * size * 3) lines.push({ label: "빠르게", points: Math.round(base / 2) });
  return lines;
}

/** 슬라이딩: 판 크기 점수 + 최소 수로 풀면 절반 더(3×3만 최소 수를 압니다) */
export function slideScore(size: number, moves: number, minMoves: number | null): ScoreLine[] {
  const base = size * 4;
  const lines: ScoreLine[] = [{ label: "완성", points: base }];
  if (minMoves !== null && moves <= minMoves) lines.push({ label: "최소 수", points: Math.round(base / 2) });
  return lines;
}

/** 블록 채우기: 판 크기 점수 + 빠르면 절반 더 */
export function blockScore(size: number, seconds: number): ScoreLine[] {
  const base = size * 3;
  const lines: ScoreLine[] = [{ label: "완성", points: base }];
  if (seconds <= size * size * 4) lines.push({ label: "빠르게", points: Math.round(base / 2) });
  return lines;
}

/** 스페셜: 처음 풀 때 100점, 블록 탈출은 최소 수로 풀면 50점 더(처음 한 번씩) */
export function specialScore(firstClear: boolean, perfectFirst: boolean): ScoreLine[] {
  const lines: ScoreLine[] = [];
  if (firstClear) lines.push({ label: "스페셜 완성", points: 100 });
  if (perfectFirst) lines.push({ label: "최소 수", points: 50 });
  return lines;
}

export function total(lines: readonly ScoreLine[]): number {
  return lines.reduce((sum, l) => sum + l.points, 0);
}
