// 스페셜 스테이지 노노그램. 좋은 문제를 자동으로 만들기 어려워 디저트 그림을 직접 그려 넣고,
// 검사기로 답이 하나이며 줄 풀기만으로 풀리는지 확인합니다(tests/nonogram.test.ts).
import type { NonogramPicture } from "./rules.ts";

export const NONOGRAMS: readonly NonogramPicture[] = [
  {
    id: "heart",
    name: "딸기 하트",
    rows: [
      ".X.X.",
      "XXXXX",
      "XXXXX",
      ".XXX.",
      "..X..",
    ],
  },
  {
    id: "cupcake",
    name: "컵케이크",
    rows: [
      "....X.....",
      "...XXX....",
      "..XXXXXX..",
      ".XXXXXXXX.",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      ".X.XX.XX..",
      ".XX.XX.XX.",
      "..X.XX.X..",
      "..XXXXXX..",
    ],
  },
  {
    id: "strawberry",
    name: "딸기",
    rows: [
      "...X..X...",
      "....XX....",
      "..XXXXXX..",
      ".XXXXXXXX.",
      ".XX.XXX.X.",
      ".XXXXX.XX.",
      "..X.XXXX..",
      "..XXX.XX..",
      "...XXXX...",
      "....XX....",
    ],
  },
];
