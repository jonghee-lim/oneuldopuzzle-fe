// 퍼즐마다 처음 열 때 보여 주는 '하는 법'(2026-10-27 '어떻게 하는 게임인지 모르겠다' 신고). 한 단계에 한 가지만, 작은 예시 판과 함께.
import { ZONE_COLORS, dessert } from "../../theme/palette";

export type GuideKind = "sudoku" | "zones" | "nonogram" | "escape" | "sliding" | "blocks";

export interface GuideCell {
  bg?: string;
  text?: string;
  color?: string;
  /** x: X 표시 · soft: 흐린 X · macaron: 마카롱 · dot: 놓을 수 있는 칸(민트 점) · pin: 블록의 기준 칸(●) */
  mark?: "x" | "soft" | "macaron" | "dot" | "pin";
  /** 지금 볼 칸(테두리) */
  ring?: boolean;
}

export interface GuideExample {
  cols: number;
  cells: GuideCell[];
  rowClues?: string[];
  colClues?: string[];
  /** 블록 탈출 출구가 있는 줄(오른쪽에 화살표) */
  exitRow?: number;
  /** 굵은 선: 상자 가로·세로 칸 수(스도쿠) */
  box?: [number, number];
}

export interface GuideStep {
  text: string;
  example?: GuideExample;
  /** 예시 아래 작은 설명 */
  caption?: string;
}

/** 글자 한 줄씩으로 예시 판을 만듭니다. 글자마다 legend의 칸, 없는 글자는 그 글자를 숫자로 씁니다('.'은 빈칸). */
function board(rows: string[], legend: Record<string, GuideCell> = {}): Pick<GuideExample, "cols" | "cells"> {
  const cells = rows.flatMap((row) => [...row].map((ch): GuideCell => legend[ch] ?? (ch === "." ? {} : { text: ch })));
  return { cols: rows[0].length, cells };
}

const FILL: GuideCell = { bg: dessert.strawberryDeep };
const X: GuideCell = { mark: "x" };
const [Z0, Z1, Z2, Z3] = ZONE_COLORS;
const mine = (text: string): GuideCell => ({ text, color: dessert.mintDeep });

export const GUIDES: Record<GuideKind, { title: string; steps: GuideStep[] }> = {
  nonogram: {
    title: "노노그램 하는 법",
    steps: [
      {
        text: "줄 옆의 숫자는 그 줄에서 붙여서 칠할 칸 수예요. '3'이면 3칸을 이어서 칠해요.",
        example: { ...board([".###."], { "#": FILL }), rowClues: ["3"] },
        caption: "어느 자리에 칠할지는 다른 줄 숫자와 맞춰 정해요.",
      },
      {
        text: "'1 1'처럼 숫자가 여러 개면 칠하는 덩어리도 여러 개예요. 1칸 칠하고, 한 칸 이상 비우고, 또 1칸 칠해요.",
        example: { ...board(["#.#..", "##.#."], { "#": FILL }), rowClues: ["1 1", "2 1"] },
        caption: "덩어리는 숫자 순서대로 놓이고, 덩어리 사이는 꼭 한 칸 이상 비어요.",
      },
      {
        text: "왼쪽 숫자는 가로줄, 위 숫자는 세로줄이에요. 둘 다 맞게 칠하면 그림이 완성돼요.",
        example: { ...board(["###", "#x#", "###"], { "#": FILL, x: X }), rowClues: ["3", "1 1", "3"], colClues: ["3", "1 1", "3"] },
        caption: "칠하면 안 되는 칸은 'X 표시'로 막아 두면 헷갈리지 않아요.",
      },
      {
        text: "줄 길이와 숫자가 같으면 그 줄은 다 칠하면 돼요. 쉬운 줄부터 채우고, 맞춘 줄의 숫자는 흐려져요. 막히면 '힌트'가 다음 칸과 이유를 알려 줘요.",
        example: { ...board(["#####"], { "#": FILL }), rowClues: ["5"] },
      },
    ],
  },
  sudoku: {
    title: "스도쿠 하는 법",
    steps: [
      {
        text: "가로줄마다 숫자가 한 번씩만 들어가요. 9×9는 1~9, 미니 6×6은 1~6이에요.",
        example: board(["53.678912"], { ".": { ring: true } }),
        caption: "이 줄에 없는 숫자는 4뿐이라 빈칸은 4예요.",
      },
      {
        text: "세로줄과 굵은 선으로 나뉜 상자도 마찬가지예요. 같은 숫자가 겹치면 빨갛게 보여요.",
        example: { ...board(["27.", "941", "638"], { ".": { ring: true } }), box: [3, 3] },
        caption: "이 상자에 없는 숫자는 5예요.",
      },
      {
        text: "칸을 누르고 아래 숫자 패드를 누르면 숫자가 들어가요. 내가 넣은 숫자는 민트색이에요.",
        example: { ...board(["5.3", ".7.", "91."], { ".": {}, "7": mine("7"), "1": mine("1") }), box: [3, 3] },
      },
      {
        text: "확실하지 않으면 '메모'를 켜고 후보 숫자를 작게 적어 두세요. 막히면 '힌트'가 볼 곳과 이유를 먼저 보여 주고, 한 번 더 누르면 대신 넣어 줘요.",
      },
    ],
  },
  zones: {
    title: "색깔 구역 하는 법",
    steps: [
      {
        text: "가로줄마다, 세로줄마다, 색깔 구역마다 마카롱을 딱 하나씩 놓아요.",
        example: board(["aAbb", "aabB", "Cccd", "ccDd"], {
          a: { bg: Z0 },
          b: { bg: Z1 },
          c: { bg: Z2 },
          d: { bg: Z3 },
          A: { bg: Z0, mark: "macaron" },
          B: { bg: Z1, mark: "macaron" },
          C: { bg: Z2, mark: "macaron" },
          D: { bg: Z3, mark: "macaron" },
        }),
        caption: "네 줄, 네 칸줄, 네 구역에 하나씩이에요.",
      },
      {
        text: "마카롱끼리는 붙을 수 없어요. 옆은 물론 대각선으로 닿아도 안 돼요.",
        example: board(["sss.", "sMss", "sss.", ".s.."], { M: { mark: "macaron", ring: true }, s: { mark: "soft" } }),
        caption: "마카롱을 놓으면 같은 줄과 둘레 칸은 흐린 X로 막혀요.",
      },
      {
        text: "확실히 아닌 칸은 'X 표시'로 지워 가며 좁혀요. 한 구역에 남은 칸이 하나면 그곳이 마카롱 자리예요.",
      },
    ],
  },
  blocks: {
    title: "블록 채우기 하는 법",
    steps: [
      {
        text: "아래 블록을 모두 써서 판을 빈틈없이 채워요. 블록은 돌릴 수 없어요.",
        example: board(["aab", "acb", "ccb"], { a: { bg: ZONE_COLORS[0] }, b: { bg: ZONE_COLORS[4] }, c: { bg: ZONE_COLORS[2] } }),
      },
      {
        text: "블록을 고르면 놓을 수 있는 칸에 민트 점이 생겨요. 그 칸을 누르면 블록의 ● 칸이 거기 놓여요.",
        example: board(["d.d", ".dx", "d.."], { d: { mark: "dot" }, x: { bg: ZONE_COLORS[4] } }),
      },
      {
        text: "놓은 블록을 다시 누르면 빠져요. 남은 빈칸 모양을 보고 어느 블록이 들어갈지 생각해 보세요.",
      },
    ],
  },
  sliding: {
    title: "슬라이딩 하는 법",
    steps: [
      {
        text: "빈칸 옆 조각을 누르거나 빈칸 쪽으로 쓸면 조각이 밀려요.",
        example: board(["123", "456", "7.8"], { "8": { text: "8", ring: true } }),
        caption: "8을 누르면 왼쪽 빈칸으로 밀려요.",
      },
      {
        text: "1부터 순서대로 놓고 빈칸이 오른쪽 아래에 오면 완성이에요.",
        example: board(["123", "456", "78."]),
      },
      {
        text: "빈칸과 같은 줄에 있는 조각을 누르면 사이 조각까지 한 번에 밀려요. 적은 수로 맞출수록 별을 더 받아요.",
      },
    ],
  },
  escape: {
    title: "블록 탈출 하는 법",
    steps: [
      {
        text: "딸기색 블록을 오른쪽 출구로 빼내면 성공이에요.",
        example: { ...board(["......", "...v..", "TT.v..", "......", "....hh"], { T: FILL, v: { bg: ZONE_COLORS[4] }, h: { bg: ZONE_COLORS[1] } }), exitRow: 2 },
        caption: "세로 블록이 길을 막고 있어요.",
      },
      {
        text: "블록은 긴 방향으로만 움직여요. 가로 블록은 왼쪽·오른쪽, 세로 블록은 위·아래로요.",
        example: { ...board(["......", "......", "TT....", "...v..", "...vhh"], { T: FILL, v: { bg: ZONE_COLORS[4], ring: true }, h: { bg: ZONE_COLORS[1] } }), exitRow: 2 },
        caption: "세로 블록을 아래로 내리면 길이 열려요.",
      },
      {
        text: "블록을 쓸거나, 블록을 누른 다음 초록 점 칸을 누르면 그쪽으로 밀려요. 최소 이동 수로 빼내면 별을 더 받아요.",
      },
    ],
  },
};
