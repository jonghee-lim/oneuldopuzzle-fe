import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSudoku } from "../src/puzzle/sudoku/generator.ts";
import {
  digitCounts, erase, isFilledButWrong, newGame, restart, tapCell, tapNumber, tick, toggleMemo, undo, type SudokuGame,
} from "../src/puzzle/sudoku/game.ts";
import { PEERS } from "../src/puzzle/sudoku/rules.ts";

const p = generateSudoku("game-test", "easy");
const start = () => newGame({ ...p, level: 1 });
const emptyCell = (g: SudokuGame) => g.puzzle.findIndex((v) => v === 0);
const givenCell = (g: SudokuGame) => g.puzzle.findIndex((v) => v !== 0);

test("칸 먼저: 칸을 누르고 숫자를 누르면 들어가고, 같은 숫자를 다시 누르면 지워진다", () => {
  let g = start();
  const i = emptyCell(g);
  g = tapCell(g, i, "cell-first");
  g = tapNumber(g, 5, "cell-first");
  assert.equal(g.values[i], 5);
  g = tapNumber(g, 5, "cell-first");
  assert.equal(g.values[i], 0);
});

test("처음 주어진 숫자는 바꿀 수 없다", () => {
  let g = start();
  const i = givenCell(g);
  g = tapNumber(tapCell(g, i, "cell-first"), (g.values[i] % 9) + 1, "cell-first");
  assert.equal(g.values[i], p.puzzle[i]);
  assert.equal(erase(g).values[i], p.puzzle[i]);
});

test("숫자 먼저: 숫자를 골라 두고 칸을 누를 때마다 들어간다", () => {
  let g = start();
  const empties = g.puzzle.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0).slice(0, 2);
  g = tapNumber(g, 3, "number-first");
  assert.equal(g.activeNumber, 3);
  for (const i of empties) g = tapCell(g, i, "number-first");
  for (const i of empties) assert.equal(g.values[i], 3);
  g = tapNumber(g, 3, "number-first");
  assert.equal(g.activeNumber, null);
});

test("메모: 후보를 켜고 끄며, 숫자를 넣으면 이웃 칸 메모에서 그 숫자가 빠진다", () => {
  let g = start();
  const i = emptyCell(g);
  const peer = PEERS[i].find((k) => g.puzzle[k] === 0)!;
  g = toggleMemo(g);
  g = tapNumber(tapCell(g, peer, "cell-first"), 7, "cell-first");
  g = tapNumber(g, 2, "cell-first");
  assert.equal(g.notes[peer], (1 << 7) | (1 << 2));
  g = tapNumber(g, 2, "cell-first");
  assert.equal(g.notes[peer], 1 << 7);
  g = toggleMemo(g);
  g = tapNumber(tapCell(g, i, "cell-first"), 7, "cell-first");
  assert.equal(g.notes[peer], 0);
  // 되돌리면 숫자와 이웃 메모가 함께 돌아온다
  g = undo(g);
  assert.equal(g.values[i], 0);
  assert.equal(g.notes[peer], 1 << 7);
});

test("답대로 다 채우면 완료, 틀리게 다 채우면 알려 준다", () => {
  let g = start();
  for (let i = 0; i < 81; i += 1) {
    if (g.puzzle[i]) continue;
    g = tapNumber(tapCell(g, i, "cell-first"), g.solution[i], "cell-first");
  }
  assert.equal(g.completed, true);
  assert.deepEqual(digitCounts(g).slice(1), new Array(9).fill(9));

  let w = start();
  const empties = w.puzzle.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  const last = empties[empties.length - 1];
  for (const i of empties.slice(0, -1)) w = tapNumber(tapCell(w, i, "cell-first"), w.solution[i], "cell-first");
  w = tapNumber(tapCell(w, last, "cell-first"), (w.solution[last] % 9) + 1, "cell-first");
  assert.equal(w.completed, false);
  assert.equal(isFilledButWrong(w), true);
});

test("다시 하기: 넣은 숫자·메모·시간·되돌리기 기록이 비고 같은 문제가 남는다", () => {
  let g = start();
  const [a, b] = g.puzzle.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  g = tapNumber(tapCell(g, a, "cell-first"), 4, "cell-first");
  g = tapNumber(tapCell(toggleMemo(g), b, "cell-first"), 6, "cell-first");
  g = tick(g, 30);
  const r = restart(g);
  assert.deepEqual(r.values, p.puzzle);
  assert.equal(r.notes.every((n) => n === 0), true);
  assert.equal(r.elapsedSeconds, 0);
  assert.equal(r.history.length, 0);
  assert.equal(r.selected, null);
  assert.equal(r.memoMode, true);
  assert.equal(r.id, g.id);
});

test("막힌 칸과 틀린 칸을 찾는다(레벨 13 보통 신고 화면)", async () => {
  const { puzzleForLevel } = await import("../src/puzzle/sudoku/generator.ts");
  const { newGame, deadCells, wrongCells } = await import("../src/puzzle/sudoku/game.ts");
  const p = puzzleForLevel(13, "normal");
  const screen = [1,4,9,5,2,7,3,6,8, 5,8,7,6,9,3,1,4,2, 0,0,3,1,8,4,5,7,9, 8,0,1,9,6,5,2,3,7, 0,0,5,7,3,1,8,9,4, 3,9,0,8,4,2,6,1,5, 7,5,6,2,1,9,4,8,3, 4,1,2,3,7,8,9,5,6, 9,3,8,4,5,6,7,2,1];
  const game = { ...newGame({ id: p.id, level: 13, difficulty: p.difficulty, puzzle: p.puzzle, solution: p.solution }), values: screen };
  assert.deepEqual(deadCells(game), [3 * 9 + 1, 5 * 9 + 2]);
  assert.equal(wrongCells(game).length, 8);
  assert.deepEqual(deadCells(newGame({ id: p.id, level: 13, difficulty: p.difficulty, puzzle: p.puzzle, solution: p.solution })), []);
});

test("시간만 흐른 판은 손댄 판이 아니다(이어 하기 0:03 신고)", async () => {
  const { hasProgress } = await import("../src/puzzle/sudoku/game.ts");
  const g = newGame({ id: "t", level: 1, difficulty: "easy", puzzle: generateSudoku("t", "easy").puzzle, solution: generateSudoku("t", "easy").solution });
  assert.equal(hasProgress(tick(g, 3)), false);
  const empty = g.values.indexOf(0);
  assert.equal(hasProgress(tapNumber(tapCell(g, empty, "cell-first"), 5, "cell-first")), true);
});

test("답대로 다 채운 줄을 찾는다", async () => {
  const { newlyCompletedCells } = await import("../src/puzzle/sudoku/game.ts");
  const p = generateSudoku("line", "easy");
  const g = newGame({ id: "l", level: 1, difficulty: "easy", puzzle: p.puzzle, solution: p.solution });
  // 첫 줄의 빈칸 하나만 남기고 채운 판에서 마지막 칸을 채우면 그 줄이 나옵니다.
  const row = Array.from({ length: 9 }, (_, c) => c);
  const blanks = row.filter((i) => p.puzzle[i] === 0);
  const almost = { ...g, values: g.values.map((v, i) => (row.includes(i) && i !== blanks[0] ? p.solution[i] : v)) };
  const done = { ...almost, values: almost.values.map((v, i) => (i === blanks[0] ? p.solution[i] : v)) };
  const cells = newlyCompletedCells(almost, done);
  assert.ok(row.every((i) => cells.includes(i)));
  assert.deepEqual(newlyCompletedCells(done, done), []);
});

test("자동 메모: 빈칸마다 들어갈 수 있는 숫자를 모두 메모하고, 되돌리기 한 번에 취소된다", async () => {
  const { puzzleForLevel } = await import("../src/puzzle/sudoku/generator.ts");
  const { autoNotes, newGame, undo } = await import("../src/puzzle/sudoku/game.ts");
  const { PEERS } = await import("../src/puzzle/sudoku/rules.ts");
  const p = puzzleForLevel(5, "normal");
  const g = newGame({ id: p.id, level: 5, difficulty: "normal", puzzle: p.puzzle, solution: p.solution });
  const a = autoNotes(g);
  for (let i = 0; i < 81; i += 1) {
    if (p.puzzle[i]) {
      assert.equal(a.notes[i], 0);
      continue;
    }
    // 답 숫자는 언제나 후보에 들어 있고, 이웃에 있는 숫자는 빠진다
    assert.ok(a.notes[i] & (1 << p.solution[i]));
    for (const peer of PEERS[i]) if (p.puzzle[peer]) assert.equal(a.notes[i] & (1 << p.puzzle[peer]), 0);
  }
  assert.equal(a.usedHint, undefined);
  assert.deepEqual(undo(a).notes, g.notes);
});

test("미니 6×6 판: 자동 메모는 1~6만, 숫자 넣기·힌트로 끝까지 풀린다", async () => {
  const { puzzleForLevel } = await import("../src/puzzle/sudoku/generator.ts");
  const { autoNotes, applyHint, findHint, sudokuHintSteps, digitCounts } = await import("../src/puzzle/sudoku/game.ts");
  const p = puzzleForLevel(2, "mini");
  let g = newGame({ id: p.id, level: 2, difficulty: "mini", puzzle: p.puzzle, solution: p.solution });
  assert.equal(g.notes.length, 36);
  const noted = autoNotes(g);
  assert.ok(noted.notes.every((m) => (m & ~0b1111110) === 0), "7~9는 메모하지 않음");
  for (let n = 0; n < 40 && !g.completed; n += 1) {
    const h = findHint(g)!;
    assert.notEqual(h.kind === "place" && h.reason, "answer");
    const steps = sudokuHintSteps(g, h);
    assert.ok(steps.every((s) => !s.text.includes("undefined")));
    g = applyHint(g, h);
  }
  assert.ok(g.completed);
  assert.deepEqual(digitCounts(g).slice(1, 7), [6, 6, 6, 6, 6, 6]);
});
