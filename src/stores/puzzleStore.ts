// 진행 상황·점수·설정을 기기에 저장합니다. 계정·동기화는 이후 단계에서 공용 API에 붙입니다.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HINT_START, blockStars, dailyHintReward, escapeStars, nonogramStars, slideStars, starCount, sudokuStars, zoneStars, type StarLine } from "../puzzle/core/score";
import { keepBest, starKey } from "../puzzle/core/collection";
import { dessertForLevel } from "../theme/palette";
import { dailyBlocks, dailyKinds, dailySlide, dailySudoku, dailyZones, dateKey, dayNumber, type DailyKind } from "../puzzle/core/daily";
import { blocksForLevel } from "../puzzle/blocks/generator";
import { newBlockGame, type BlockGame } from "../puzzle/blocks/game";
import { slideForLevel } from "../puzzle/sliding/generator";
import { newSlideGame, type SlideGame } from "../puzzle/sliding/game";
import { difficultyForLevel, puzzleForLevel, type SudokuDifficulty } from "../puzzle/sudoku/generator";
import { hasProgress, newGame, type InputMode, type SudokuGame } from "../puzzle/sudoku/game";
import { zonesForLevel } from "../puzzle/zones/generator";
import { newZoneGame, type ZoneGame } from "../puzzle/zones/game";

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
}

/** 점수표 한 줄: 퍼즐 종류별로 푼 수·가장 빠른 시간·합계 시간 */
export interface PuzzleStat {
  cleared: number;
  bestSeconds?: number;
  totalSeconds: number;
}

export type StatKey = SudokuDifficulty | "zones" | "sliding" | "blocks";

interface PuzzleState {
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
  /** 레벨별 가장 많이 받은 별(키는 collection.starKey) */
  stars: Record<string, number>;
  /** 오늘의 퍼즐로 받은 디저트 수(디저트 id → 개수) */
  treats: Record<string, number>;
  /** 색깔 구역 퍼즐 */
  zoneCleared: number;
  zoneGame: ZoneGame | null;
  /** 슬라이딩 퍼즐 */
  slideCleared: number;
  slideGame: SlideGame | null;
  /** 블록 채우기 */
  blockCleared: number;
  blockGame: BlockGame | null;
  /** 스페셜 체험: 다 푼 노노그램 단계 */
  nonogramCleared: number[];
  /** 스페셜 체험: 블록 탈출 단계별 가장 적은 이동 수 */
  escapeBest: Record<number, number>;
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
  startZone: () => ZoneGame;
  updateZone: (update: (game: ZoneGame) => ZoneGame) => void;
  startSlide: () => SlideGame;
  updateSlide: (update: (game: SlideGame) => SlideGame) => void;
  startBlocks: () => BlockGame;
  updateBlocks: (update: (game: BlockGame) => BlockGame) => void;
  clearNonogram: (stage: number, mistakes: number, helped: boolean) => void;
  clearEscape: (stage: number, moves: number, minMoves: number, helped: boolean) => void;
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

function addTreat(treats: Record<string, number>, id: string): Record<string, number> {
  return { ...treats, [id]: (treats[id] ?? 0) + 1 };
}

function addStat(stats: PuzzleState["stats"], key: StatKey, seconds: number): PuzzleState["stats"] {
  const prev = stats[key] ?? { cleared: 0, totalSeconds: 0 };
  return {
    ...stats,
    [key]: {
      cleared: prev.cleared + 1,
      totalSeconds: prev.totalSeconds + seconds,
      bestSeconds: prev.bestSeconds === undefined ? seconds : Math.min(prev.bestSeconds, seconds),
    },
  };
}

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
          set({
            [slot]: game,
            dailyDone,
            hints: get().hints + reward,
            lastHintReward: reward,
            dailyDays: allDone && !get().dailyDays.includes(date) ? [...get().dailyDays, date].slice(-400) : get().dailyDays,
            // 세 판을 다 풀면 그날의 디저트를 받습니다(도감에서 바로 열림).
            treats: allDone ? addTreat(get().treats, dessertForLevel(dayNumber(date) + 1).id) : get().treats,
          } as Partial<PuzzleState>);
          return;
        }
        set({ [slot]: game } as Partial<PuzzleState>);
      }

      return {
      sudokuCleared: {},
      bestSeconds: {},
      settings: { inputMode: "cell-first", highlightSame: true, showConflicts: true, sound: true, haptics: true },
      game: null,
      paused: {},
      chosenDifficulty: null,
      stats: {},
      lastStars: null,
      stars: {},
      treats: {},
      zoneCleared: 0,
      zoneGame: null,
      slideCleared: 0,
      slideGame: null,
      blockCleared: 0,
      blockGame: null,
      nonogramCleared: [],
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
          set({
            stars: keepBest(get().stars, starKey.sudoku(game.difficulty, game.level), starCount(lines)),
            game,
            sudokuCleared: { ...get().sudokuCleared, [game.difficulty]: Math.max(get().sudokuCleared[game.difficulty] ?? 0, game.level) },
            bestSeconds: { ...get().bestSeconds, [key]: best ? Math.min(best, game.elapsedSeconds) : game.elapsedSeconds },
            stats: addStat(get().stats, game.difficulty, game.elapsedSeconds),
            lastStars: lines,
          });
          return;
        }
        set({ game });
      },
      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      startZone: () => {
        const level = get().zoneCleared + 1;
        const current = get().zoneGame;
        if (current && current.level === level && !current.solved) return current;
        const zoneGame = newZoneGame(level, zonesForLevel(level));
        set({ zoneGame });
        return zoneGame;
      },
      updateZone: (update) => {
        const before = get().zoneGame;
        if (!before) return;
        const zoneGame = update(before);
        if (zoneGame === before) return;
        if (zoneGame.solved && !before.solved) {
          const lines = zoneStars(zoneGame.puzzle.size, zoneGame.elapsedSeconds, !!zoneGame.usedHint);
          set({
            zoneGame,
            zoneCleared: Math.max(get().zoneCleared, zoneGame.level),
            stars: keepBest(get().stars, starKey.zones(zoneGame.level), starCount(lines)),
            stats: addStat(get().stats, "zones", zoneGame.elapsedSeconds),
            lastStars: lines,
          });
          return;
        }
        set({ zoneGame });
      },
      startSlide: () => {
        const level = get().slideCleared + 1;
        const current = get().slideGame;
        if (current && current.level === level && !current.solved) return current;
        const slideGame = newSlideGame(level, slideForLevel(level));
        set({ slideGame });
        return slideGame;
      },
      updateSlide: (update) => {
        const before = get().slideGame;
        if (!before) return;
        const slideGame = update(before);
        if (slideGame === before) return;
        if (slideGame.solved && !before.solved) {
          const lines = slideStars(slideGame.moves, slideGame.puzzle.minMoves, slideGame.elapsedSeconds, !!slideGame.usedHint);
          set({
            slideGame,
            slideCleared: Math.max(get().slideCleared, slideGame.level),
            stars: keepBest(get().stars, starKey.sliding(slideGame.level), starCount(lines)),
            stats: addStat(get().stats, "sliding", slideGame.elapsedSeconds),
            lastStars: lines,
          });
          return;
        }
        set({ slideGame });
      },
      startBlocks: () => {
        const level = get().blockCleared + 1;
        const current = get().blockGame;
        if (current && current.level === level && !current.solved) return current;
        const blockGame = newBlockGame(level, blocksForLevel(level));
        set({ blockGame });
        return blockGame;
      },
      updateBlocks: (update) => {
        const before = get().blockGame;
        if (!before) return;
        const blockGame = update(before);
        if (blockGame === before) return;
        if (blockGame.solved && !before.solved) {
          const lines = blockStars(blockGame.puzzle.size, blockGame.elapsedSeconds, !!blockGame.usedHint);
          set({
            blockGame,
            blockCleared: Math.max(get().blockCleared, blockGame.level),
            stars: keepBest(get().stars, starKey.blocks(blockGame.level), starCount(lines)),
            stats: addStat(get().stats, "blocks", blockGame.elapsedSeconds),
            lastStars: lines,
          });
          return;
        }
        set({ blockGame });
      },
      clearNonogram: (stage, mistakes, helped) => {
        const first = !get().nonogramCleared.includes(stage);
        const lines = nonogramStars(mistakes, helped);
        set({
          nonogramCleared: first ? [...get().nonogramCleared, stage] : get().nonogramCleared,
          stars: keepBest(get().stars, starKey.nonogram(stage), starCount(lines)),
          lastStars: lines,
        });
      },
      clearEscape: (stage, moves, minMoves, helped) => {
        const best = get().escapeBest[stage];
        const lines = escapeStars(moves, minMoves, helped);
        set({
          escapeBest: best === undefined || moves < best ? { ...get().escapeBest, [stage]: moves } : get().escapeBest,
          stars: keepBest(get().stars, starKey.escape(stage), starCount(lines)),
          lastStars: lines,
        });
      },

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
      version: 3,
      // 버전 1은 모든 난이도가 레벨 하나를 같이 썼습니다. 깬 레벨은 그때 고른 난이도의 레벨로 옮깁니다.
      migrate: (persisted, version) => {
        let p = (persisted ?? {}) as Partial<PuzzleState> & { clearedLevel?: number; score?: number; lastScore?: unknown };
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
          for (const st of p.nonogramCleared ?? []) stars[starKey.nonogram(st)] = 1;
          for (const st of Object.keys(p.escapeBest ?? {})) stars[starKey.escape(Number(st))] = 1;
          p = { ...p, stars, treats: {} };
          delete p.score;
          delete p.lastScore;
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
        zoneCleared: s.zoneCleared,
        zoneGame: s.zoneGame ? { ...s.zoneGame, history: [] } : null,
        slideCleared: s.slideCleared,
        slideGame: s.slideGame ? { ...s.slideGame, history: [] } : null,
        blockCleared: s.blockCleared,
        blockGame: s.blockGame ? { ...s.blockGame, history: [] } : null,
        nonogramCleared: s.nonogramCleared,
        escapeBest: s.escapeBest,
        stars: s.stars,
        treats: s.treats,
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
