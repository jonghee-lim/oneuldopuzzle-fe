// 오늘의 퍼즐 화면 공통: 주소에 ?daily가 붙으면 오늘의 퍼즐 판을 엽니다.
import { useSearchParams } from "react-router-dom";
import { dateKey, dayNumber, type DailyKind } from "../../puzzle/core/daily";
import { dessertForLevel } from "../../theme/palette";

export const DAILY_ROUTE: Record<DailyKind, string> = {
  sudoku: "/play?daily",
  zones: "/zones?daily",
  blocks: "/blocks?daily",
  sliding: "/sliding?daily",
};

export const DAILY_NAME: Record<DailyKind, string> = { sudoku: "스도쿠", zones: "색깔 구역", blocks: "블록 채우기", sliding: "슬라이딩" };

export function useIsDaily(): boolean {
  const [params] = useSearchParams();
  return params.has("daily");
}

/** 오늘의 디저트: 날마다 돌아가며 바뀝니다. */
export function dailyDessert(date: string = dateKey()) {
  return dessertForLevel(dayNumber(date) + 1);
}
