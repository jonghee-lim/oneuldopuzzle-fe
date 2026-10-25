// 진행 상황·설정을 기기에 저장합니다. 계정·동기화는 이후 단계에서 공용 API에 붙입니다.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { difficultyForLevel, puzzleForLevel, type SudokuDifficulty } from "../puzzle/sudoku/generator";
import { newGame, type InputMode, type SudokuGame } from "../puzzle/sudoku/game";

export interface PuzzleSettings {
  inputMode: InputMode;
  /** 고른 칸과 같은 숫자를 강조 */
  highlightSame: boolean;
  /** 같은 줄·칸줄·상자에 겹친 숫자를 빨갛게 */
  showConflicts: boolean;
}

interface PuzzleState {
  /** 깬 가장 높은 레벨(0이면 아직 없음) */
  clearedLevel: number;
  bestSeconds: Record<number, number>;
  settings: PuzzleSettings;
  game: SudokuGame | null;
  /** 시작 화면에서 고른 난이도. null이면 레벨에 맞는 난이도 */
  chosenDifficulty: SudokuDifficulty | null;
  chooseDifficulty: (difficulty: SudokuDifficulty) => void;
  /** 지금 풀 레벨의 판을 준비합니다(같은 레벨·난이도로 진행 중이면 그대로). */
  startLevel: (level: number) => SudokuGame;
  updateGame: (update: (game: SudokuGame) => SudokuGame) => void;
  updateSettings: (patch: Partial<PuzzleSettings>) => void;
}

export const usePuzzleStore = create<PuzzleState>()(
  persist(
    (set, get) => ({
      clearedLevel: 0,
      bestSeconds: {},
      settings: { inputMode: "cell-first", highlightSame: true, showConflicts: true },
      game: null,
      chosenDifficulty: null,
      chooseDifficulty: (difficulty) => set({ chosenDifficulty: difficulty }),
      startLevel: (level) => {
        const current = get().game;
        const difficulty = get().chosenDifficulty ?? difficultyForLevel(level);
        if (current && current.level === level && current.difficulty === difficulty && !current.completed) return current;
        const p = puzzleForLevel(level, difficulty);
        const game = newGame({ id: p.id, level, difficulty: p.difficulty, puzzle: p.puzzle, solution: p.solution });
        set({ game });
        return game;
      },
      updateGame: (update) => {
        const before = get().game;
        if (!before) return;
        const game = update(before);
        if (game === before) return;
        if (game.completed && !before.completed) {
          const best = get().bestSeconds[game.level];
          set({
            game,
            clearedLevel: Math.max(get().clearedLevel, game.level),
            bestSeconds: { ...get().bestSeconds, [game.level]: best ? Math.min(best, game.elapsedSeconds) : game.elapsedSeconds },
          });
          return;
        }
        set({ game });
      },
      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
    }),
    {
      name: "oneuldopuzzle-v1",
      version: 1,
      // 되돌리기 기록은 저장하지 않아도 이어 하기에 문제없어 용량을 아낍니다.
      partialize: (s) => ({
        clearedLevel: s.clearedLevel,
        bestSeconds: s.bestSeconds,
        settings: s.settings,
        chosenDifficulty: s.chosenDifficulty,
        game: s.game ? { ...s.game, history: [], selected: null } : null,
      }),
    },
  ),
);
