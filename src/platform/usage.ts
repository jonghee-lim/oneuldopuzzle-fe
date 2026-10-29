// 익명 사용 통계(2026-10-29, 콘솔 '앱 사용자 › 익명 사용 통계'). 공유 패키지 usage 모듈을 이 파일에서만 부릅니다.
// 기기 ID·계정 없이 날짜별 횟수만 보냅니다: 그날 연 기기(active), 처음 연 기기(new), 퍼즐·난이도별 새 판 시작·완성, 오늘의 퍼즐 완성.
// 설정 '익명 사용 통계 보내기'(기본 켜짐)를 끄면 세지도 보내지도 않고 쌓인 것을 지웁니다. 항목 이름은 서버 UsageMetrics와 같아야 받습니다.
import { createUsage } from "@smartinfolab/app-core/usage";
import type { DailyKind } from "../puzzle/core/daily";

const PROD_API = "https://api.smartinfol.com";
// 개발 서버는 VITE_API_URL을 줄 때만 보냅니다(운영 통계에 섞이지 않게).
const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "" : PROD_API);

let enabled: () => boolean = () => false;
// 자동 브라우저(E2E·검색 로봇)는 세지 않습니다. E2E가 이 모듈을 볼 때만 __usageTest를 켭니다.
const automated = () => typeof navigator !== "undefined" && navigator.webdriver && !(window as { __usageTest?: boolean }).__usageTest;

const usage = createUsage({ service: "ONEULDOPUZZLE", apiBase: API, storageKey: "oneuldopuzzle-usage", enabled: () => enabled() && !automated() });

/** 앱 시작 때 한 번. isEnabled는 설정 값을 읽는 함수. */
export function startUsage(isEnabled: () => boolean): () => void {
  enabled = isEnabled;
  return usage.start();
}

export type UsagePuzzle = "sudoku" | "zones" | "blocks" | "sliding" | "nonogram" | "escape";

export function trackStart(puzzle: UsagePuzzle, tier: string) {
  usage.track(`start:${puzzle}:${tier}`);
}

export function trackClear(puzzle: UsagePuzzle, tier: string) {
  usage.track(`clear:${puzzle}:${tier}`);
}

export function trackDaily(kind: DailyKind, allDone: boolean) {
  usage.track(`daily:clear:${kind}`);
  if (allDone) usage.track("daily:all");
}

/** 설정에서 끌 때 쌓인 것을 지웁니다. */
export function clearUsage() {
  usage.clear();
}
