// 모든 퍼즐이 함께 쓰는 되돌리기 기록입니다. 판 상태 전체를 저장하지 않고 바뀐 조각만 쌓습니다.

export type History<T> = readonly T[];

/** 기록이 너무 길어져 저장 공간을 차지하지 않도록 최근 것만 남깁니다. */
export const HISTORY_LIMIT = 300;

export function pushHistory<T>(history: History<T>, entry: T): History<T> {
  const next = [...history, entry];
  return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
}

export function popHistory<T>(history: History<T>): { entry: T | undefined; history: History<T> } {
  if (history.length === 0) return { entry: undefined, history };
  return { entry: history[history.length - 1], history: history.slice(0, -1) };
}
