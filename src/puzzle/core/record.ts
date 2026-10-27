// 내 기록(2026-10-27): 푼 판 수·최고·평균에 더해 최근 판 시간과 힌트 없이 푼 판을 남겨, 실력이 느는 게 보이게 합니다.

export interface PuzzleStat {
  cleared: number;
  bestSeconds?: number;
  totalSeconds: number;
  /** 최근 판 걸린 시간(초), 오래된 것부터 RECENT_KEEP개까지 */
  recent?: number[];
  /** 힌트·틀린 칸 보기 없이 푼 판 수 */
  clean?: number;
}

export const RECENT_KEEP = 10;

/** 방금 판 결과: 완성 창에 최고 기록과 견주어 보여 줍니다. */
export interface LastRecord {
  seconds: number;
  /** 이번 판 전의 최고 기록(처음 푼 판이면 없음) */
  prevBest?: number;
}

export function addRecord(prev: PuzzleStat | undefined, seconds: number, helped: boolean): PuzzleStat {
  const p = prev ?? { cleared: 0, totalSeconds: 0 };
  return {
    cleared: p.cleared + 1,
    totalSeconds: p.totalSeconds + seconds,
    bestSeconds: p.bestSeconds === undefined ? seconds : Math.min(p.bestSeconds, seconds),
    recent: [...(p.recent ?? []), seconds].slice(-RECENT_KEEP),
    clean: (p.clean ?? 0) + (helped ? 0 : 1),
  };
}

/** 최근 판들이 앞쪽 절반보다 빨라졌는지: 뒤 절반 평균이 앞 절반 평균보다 몇 % 짧은지(판이 4개 미만이면 null) */
export function speedup(recent: readonly number[] | undefined): number | null {
  if (!recent || recent.length < 4) return null;
  const half = Math.floor(recent.length / 2);
  const avg = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const before = avg(recent.slice(0, half));
  const after = avg(recent.slice(recent.length - half));
  return before > 0 ? Math.round(((before - after) / before) * 100) : null;
}
