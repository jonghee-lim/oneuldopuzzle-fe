// 오늘의 퍼즐 결과 공유: 답은 보이지 않고 퍼즐별 시간·힌트 여부·연속 출석만 담습니다(2026-10-27, 워들의 네모 칸처럼).
// 같은 날이면 누구나 같은 세 판을 풀기 때문에 회차 번호로 서로 견줄 수 있습니다.
import { dayNumber, type DailyKind } from "./daily.ts";

export const DAILY_KIND_NAME: Record<DailyKind, string> = { sudoku: "스도쿠", zones: "색깔 구역", blocks: "블록 채우기", sliding: "슬라이딩" };

/** 오늘의 퍼즐 회차: 공유를 시작한 2026-10-27이 1회 */
export function dailyRound(key: string): number {
  return dayNumber(key) - dayNumber("2026-10-26");
}

export interface DailyResult {
  kind: DailyKind;
  /** 아직 안 풀었으면 null */
  seconds: number | null;
  /** 힌트나 '틀린 칸 보기'를 썼는지 */
  helped: boolean;
}

/** 칸 하나: 혼자 풀면 초록, 도움을 받으면 노랑, 아직이면 흰 칸 */
export function resultMark(r: DailyResult): string {
  return r.seconds === null ? "⬜" : r.helped ? "🟨" : "🟩";
}

function clock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** "10월 27일" */
export function dateLabel(key: string): string {
  const [, m, d] = key.split("-").map(Number);
  return `${m}월 ${d}일`;
}

/** 카톡 등에 보낼 결과 글 */
export function shareText(key: string, results: readonly DailyResult[], streak: number, url: string): string {
  const total = results.reduce((a, r) => a + (r.seconds ?? 0), 0);
  const solved = results.filter((r) => r.seconds !== null).length;
  return [
    `오늘Do퍼즐 #${dailyRound(key)} (${dateLabel(key)})`,
    `${results.map(resultMark).join("")} ${solved}/${results.length} · ${clock(total)}`,
    ...results.map((r) => `${resultMark(r)} ${DAILY_KIND_NAME[r.kind]} ${r.seconds === null ? "-" : clock(r.seconds)}${r.helped ? " 💡" : ""}`),
    ...(streak > 0 ? [`🔥 연속 ${streak}일`] : []),
    "",
    `오늘 같은 판 풀어 보기 ${url}`,
  ].join("\n");
}
