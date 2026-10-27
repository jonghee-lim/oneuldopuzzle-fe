// 다섯 퍼즐의 난이도 화면·첫 화면 카드에 쓰는 이름·설명과 '이어 하기' 판단.
import type { BlockGame } from "../../puzzle/blocks/game";
import { blockSizeForLevel } from "../../puzzle/blocks/generator";
import { escapeForLevel } from "../../puzzle/escape/levels";
import type { EscapeGame } from "../../puzzle/escape/game";
import type { NonogramGame } from "../../puzzle/nonogram/game";
import { nonogramSizeForLevel } from "../../puzzle/nonogram/generator";
import type { SlideGame } from "../../puzzle/sliding/game";
import { slideSizeForLevel, slideTargetMoves } from "../../puzzle/sliding/generator";
import type { Tier, TierPuzzle } from "../../puzzle/core/tier";
import type { ZoneGame } from "../../puzzle/zones/game";
import { zoneSizeForLevel } from "../../puzzle/zones/generator";
import { tierNext, type PuzzleState } from "../../stores/puzzleStore";
import { dessert } from "../../theme/palette";

const square = (n: number) => `${n}×${n}`;

export interface TierInfo {
  title: string;
  /** 첫 화면 카드 한 줄 설명 */
  short: string;
  /** 난이도 화면 규칙 한 줄 */
  rule: string;
  tint: string;
  /** 그 난이도·레벨의 판 설명(판 크기, 최소 이동 수) */
  board: (level: number, tier: Tier) => string;
}

export const TIER_INFO: Record<TierPuzzle, TierInfo> = {
  zones: { title: "색깔 구역", short: "줄·구역마다 마카롱 하나", rule: "줄·칸줄·색깔 구역마다 마카롱 하나", tint: dessert.mintMilk, board: (l, t) => square(zoneSizeForLevel(l, t)) },
  blocks: { title: "블록 채우기", short: "빈틈없이 꽉 채우기", rule: "블록으로 판을 빈틈없이 채우기", tint: dessert.vanilla, board: (l, t) => square(blockSizeForLevel(l, t)) },
  sliding: {
    title: "슬라이딩",
    short: "밀어서 순서대로",
    rule: "조각을 밀어 1부터 순서대로",
    tint: dessert.strawberryMilk,
    board: (l, t) => (slideSizeForLevel(l, t) === 3 ? `3×3 · 최소 ${slideTargetMoves(l, t)}수` : square(slideSizeForLevel(l, t))),
  },
  nonogram: { title: "노노그램", short: "숫자로 그림 완성", rule: "줄마다 숫자만큼 칠해 그림 완성", tint: dessert.vanilla, board: (l, t) => square(nonogramSizeForLevel(l, t)) },
  escape: { title: "블록 탈출", short: "딸기 블록을 출구로", rule: "블록을 밀어 딸기 블록을 출구로", tint: dessert.mintMilk, board: (l, t) => `최소 ${escapeForLevel(l, t).minMoves}수` },
};

type AnyGame = ZoneGame | BlockGame | SlideGame | NonogramGame | EscapeGame;

const CURRENT: Record<TierPuzzle, (s: PuzzleState) => AnyGame | null> = {
  zones: (s) => s.zoneGame,
  blocks: (s) => s.blockGame,
  sliding: (s) => s.slideGame,
  nonogram: (s) => s.nonogramGame,
  escape: (s) => s.escapeGame,
};

/** 아직 안 끝났고 무언가 놓거나 움직인 판인지(시간이 아니라 넣은 것으로 판단) */
function inProgress(puzzle: TierPuzzle, g: AnyGame): boolean {
  if (puzzle === "zones") return !(g as ZoneGame).solved && (g as ZoneGame).cells.some(Boolean);
  if (puzzle === "blocks") return !(g as BlockGame).solved && (g as BlockGame).placed.some((a) => a !== null);
  if (puzzle === "sliding") return !(g as SlideGame).solved && (g as SlideGame).moves > 0;
  if (puzzle === "nonogram") return !(g as NonogramGame).solved && (g as NonogramGame).cells.some(Boolean);
  return !(g as EscapeGame).escaped && (g as EscapeGame).moves > 0;
}

/** 고른 난이도의 다음 레벨을 풀던 중인지(지금 판 또는 다른 난이도를 하느라 멈춘 판) */
export function tierResume(s: PuzzleState, puzzle: TierPuzzle, tier?: Tier): boolean {
  const next = tier ? { tier, level: (s.tierCleared[puzzle]?.[tier] ?? 0) + 1 } : tierNext(s, puzzle);
  const paused = s.tierPaused[puzzle]?.[next.tier] as AnyGame | undefined;
  return [CURRENT[puzzle](s), paused].some((g) => !!g && (g.tier ?? "easy") === next.tier && g.level === next.level && inProgress(puzzle, g));
}
