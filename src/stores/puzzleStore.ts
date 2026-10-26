// 진행 상황·점수·설정을 기기에 저장합니다. 계정·동기화는 이후 단계에서 공용 API에 붙입니다.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { specialScore, sudokuScore, total, zoneScore, type ScoreLine } from "../puzzle/core/score";
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

export type StatKey = SudokuDifficulty | "zones";

interface PuzzleState {
  /** 깬 가장 높은 레벨(0이면 아직 없음) */
  clearedLevel: number;
  bestSeconds: Record<number, number>;
  settings: PuzzleSettings;
  game: SudokuGame | null;
  /** 난이도를 바꾸느라 잠시 멈춘 판(난이도마다 하나). 같은 레벨로 돌아오면 이어서 풉니다. */
  paused: Partial<Record<SudokuDifficulty, SudokuGame>>;
  /** 시작 화면에서 고른 난이도. null이면 레벨에 맞는 난이도 */
  chosenDifficulty: SudokuDifficulty | null;
  /** 총점과 종류별 기록(점수표) */
  score: number;
  stats: Partial<Record<StatKey, PuzzleStat>>;
  /** 방금 푼 판에서 얻은 점수(완성 창에 보여 주고 저장하지 않음) */
  lastScore: ScoreLine[] | null;
  /** 색깔 구역 퍼즐 */
  zoneCleared: number;
  zoneGame: ZoneGame | null;
  /** 스페셜 체험: 다 푼 노노그램 단계 */
  nonogramCleared: number[];
  /** 스페셜 체험: 블록 탈출 단계별 가장 적은 이동 수 */
  escapeBest: Record<number, number>;

  chooseDifficulty: (difficulty: SudokuDifficulty) => void;
  /** 지금 풀 레벨의 판을 준비합니다(같은 레벨·난이도로 진행 중이면 그대로). */
  startLevel: (level: number) => SudokuGame;
  updateGame: (update: (game: SudokuGame) => SudokuGame) => void;
  updateSettings: (patch: Partial<PuzzleSettings>) => void;
  startZone: () => ZoneGame;
  updateZone: (update: (game: ZoneGame) => ZoneGame) => void;
  clearNonogram: (stage: number) => void;
  clearEscape: (stage: number, moves: number, minMoves: number) => void;
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

export const usePuzzleStore = create<PuzzleState>()(
  persist(
    (set, get) => ({
      clearedLevel: 0,
      bestSeconds: {},
      settings: { inputMode: "cell-first", highlightSame: true, showConflicts: true, sound: true, haptics: true },
      game: null,
      paused: {},
      chosenDifficulty: null,
      score: 0,
      stats: {},
      lastScore: null,
      zoneCleared: 0,
      zoneGame: null,
      nonogramCleared: [],
      escapeBest: {},

      chooseDifficulty: (difficulty) => set({ chosenDifficulty: difficulty }),
      startLevel: (level) => {
        const current = get().game;
        const difficulty = get().chosenDifficulty ?? difficultyForLevel(level);
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
          const best = get().bestSeconds[game.level];
          const lines = sudokuScore(game.difficulty, game.elapsedSeconds, !!game.usedCheck);
          set({
            game,
            clearedLevel: Math.max(get().clearedLevel, game.level),
            bestSeconds: { ...get().bestSeconds, [game.level]: best ? Math.min(best, game.elapsedSeconds) : game.elapsedSeconds },
            score: get().score + total(lines),
            stats: addStat(get().stats, game.difficulty, game.elapsedSeconds),
            lastScore: lines,
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
          const lines = zoneScore(zoneGame.puzzle.size, zoneGame.elapsedSeconds);
          set({
            zoneGame,
            zoneCleared: Math.max(get().zoneCleared, zoneGame.level),
            score: get().score + total(lines),
            stats: addStat(get().stats, "zones", zoneGame.elapsedSeconds),
            lastScore: lines,
          });
          return;
        }
        set({ zoneGame });
      },
      clearNonogram: (stage) => {
        const first = !get().nonogramCleared.includes(stage);
        const lines = specialScore(first, false);
        set({
          nonogramCleared: first ? [...get().nonogramCleared, stage] : get().nonogramCleared,
          score: get().score + total(lines),
          lastScore: lines,
        });
      },
      clearEscape: (stage, moves, minMoves) => {
        const best = get().escapeBest[stage];
        const first = best === undefined;
        const perfectFirst = moves <= minMoves && (first || best > minMoves);
        const lines = specialScore(first, perfectFirst);
        set({
          escapeBest: first || moves < best ? { ...get().escapeBest, [stage]: moves } : get().escapeBest,
          score: get().score + total(lines),
          lastScore: lines,
        });
      },
    }),
    {
      name: "oneuldopuzzle-v1",
      version: 1,
      // 예전 저장본에 없는 설정은 기본값으로 채웁니다.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PuzzleState>;
        return { ...current, ...p, settings: { ...current.settings, ...(p.settings ?? {}) } };
      },
      // 되돌리기 기록은 저장하지 않아도 이어 하기에 문제없어 용량을 아낍니다.
      partialize: (s) => ({
        clearedLevel: s.clearedLevel,
        bestSeconds: s.bestSeconds,
        settings: s.settings,
        chosenDifficulty: s.chosenDifficulty,
        paused: s.paused,
        score: s.score,
        stats: s.stats,
        zoneCleared: s.zoneCleared,
        zoneGame: s.zoneGame ? { ...s.zoneGame, history: [] } : null,
        nonogramCleared: s.nonogramCleared,
        escapeBest: s.escapeBest,
        game: s.game ? { ...s.game, history: [], selected: null } : null,
      }),
    },
  ),
);
