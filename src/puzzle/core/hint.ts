// 단계 힌트(2026-10-27): 답을 바로 넣지 않고 '볼 곳 → 이유'를 먼저 보여 줍니다.
// 단계 안내는 힌트를 쓰지 않고, 마지막에 대신 해 줄 때만 힌트 1개를 씁니다(화면은 components/puzzle/useHint).

/** 힌트 한 단계: 판에서 비출 칸과 설명 */
export interface HintStep {
  cells: number[];
  text: string;
}
