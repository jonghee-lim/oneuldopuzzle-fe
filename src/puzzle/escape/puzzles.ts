// 스페셜 스테이지 블록 탈출. tools/make-escape.ts로 만든 후보 중 이동 수가 단계에 맞는 판을 골랐고,
// 검사기로 풀 수 있는지·최소 이동 수를 확인합니다(tests/escape.test.ts).
export interface EscapePuzzle {
  id: string;
  name: string;
  board: string;
  /** 검사기가 구한 가장 적은 이동 수 */
  minMoves: number;
}

export const ESCAPES: readonly EscapePuzzle[] = [
  { id: "escape-1", name: "쉬움", board: "...AA.JJJ.IFXXE.IFCGEDDFCG..B..GHHB.", minMoves: 5 },
  { id: "escape-2", name: "보통", board: ".AAA.J....FJIXXHFKIC.H.KBCGGEEB.DD..", minMoves: 9 },
  { id: "escape-3", name: "어려움", board: ".JJJBBCCCF..XXGF.IEEGF.IH..DD.H.AAA.", minMoves: 14 },
];
