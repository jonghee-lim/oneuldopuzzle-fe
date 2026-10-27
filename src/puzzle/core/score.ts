// 별·힌트 규칙. 화면과 떨어진 순수 함수라 단위 테스트로 고정합니다.
import type { SudokuDifficulty } from "../sudoku/generator.ts";

/** 난이도별 기준 시간(초). 이보다 빨리 풀면 별 하나를 더 줍니다. */
export const SUDOKU_PAR_SECONDS: Record<SudokuDifficulty, number> = { easy: 300, normal: 540, hard: 900, expert: 1500 };

/** 힌트: 처음 3개, 오늘의 퍼즐 한 판마다 1개, 세 판을 다 풀면 2개 더 */
export const HINT_START = 3;
export const HINT_PER_DAILY = 1;
export const HINT_DAILY_BONUS = 2;

/** 오늘의 퍼즐 한 판을 풀었을 때 받는 힌트 수(세 판째면 보너스까지) */
export function dailyHintReward(doneBefore: number, total: number): number {
  return HINT_PER_DAILY + (doneBefore + 1 === total ? HINT_DAILY_BONUS : 0);
}

/**
 * 레벨 별(2026-10-26 점수 대신 별, 2026-10-27 디저트 도감은 없애고 별은 잘 풀었다는 표시로만). 한 판에 별 3개까지: 완성 1개 + 아래 두 조건마다 1개.
 * 같은 레벨을 다시 풀면 가장 많이 받은 별을 남깁니다.
 */
export interface StarLine {
  label: string;
  got: boolean;
}

export function starCount(lines: readonly StarLine[]): number {
  return lines.filter((l) => l.got).length;
}

export function sudokuStars(difficulty: SudokuDifficulty, seconds: number, helped: boolean): StarLine[] {
  return [
    { label: "완성", got: true },
    { label: `${Math.round(SUDOKU_PAR_SECONDS[difficulty] / 60)}분 안에`, got: seconds <= SUDOKU_PAR_SECONDS[difficulty] },
    { label: "도움 없이", got: !helped },
  ];
}

export function zoneStars(size: number, seconds: number, helped: boolean): StarLine[] {
  const par = size * size * 3;
  return [
    { label: "완성", got: true },
    { label: `${Math.ceil(par / 60)}분 안에`, got: seconds <= par },
    { label: "힌트 없이", got: !helped },
  ];
}

export function blockStars(size: number, seconds: number, helped: boolean): StarLine[] {
  const par = size * size * 4;
  return [
    { label: "완성", got: true },
    { label: `${Math.ceil(par / 60)}분 안에`, got: seconds <= par },
    { label: "힌트 없이", got: !helped },
  ];
}

/** 슬라이딩: 3×3은 최소 수, 4×4는 최소 수를 모르므로 3분 안에 */
export function slideStars(moves: number, minMoves: number | null, seconds: number, helped: boolean): StarLine[] {
  return [
    { label: "완성", got: true },
    minMoves !== null ? { label: `최소 ${minMoves}수`, got: moves <= minMoves } : { label: "3분 안에", got: seconds <= 180 },
    { label: "힌트 없이", got: !helped },
  ];
}

/** 노노그램: 시간을 재지 않아 잘못 칠한 칸 없이(X는 괜찮음) */
export function nonogramStars(mistakes: number, helped: boolean): StarLine[] {
  return [
    { label: "완성", got: true },
    { label: "잘못 칠하지 않고", got: mistakes === 0 },
    { label: "힌트 없이", got: !helped },
  ];
}

export function escapeStars(moves: number, minMoves: number, helped: boolean): StarLine[] {
  return [
    { label: "완성", got: true },
    { label: `최소 ${minMoves}수`, got: moves <= minMoves },
    { label: "힌트 없이", got: !helped },
  ];
}
