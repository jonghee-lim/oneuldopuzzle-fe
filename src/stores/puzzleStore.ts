// 진행 상황·점수·설정을 기기에 저장합니다. 계정·동기화는 이후 단계에서 공용 API에 붙입니다.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HINT_START, blockStars, dailyHintReward, escapeStars, nonogramStars, slideStars, starCount, sudokuStars, zoneStars, type StarLine } from "../puzzle/core/score";
import { keepBest, starKey } from "../puzzle/core/collection";
import { addRecord, type LastRecord, type PuzzleStat } from "../puzzle/core/record";
import { dailyBlocks, dailyKinds, dailySlide, dailySudoku, dailyZones, dateKey, type DailyKind } from "../puzzle/core/daily";
import { blocksForLevel } from "../puzzle/blocks/generator";
import { newBlockGame, type BlockGame } from "../puzzle/blocks/game";
import { slideForLevel } from "../puzzle/sliding/generator";
import { newSlideGame, type SlideGame } from "../puzzle/sliding/game";
import { difficultyForLevel, puzzleForLevel, type SudokuDifficulty } from "../puzzle/sudoku/generator";
import { hasProgress, newGame, type InputMode, type SudokuGame } from "../puzzle/sudoku/game";
import { escapeForLevel } from "../puzzle/escape/levels";
import { newEscapeGame, type EscapeGame } from "../puzzle/escape/game";
import { nonogramForLevel } from "../puzzle/nonogram/generator";
import { newNonogramGame, type NonogramGame } from "../puzzle/nonogram/game";
import { zonesForLevel } from "../puzzle/zones/generator";
import { DEFAULT_TIER, type Tier, type TierPuzzle } from "../puzzle/core/tier";
import { newZoneGame, type ZoneGame } from "../puzzle/zones/game";
import { trackClear, trackDaily, trackStart } from "../platform/usage";

export interface PuzzleSettings {
  inputMode: InputMode;
  /** 고른 칸과 같은 숫자를 강조 */
  highlightSame: boolean;
  /** 같은 줄·칸줄·상자에 겹친 숫자를 빨갛게 */
  showConflicts: boolean;
  /** 효과음(기본 켜짐, 작게) */
  sound: boolean;
  /** 진동(지원하는 기기만) */
  haptics: boolean;
  /** 색깔 구역: 마카롱이 못 가는 칸을 흐린 X로 자동 표시(기본 켜짐) */
  autoCross: boolean;
  /** 익명 사용 통계 보내기(기본 켜짐, 2026-10-29). 끄면 세지도 보내지도 않습니다. */
  shareUsage: boolean;
}

/** 점수표 한 줄: 퍼즐 종류별로 푼 수·가장 빠른 시간·합계 시간 */
export type { PuzzleStat } from "../puzzle/core/record";

/** 기록 키: 스도쿠는 난이도, 시간을 재는 세 퍼즐은 쉬움이면 "zones", 다른 난이도는 "zones:normal" */
export type TimedPuzzle = "zones" | "sliding" | "blocks";
export type StatKey = SudokuDifficulty | TimedPuzzle | `${TimedPuzzle}:${Tier}`;

export function tierStatKey(puzzle: TimedPuzzle, tier: Tier = "easy"): StatKey {
  return tier === "easy" ? puzzle : `${puzzle}:${tier}`;
}

/** 블록 탈출 레벨별 가장 적은 이동 수 키(쉬움은 예전처럼 레벨 번호만) */
export function escapeBestKey(level: number, tier: Tier = "easy"): string {
  return tier === "easy" ? String(level) : `${tier}:${level}`;
}

export interface PuzzleState {
  /** 깬 가장 높은 레벨(0이면 아직 없음) */
  /** 난이도마다 따로 이어지는 스도쿠 레벨: 그 난이도에서 깬 마지막 레벨(2026-10-26 사용자 결정) */
  sudokuCleared: Partial<Record<SudokuDifficulty, number>>;
  /** 스도쿠 최고 기록(초). 키는 "난이도:레벨" */
  bestSeconds: Record<string, number>;
  settings: PuzzleSettings;
  game: SudokuGame | null;
  /** 난이도를 바꾸느라 잠시 멈춘 판(난이도마다 하나). 같은 레벨로 돌아오면 이어서 풉니다. */
  paused: Partial<Record<SudokuDifficulty, SudokuGame>>;
  /** 시작 화면에서 고른 난이도. null이면 레벨에 맞는 난이도 */
  chosenDifficulty: SudokuDifficulty | null;
  /** 총점과 종류별 기록(점수표) */
  stats: Partial<Record<StatKey, PuzzleStat>>;
  /** 방금 푼 판에서 얻은 점수(완성 창에 보여 주고 저장하지 않음) */
  /** 방금 깬 레벨에서 받은 별(완성 창에 보여 줌) */
  lastStars: StarLine[] | null;
  /** 방금 깬 판의 시간과 그 전 최고 기록(완성 창에 보여 줌, 시간을 재지 않는 퍼즐은 null) */
  lastRecord: LastRecord | null;
  /** 레벨별 가장 많이 받은 별(키는 collection.starKey) */
  stars: Record<string, number>;
  /** 다섯 퍼즐의 난이도마다 깬 마지막 레벨(2026-10-27, 예전 진행은 쉬움으로 옮김) */
  tierCleared: Partial<Record<TierPuzzle, Partial<Record<Tier, number>>>>;
  /** 퍼즐마다 고른 난이도(없으면 쉬움) */
  tierChosen: Partial<Record<TierPuzzle, Tier>>;
  /** 난이도를 바꾸느라 잠시 멈춘 판(퍼즐·난이도마다 하나) */
  tierPaused: Partial<Record<TierPuzzle, Partial<Record<Tier, unknown>>>>;
  /** 지금 판(고른 난이도의 판) */
  zoneGame: ZoneGame | null;
  slideGame: SlideGame | null;
  blockGame: BlockGame | null;
  nonogramGame: NonogramGame | null;
  escapeGame: EscapeGame | null;
  /** 블록 탈출 레벨별 가장 적은 이동 수(키는 escapeBestKey) */
  escapeBest: Record<string, number>;
  /** 남은 힌트 수 */
  hints: number;
  /** 오늘의 퍼즐: 날짜와 그날의 판들(날짜가 바뀌면 새로 만듭니다) */
  dailyDate: string | null;
  dailySudoku: SudokuGame | null;
  dailyZone: ZoneGame | null;
  dailyBlocks: BlockGame | null;
  dailySlide: SlideGame | null;
  /** 오늘 다 푼 판 종류 */
  dailyDone: DailyKind[];
  /** 세 판을 다 푼 날짜들(연속 출석 계산, 최근 400일만) */
  dailyDays: string[];
  /** 방금 푼 오늘의 퍼즐로 받은 힌트 수(완성 창에 보여 줌) */
  lastHintReward: number;

  chooseDifficulty: (difficulty: SudokuDifficulty) => void;
  /** 지금 풀 레벨의 판을 준비합니다(같은 레벨·난이도로 진행 중이면 그대로). */
  startLevel: (level: number) => SudokuGame;
  updateGame: (update: (game: SudokuGame) => SudokuGame) => void;
  updateSettings: (patch: Partial<PuzzleSettings>) => void;
  chooseTier: (puzzle: TierPuzzle, tier: Tier) => void;
  startZone: () => ZoneGame;
  updateZone: (update: (game: ZoneGame) => ZoneGame) => void;
  startSlide: () => SlideGame;
  updateSlide: (update: (game: SlideGame) => SlideGame) => void;
  startBlocks: () => BlockGame;
  updateBlocks: (update: (game: BlockGame) => BlockGame) => void;
  startNonogram: () => NonogramGame;
  updateNonogram: (update: (game: NonogramGame) => NonogramGame) => void;
  startEscape: () => EscapeGame;
  updateEscape: (update: (game: EscapeGame) => EscapeGame) => void;
  /** 힌트 하나를 씁니다. 남은 힌트가 없으면 false */
  spendHint: () => boolean;
  /** 날짜가 바뀌었으면 오늘의 퍼즐을 새로 준비합니다. */
  ensureDaily: () => void;
  startDailySudoku: () => SudokuGame;
  updateDailySudoku: (update: (game: SudokuGame) => SudokuGame) => void;
  startDailyZone: () => ZoneGame;
  updateDailyZone: (update: (game: ZoneGame) => ZoneGame) => void;
  startDailyBlocks: () => BlockGame;
  updateDailyBlocks: (update: (game: BlockGame) => BlockGame) => void;
  startDailySlide: () => SlideGame;
  updateDailySlide: (update: (game: SlideGame) => SlideGame) => void;
}

const DAILY_RESET = { dailySudoku: null, dailyZone: null, dailyBlocks: null, dailySlide: null, dailyDone: [] as DailyKind[] };

/** 한 판의 별을 기록합니다(같은 레벨은 가장 많이 받은 별을 남김). */
function gainStars(state: PuzzleState, key: string, lines: StarLine[]): Pick<PuzzleState, "stars" | "lastStars" | "lastRecord"> {
  return { stars: keepBest(state.stars, key, starCount(lines)), lastStars: lines, lastRecord: null };
}

/** 퍼즐 기록을 더하고, 완성 창에 보여 줄 방금 판 결과를 남깁니다. */
function record(state: PuzzleState, key: StatKey, seconds: number, helped: boolean): Pick<PuzzleState, "stats" | "lastRecord"> {
  const prev = state.stats[key];
  return { stats: { ...state.stats, [key]: addRecord(prev, seconds, helped) }, lastRecord: { seconds, prevBest: prev?.bestSeconds } };
}

/** 다섯 퍼즐: 고른 난이도와 그 난이도의 다음 레벨 */
export function tierNext(s: Pick<PuzzleState, "tierCleared" | "tierChosen">, puzzle: TierPuzzle): { tier: Tier; level: number } {
  const tier = s.tierChosen[puzzle] ?? DEFAULT_TIER;
  return { tier, level: (s.tierCleared[puzzle]?.[tier] ?? 0) + 1 };
}

const TIER_SLOT = { zones: "zoneGame", sliding: "slideGame", blocks: "blockGame", nonogram: "nonogramGame", escape: "escapeGame" } as const;

/** 난이도를 고른 적이 없으면 쉬움부터 */
export const DEFAULT_DIFFICULTY: SudokuDifficulty = "easy";

/** 고른 난이도와 그 난이도의 다음 레벨 */
export function sudokuNext(s: Pick<PuzzleState, "sudokuCleared" | "chosenDifficulty">): { difficulty: SudokuDifficulty; level: number } {
  const difficulty = s.chosenDifficulty ?? DEFAULT_DIFFICULTY;
  return { difficulty, level: (s.sudokuCleared[difficulty] ?? 0) + 1 };
}

export const usePuzzleStore = create<PuzzleState>()(
  persist(
    (set, get) => {
      type Slot = "dailySudoku" | "dailyZone" | "dailyBlocks" | "dailySlide";
      /** 오늘의 퍼즐 한 판을 바꾸고, 방금 풀었으면 힌트를 주고 세 판을 다 풀면 출석으로 셉니다. */
      function updateDaily<G>(kind: DailyKind, slot: Slot, solved: (g: G) => boolean, update: (g: G) => G) {
        const before = get()[slot] as G | null;
        if (!before) return;
        const game = update(before);
        if (game === before) return;
        const done = get().dailyDone;
        if (solved(game) && !solved(before) && !done.includes(kind)) {
          const date = get().dailyDate!;
          const total = dailyKinds(date).length;
          const reward = dailyHintReward(done.length, total);
          const dailyDone = [...done, kind];
          const allDone = dailyDone.length === total;
          trackDaily(kind, allDone);
          set({
            [slot]: game,
            dailyDone,
            hints: get().hints + reward,
            lastHintReward: reward,
            dailyDays: allDone && !get().dailyDays.includes(date) ? [...get().dailyDays, date].slice(-400) : get().dailyDays,
          } as Partial<PuzzleState>);
          return;
        }
        set({ [slot]: game } as Partial<PuzzleState>);
      }

      type TieredGame = { level: number; tier?: Tier };
      /** 고른 난이도의 다음 레벨 판을 준비합니다. 다른 난이도로 풀던 판은 버리지 않고 멈춰 둡니다. */
      function startTiered<G extends TieredGame>(puzzle: TierPuzzle, done: (g: G) => boolean, make: (level: number, tier: Tier) => G): G {
        const { tier, level } = tierNext(get(), puzzle);
        const slot = TIER_SLOT[puzzle];
        const current = get()[slot] as G | null;
        if (current && (current.tier ?? DEFAULT_TIER) === tier && current.level === level && !done(current)) return current;
        const paused = { ...(get().tierPaused[puzzle] ?? {}) } as Partial<Record<Tier, G>>;
        if (current && !done(current)) paused[current.tier ?? DEFAULT_TIER] = current;
        const kept = paused[tier];
        delete paused[tier];
        const resumed = !!kept && kept.level === level && !done(kept);
        const game = resumed ? kept : { ...make(level, tier), tier };
        if (!resumed) trackStart(puzzle, tier);
        set({ [slot]: game, tierPaused: { ...get().tierPaused, [puzzle]: paused } } as Partial<PuzzleState>);
        return game;
      }
      /** 지금 판을 바꾸고, 방금 풀었으면 그 난이도의 깬 레벨과 별·기록을 남깁니다. */
      function updateTiered<G extends TieredGame>(puzzle: TierPuzzle, done: (g: G) => boolean, update: (g: G) => G, solved: (g: G, tier: Tier) => Partial<PuzzleState>) {
        const slot = TIER_SLOT[puzzle];
        const before = get()[slot] as G | null;
        if (!before) return;
        const game = update(before);
        if (game === before) return;
        if (done(game) && !done(before)) {
          const tier = game.tier ?? DEFAULT_TIER;
          const cleared = get().tierCleared[puzzle] ?? {};
          trackClear(puzzle, tier);
          set({
            [slot]: game,
            tierCleared: { ...get().tierCleared, [puzzle]: { ...cleared, [tier]: Math.max(cleared[tier] ?? 0, game.level) } },
            ...solved(game, tier),
          } as Partial<PuzzleState>);
          return;
        }
        set({ [slot]: game } as Partial<PuzzleState>);
      }

      return {
      sudokuCleared: {},
      bestSeconds: {},
      settings: { inputMode: "cell-first", highlightSame: true, showConflicts: true, sound: true, haptics: true, autoCross: true, shareUsage: true },
      game: null,
      paused: {},
      chosenDifficulty: null,
      stats: {},
      lastStars: null,
      lastRecord: null,
      stars: {},
      tierCleared: {},
      tierChosen: {},
      tierPaused: {},
      zoneGame: null,
      slideGame: null,
      blockGame: null,
      nonogramGame: null,
      escapeGame: null,
      escapeBest: {},
      hints: HINT_START,
      dailyDate: null,
      ...DAILY_RESET,
      dailyDays: [],
      lastHintReward: 0,

      chooseDifficulty: (difficulty) => set({ chosenDifficulty: difficulty }),
      startLevel: (level) => {
        const current = get().game;
        const difficulty = get().chosenDifficulty ?? DEFAULT_DIFFICULTY;
        if (current && current.level === level && current.difficulty === difficulty && !current.completed) return current;
        const paused = { ...get().paused };
        // 하던 판은 버리지 않고 그 난이도 자리에 넣어 둡니다.
        if (current && !current.completed && hasProgress(current)) paused[current.difficulty] = { ...current, history: [], selected: null };
        const kept = paused[difficulty];
        delete paused[difficulty];
        if (kept && kept.level === level && !kept.completed) {
          set({ game: kept, paused });
          return kept;
        }
        const p = puzzleForLevel(level, difficulty);
        const game = newGame({ id: p.id, level, difficulty: p.difficulty, puzzle: p.puzzle, solution: p.solution });
        trackStart("sudoku", game.difficulty);
        set({ game, paused });
        return game;
      },
      updateGame: (update) => {
        const before = get().game;
        if (!before) return;
        const game = update(before);
        if (game === before) return;
        if (game.completed && !before.completed) {
          const key = `${game.difficulty}:${game.level}`;
          const best = get().bestSeconds[key];
          const lines = sudokuStars(game.difficulty, game.elapsedSeconds, !!game.usedCheck || !!game.usedHint);
          trackClear("sudoku", game.difficulty);
          set({
            ...gainStars(get(), starKey.sudoku(game.difficulty, game.level), lines),
            game,
            sudokuCleared: { ...get().sudokuCleared, [game.difficulty]: Math.max(get().sudokuCleared[game.difficulty] ?? 0, game.level) },
            bestSeconds: { ...get().bestSeconds, [key]: best ? Math.min(best, game.elapsedSeconds) : game.elapsedSeconds },
            ...record(get(), game.difficulty, game.elapsedSeconds, !!game.usedCheck || !!game.usedHint),
          });
          return;
        }
        set({ game });
      },
      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      chooseTier: (puzzle, tier) => set({ tierChosen: { ...get().tierChosen, [puzzle]: tier } }),
      startZone: () => startTiered("zones", (g: ZoneGame) => g.solved, (level, tier) => newZoneGame(level, zonesForLevel(level, tier))),
      updateZone: (update) =>
        updateTiered("zones", (g: ZoneGame) => g.solved, update, (g, tier) => {
          const helped = !!g.usedHint;
          return {
            ...gainStars(get(), starKey.zones(g.level, tier), zoneStars(g.puzzle.size, g.elapsedSeconds, helped)),
            ...record(get(), tierStatKey("zones", tier), g.elapsedSeconds, helped),
          };
        }),
      startSlide: () => startTiered("sliding", (g: SlideGame) => g.solved, (level, tier) => newSlideGame(level, slideForLevel(level, tier))),
      updateSlide: (update) =>
        updateTiered("sliding", (g: SlideGame) => g.solved, update, (g, tier) => {
          const helped = !!g.usedHint;
          return {
            ...gainStars(get(), starKey.sliding(g.level, tier), slideStars(g.moves, g.puzzle.minMoves, g.elapsedSeconds, helped)),
            ...record(get(), tierStatKey("sliding", tier), g.elapsedSeconds, helped),
          };
        }),
      startBlocks: () => startTiered("blocks", (g: BlockGame) => g.solved, (level, tier) => newBlockGame(level, blocksForLevel(level, tier))),
      updateBlocks: (update) =>
        updateTiered("blocks", (g: BlockGame) => g.solved, update, (g, tier) => {
          const helped = !!g.usedHint;
          return {
            ...gainStars(get(), starKey.blocks(g.level, tier), blockStars(g.puzzle.size, g.elapsedSeconds, helped)),
            ...record(get(), tierStatKey("blocks", tier), g.elapsedSeconds, helped),
          };
        }),
      startNonogram: () => startTiered("nonogram", (g: NonogramGame) => g.solved, (level, tier) => newNonogramGame(nonogramForLevel(level, tier), level)),
      updateNonogram: (update) =>
        updateTiered("nonogram", (g: NonogramGame) => g.solved, update, (g, tier) => gainStars(get(), starKey.nonogram(g.level, tier), nonogramStars(g.mistakes ?? 0, !!g.usedHint))),
      startEscape: () =>
        startTiered("escape", (g: EscapeGame) => g.escaped, (level, tier) => {
          const { board, minMoves } = escapeForLevel(level, tier);
          return newEscapeGame(board, level, minMoves);
        }),
      updateEscape: (update) =>
        updateTiered("escape", (g: EscapeGame) => g.escaped, update, (g, tier) => {
          const key = escapeBestKey(g.level, tier);
          const best = get().escapeBest[key];
          return {
            escapeBest: best === undefined || g.moves < best ? { ...get().escapeBest, [key]: g.moves } : get().escapeBest,
            ...gainStars(get(), starKey.escape(g.level, tier), escapeStars(g.moves, g.minMoves, !!g.usedHint)),
          };
        }),

      spendHint: () => {
        if (get().hints <= 0) return false;
        set({ hints: get().hints - 1 });
        return true;
      },
      ensureDaily: () => {
        const today = dateKey();
        if (get().dailyDate !== today) set({ dailyDate: today, ...DAILY_RESET });
      },
      startDailySudoku: () => {
        get().ensureDaily();
        const current = get().dailySudoku;
        if (current) return current;
        const p = dailySudoku(get().dailyDate!);
        const game = newGame({ id: p.id, level: 0, difficulty: p.difficulty, puzzle: p.puzzle, solution: p.solution });
        set({ dailySudoku: game });
        return game;
      },
      updateDailySudoku: (update) => updateDaily("sudoku", "dailySudoku", (g) => g.completed, update),
      startDailyZone: () => {
        get().ensureDaily();
        const current = get().dailyZone;
        if (current) return current;
        const game = newZoneGame(0, dailyZones(get().dailyDate!));
        set({ dailyZone: game });
        return game;
      },
      updateDailyZone: (update) => updateDaily("zones", "dailyZone", (g) => g.solved, update),
      startDailyBlocks: () => {
        get().ensureDaily();
        const current = get().dailyBlocks;
        if (current) return current;
        const game = newBlockGame(0, dailyBlocks(get().dailyDate!));
        set({ dailyBlocks: game });
        return game;
      },
      updateDailyBlocks: (update) => updateDaily("blocks", "dailyBlocks", (g) => g.solved, update),
      startDailySlide: () => {
        get().ensureDaily();
        const current = get().dailySlide;
        if (current) return current;
        const game = newSlideGame(0, dailySlide(get().dailyDate!));
        set({ dailySlide: game });
        return game;
      },
      updateDailySlide: (update) => updateDaily("sliding", "dailySlide", (g) => g.solved, update),
      };
    },
    {
      name: "oneuldopuzzle-v1",
      version: 5,
      // 버전 1은 모든 난이도가 레벨 하나를 같이 썼습니다. 깬 레벨은 그때 고른 난이도의 레벨로 옮깁니다.
      migrate: (persisted, version) => {
        let p = (persisted ?? {}) as Partial<PuzzleState> & { zoneCleared?: number; slideCleared?: number; blockCleared?: number; escapeCleared?: number; nonogramCleared?: number | number[]; clearedLevel?: number; score?: number; lastScore?: unknown };
        // 버전 1은 모든 난이도가 레벨 하나를 같이 썼습니다. 깬 레벨은 그때 고른 난이도의 레벨로 옮깁니다.
        if (version < 2) {
          const cleared = p.clearedLevel ?? 0;
          const difficulty = p.chosenDifficulty ?? difficultyForLevel(cleared + 1);
          p = { ...p, chosenDifficulty: difficulty, sudokuCleared: cleared ? { [difficulty]: cleared } : {}, bestSeconds: {} };
          delete p.clearedLevel;
        }
        // 버전 3은 점수 대신 별. 예전에 깬 레벨은 별 1개씩으로 옮깁니다.
        if (version < 3) {
          const stars: Record<string, number> = {};
          for (const [d, n] of Object.entries(p.sudokuCleared ?? {})) for (let l = 1; l <= (n ?? 0); l += 1) stars[starKey.sudoku(d, l)] = 1;
          for (let l = 1; l <= (p.zoneCleared ?? 0); l += 1) stars[starKey.zones(l)] = 1;
          for (let l = 1; l <= (p.blockCleared ?? 0); l += 1) stars[starKey.blocks(l)] = 1;
          for (let l = 1; l <= (p.slideCleared ?? 0); l += 1) stars[starKey.sliding(l)] = 1;
          for (const st of Array.isArray(p.nonogramCleared) ? p.nonogramCleared : []) stars[starKey.nonogram(st)] = 1;
          for (const st of Object.keys(p.escapeBest ?? {})) stars[starKey.escape(Number(st))] = 1;
          p = { ...p, stars };
          delete p.score;
          delete p.lastScore;
        }
        // 버전 4는 노노그램·블록 탈출이 끝없는 레벨(예전엔 3단계씩). 1단계부터 이어서 푼 만큼을 깬 레벨로 치고,
        // 예전 단계의 별은 다른 이름으로 남겨 모은 별 수가 줄지 않게 합니다.
        if (version < 4) {
          const oldNonogram = Array.isArray(p.nonogramCleared) ? p.nonogramCleared : [];
          const oldEscape = Object.keys(p.escapeBest ?? {}).map(Number);
          const streak = (done: number[]) => {
            let n = 0;
            while (done.includes(n)) n += 1;
            return n;
          };
          const stars: Record<string, number> = {};
          for (const [k, v] of Object.entries(p.stars ?? {})) {
            const [kind, stage] = k.split(":");
            stars[kind === "nonogram" || kind === "escape" ? `${kind}-old:${stage}` : k] = v;
          }
          p = { ...p, stars, nonogramCleared: streak(oldNonogram), escapeCleared: streak(oldEscape), escapeBest: {} };
        }
        // 버전 5는 다섯 퍼즐도 난이도마다 레벨(2026-10-27). 예전에 깬 레벨은 쉬움으로 옮깁니다(별·기록 키는 쉬움이 예전 키 그대로).
        if (version < 5) {
          const easy = (n: unknown) => (typeof n === "number" && n > 0 ? { easy: n } : {});
          p = {
            ...p,
            tierCleared: { zones: easy(p.zoneCleared), sliding: easy(p.slideCleared), blocks: easy(p.blockCleared), nonogram: easy(p.nonogramCleared), escape: easy(p.escapeCleared) },
            tierChosen: {},
            tierPaused: {},
          };
          delete p.zoneCleared;
          delete p.slideCleared;
          delete p.blockCleared;
          delete p.nonogramCleared;
          delete p.escapeCleared;
        }
        return p as never;
      },
      // 예전 저장본에 없는 설정은 기본값으로 채웁니다.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PuzzleState>;
        return { ...current, ...p, settings: { ...current.settings, ...(p.settings ?? {}) } };
      },
      // 되돌리기 기록은 저장하지 않아도 이어 하기에 문제없어 용량을 아낍니다.
      partialize: (s) => ({
        sudokuCleared: s.sudokuCleared,
        bestSeconds: s.bestSeconds,
        settings: s.settings,
        chosenDifficulty: s.chosenDifficulty,
        paused: s.paused,
        stats: s.stats,
        tierCleared: s.tierCleared,
        tierChosen: s.tierChosen,
        tierPaused: Object.fromEntries(
          Object.entries(s.tierPaused).map(([k, games]) => [k, Object.fromEntries(Object.entries(games ?? {}).map(([t, g]) => [t, { ...(g as object), history: [], selected: null }]))]),
        ),
        zoneGame: s.zoneGame ? { ...s.zoneGame, history: [] } : null,
        slideGame: s.slideGame ? { ...s.slideGame, history: [] } : null,
        blockGame: s.blockGame ? { ...s.blockGame, history: [] } : null,
        nonogramGame: s.nonogramGame ? { ...s.nonogramGame, history: [] } : null,
        escapeGame: s.escapeGame ? { ...s.escapeGame, history: [], selected: null } : null,
        escapeBest: s.escapeBest,
        stars: s.stars,
        hints: s.hints,
        dailyDate: s.dailyDate,
        dailySudoku: s.dailySudoku ? { ...s.dailySudoku, history: [], selected: null } : null,
        dailyZone: s.dailyZone ? { ...s.dailyZone, history: [] } : null,
        dailyBlocks: s.dailyBlocks ? { ...s.dailyBlocks, history: [] } : null,
        dailySlide: s.dailySlide ? { ...s.dailySlide, history: [] } : null,
        dailyDone: s.dailyDone,
        dailyDays: s.dailyDays,
        game: s.game ? { ...s.game, history: [], selected: null } : null,
      }),
    },
  ),
);
