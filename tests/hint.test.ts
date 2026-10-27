import { test } from "node:test";
import assert from "node:assert/strict";
import { puzzleForLevel } from "../src/puzzle/sudoku/generator.ts";
import { applyHint, findHint, newGame, tapCell, tapNumber } from "../src/puzzle/sudoku/game.ts";
import { zonesForLevel } from "../src/puzzle/zones/generator.ts";
import { applyZoneHint, findZoneHint, newZoneGame, tapZoneCell } from "../src/puzzle/zones/game.ts";
import { blocksForLevel } from "../src/puzzle/blocks/generator.ts";
import { applyBlockHint, canPlace, findBlockHint, newBlockGame, solutionAnchors, tapBlockCell } from "../src/puzzle/blocks/game.ts";
import { slideForLevel } from "../src/puzzle/sliding/generator.ts";
import { slideHint } from "../src/puzzle/sliding/hint.ts";
import { isSolved, slideFrom } from "../src/puzzle/sliding/rules.ts";
import { NONOGRAMS } from "../src/puzzle/nonogram/puzzles.ts";
import { applyNonogramHint, findNonogramHint, newNonogramGame, tapNonogramCell } from "../src/puzzle/nonogram/game.ts";
import { ESCAPES } from "../src/puzzle/escape/puzzles.ts";
import { applyEscapeHint, findEscapeHint, newEscapeGame } from "../src/puzzle/escape/game.ts";

/** 힌트만 계속 눌러서 끝까지 풀리는지(힌트가 언제나 앞으로 나아가는지) */
function hintsSolve<G>(game: G, find: (g: G) => unknown, apply: (g: G, h: never) => G, done: (g: G) => boolean, limit = 400): G {
  for (let n = 0; n < limit && !done(game); n += 1) {
    const hint = find(game);
    assert.ok(hint, "힌트가 있어야 함");
    game = apply(game, hint as never);
  }
  assert.ok(done(game), "힌트만으로 다 풀려야 함");
  return game;
}

test("스도쿠 힌트: 쉬움·보통은 단서만으로 끝까지, 힌트를 쓰면 도움 없이 점수 없음", () => {
  for (const [level, difficulty] of [[1, "easy"], [12, "normal"]] as const) {
    const p = puzzleForLevel(level, difficulty);
    const start = newGame({ id: p.id, level, difficulty: p.difficulty, puzzle: p.puzzle, solution: p.solution });
    let reasons = new Set<string>();
    const end = hintsSolve(
      start,
      (g) => {
        const h = findHint(g);
        if (h?.kind === "place") reasons.add(h.reason);
        return h;
      },
      applyHint,
      (g) => g.completed,
    );
    assert.equal(end.usedHint, true);
    assert.ok(!reasons.has("answer"), `${difficulty}는 답을 그냥 알려 주지 않음`);
    reasons = new Set();
  }
});

test("스도쿠 힌트: 틀린 숫자가 있으면 그 칸부터 비운다", () => {
  const p = puzzleForLevel(1, "easy");
  let g = newGame({ id: p.id, level: 1, difficulty: "easy", puzzle: p.puzzle, solution: p.solution });
  const empty = p.puzzle.findIndex((v) => v === 0);
  const wrongDigit = (p.solution[empty] % 9) + 1;
  g = tapNumber(tapCell(g, empty, "cell-first"), wrongDigit, "cell-first");
  const hint = findHint(g);
  assert.deepEqual(hint, { kind: "wrong", index: empty });
  g = applyHint(g, hint!);
  assert.equal(g.values[empty], 0);
  assert.equal(g.selected, empty);
});

test("색깔 구역 힌트: 잘못 놓은 마카롱을 먼저 빼고, 끝까지 풀린다", () => {
  for (const level of [1, 5, 20, 40]) {
    let g = newZoneGame(level, zonesForLevel(level));
    const { solution } = g.puzzle;
    const wrongCell = solution[0] === 0 ? 1 : 0;
    g = tapZoneCell(g, wrongCell);
    assert.deepEqual(findZoneHint(g), { index: wrongCell, remove: true });
    hintsSolve(g, findZoneHint, applyZoneHint, (x) => x.solved);
  }
});

test("블록 채우기 힌트: 잘못 놓은 블록을 먼저 빼고, 끝까지 풀린다", () => {
  for (const level of [1, 8, 25]) {
    let g = newBlockGame(level, blocksForLevel(level));
    const piece = g.selected!;
    const right = solutionAnchors(g.puzzle)[piece];
    // 고른 블록을 정답이 아닌, 놓을 수 있는 첫 자리에 놓아 본다
    const wrong = Array.from({ length: g.puzzle.size ** 2 }, (_, i) => i).find((i) => i !== right && canPlace(g, i));
    if (wrong === undefined) continue;
    g = tapBlockCell(g, wrong).game;
    assert.deepEqual(findBlockHint(g), { piece, anchor: wrong, remove: true });
    hintsSolve(g, findBlockHint, applyBlockHint, (x) => x.solved);
  }
});

test("슬라이딩 힌트: 3×3은 최소 수 그대로, 4×4도 맞춘 판까지 간다", () => {
  for (const level of [1, 9, 15, 16, 60]) {
    const p = slideForLevel(level);
    let board = p.board;
    let moves = 0;
    while (!isSolved(board) && moves < 300) {
      const i = slideHint(board, p.size);
      assert.notEqual(i, null);
      board = slideFrom(board, p.size, i!)!;
      moves += 1;
    }
    assert.ok(isSolved(board));
    if (p.minMoves !== null) assert.equal(moves, p.minMoves);
  }
});

test("노노그램·블록 탈출 힌트: 끝까지 풀린다", () => {
  for (const pic of NONOGRAMS) {
    let g = newNonogramGame(pic);
    const blank = g.solution.findIndex((v) => v === 0);
    g = tapNonogramCell(g, blank);
    assert.deepEqual(findNonogramHint(g), { index: blank, remove: true });
    hintsSolve(g, findNonogramHint, applyNonogramHint, (x) => x.solved);
  }
  for (const e of ESCAPES) {
    const end = hintsSolve(newEscapeGame(e.board), findEscapeHint, applyEscapeHint, (x) => x.escaped);
    assert.equal(end.moves, e.minMoves);
  }
});
