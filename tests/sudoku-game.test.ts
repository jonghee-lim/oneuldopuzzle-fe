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
