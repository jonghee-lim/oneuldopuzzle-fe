import { test } from "node:test";
import assert from "node:assert/strict";
import { checkSudoku } from "../src/puzzle/sudoku/checker.ts";
import { difficultyForLevel, generateSudoku, puzzleForLevel } from "../src/puzzle/sudoku/generator.ts";
import { solveWithSingles } from "../src/puzzle/sudoku/logic.ts";
import { TECHNIQUE_GRADE, rateSudoku, solveSteps, type Technique } from "../src/puzzle/sudoku/techniques.ts";
import { findConflicts, formatGrid, parseGrid } from "../src/puzzle/sudoku/rules.ts";

// 잘 알려진 답이 하나인 문제
const KNOWN = "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
const KNOWN_SOLUTION = "534678912672195348198342567859761423426853791713924856961537284287419635345286179";

test("검사기: 답이 하나인 문제를 통과시키고 답을 찾는다", () => {
  const result = checkSudoku(parseGrid(KNOWN));
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(formatGrid(result.solution), KNOWN_SOLUTION);
});

test("검사기: 답이 여러 개인 문제를 거른다", () => {
  const grid = parseGrid(KNOWN);
  // 단서를 많이 지우면 답이 여러 개가 됩니다.
  for (let i = 0; i < 81; i += 2) grid[i] = 0;
  assert.deepEqual(checkSudoku(grid), { ok: false, reason: "multiple-solutions" });
  assert.deepEqual(checkSudoku(new Array(81).fill(0)), { ok: false, reason: "multiple-solutions" });
});

test("검사기: 처음 숫자가 겹치거나 풀 수 없는 문제를 거른다", () => {
  const clash = parseGrid(KNOWN);
  clash[2] = 5; // 첫 줄에 5가 두 번
  assert.deepEqual(checkSudoku(clash), { ok: false, reason: "conflict" });

  // 겹치지는 않지만 답이 없는 판: 첫 칸에 들어갈 숫자가 없음
  const stuck = new Array(81).fill(0);
  [1, 2, 3, 4, 5, 6, 7, 8].forEach((d, k) => (stuck[k + 1] = d));
  stuck[9 * 4] = 9;
  assert.deepEqual(checkSudoku(stuck), { ok: false, reason: "no-solution" });
});

test("검사기: 모양이 틀린 판과 기대한 답과 다른 경우를 거른다", () => {
  assert.deepEqual(checkSudoku([1, 2, 3]), { ok: false, reason: "shape" });
  const wrong = parseGrid(KNOWN_SOLUTION);
  [wrong[0], wrong[1]] = [wrong[1], wrong[0]];
  assert.deepEqual(checkSudoku(parseGrid(KNOWN), wrong), { ok: false, reason: "solution-mismatch" });
});

test("생성기: 같은 씨앗이면 같은 문제", () => {
  assert.deepEqual(generateSudoku("abc", "normal").puzzle, generateSudoku("abc", "normal").puzzle);
  assert.notDeepEqual(generateSudoku("abc", "normal").puzzle, generateSudoku("abd", "normal").puzzle);
});

test("생성기: 모든 난이도에서 답이 하나이고 처음 숫자가 답과 일치한다", () => {
  for (const difficulty of ["easy", "normal", "hard", "expert"] as const) {
    for (let n = 0; n < 5; n += 1) {
      const p = generateSudoku(`t-${n}`, difficulty);
      const check = checkSudoku(p.puzzle, p.solution);
      assert.equal(check.ok, true, `${difficulty} ${n}`);
      assert.equal(findConflicts(p.solution).size, 0);
      p.puzzle.forEach((v, i) => v && assert.equal(v, p.solution[i]));
    }
  }
});

test("생성기: 쉬움·보통은 단서 찾기만으로, 어려움은 한 줄 몰림·짝 숫자가, 아주 어려움은 고급 기술이 꼭 필요하고 모두 찍지 않고 풀린다", () => {
  for (let n = 0; n < 5; n += 1) {
    assert.equal(solveWithSingles(generateSudoku(`s-${n}`, "easy").puzzle).solved, true);
    assert.equal(solveWithSingles(generateSudoku(`s-${n}`, "normal").puzzle).solved, true);
    const hard = rateSudoku(generateSudoku(`s-${n}`, "hard").puzzle);
    assert.deepEqual([hard.solved, hard.grade], [true, 2], `hard ${n}`);
    const expert = rateSudoku(generateSudoku(`s-${n}`, "expert").puzzle);
    assert.deepEqual([expert.solved, expert.grade], [true, 3], `expert ${n}`);
  }
});

test("풀이 기술: 넣는 숫자는 답과 같고, 지우는 후보는 답이 아니다(여러 판에서 모든 기술이 한 번씩은 나온다)", () => {
  const seen = new Set<Technique>();
  for (let n = 0; n < 30; n += 1) {
    const p = generateSudoku(`tech-${n}`, n % 2 ? "expert" : "hard");
    const { solved, steps } = solveSteps(p.puzzle);
    assert.ok(solved);
    for (const step of steps) {
      seen.add(step.technique);
      if (step.place) assert.equal(step.place.digit, p.solution[step.place.index], step.technique);
      for (const e of step.eliminate) assert.notEqual(e.digit, p.solution[e.index], `${step.technique}가 답을 지움`);
    }
  }
  for (const t of ["nakedSingle", "hiddenSingle", "pointing", "claiming", "nakedPair", "hiddenPair", "xWing"] as Technique[]) assert.ok(seen.has(t), `${t}가 나와야 함`);
  assert.ok([...seen].some((t) => TECHNIQUE_GRADE[t] === 3));
});

test("풀이 기술: 단계를 낮추면 고급 기술이 필요한 판은 못 푼다", () => {
  const p = generateSudoku("tech-cap", "expert");
  assert.equal(rateSudoku(p.puzzle, 2).solved, false);
  assert.equal(rateSudoku(p.puzzle, 3).solved, true);
});

test("레벨 난이도 표", () => {
  assert.equal(difficultyForLevel(1), "easy");
  assert.equal(difficultyForLevel(11), "normal");
  assert.equal(difficultyForLevel(41), "hard");
  assert.equal(difficultyForLevel(50), "expert");
  assert.equal(puzzleForLevel(3).id, "sudoku-level-3");
});

test("미니 6×6: 상자는 가로 3 × 세로 2, 답이 하나이고 단서 찾기만으로 풀린다", async () => {
  const { MINI, shapeOf, findConflicts: conflicts } = await import("../src/puzzle/sudoku/rules.ts");
  assert.equal(MINI.units.length, 18);
  assert.deepEqual([...MINI.units[12]], [0, 1, 2, 6, 7, 8]);
  assert.deepEqual([...MINI.units[13]], [3, 4, 5, 9, 10, 11]);
  assert.equal(MINI.peers[0].length, 12);
  for (let n = 0; n < 20; n += 1) {
    const p = generateSudoku(`mini-${n}`, "mini");
    assert.equal(p.puzzle.length, 36);
    assert.equal(shapeOf(p.puzzle), MINI);
    assert.equal(checkSudoku(p.puzzle, p.solution).ok, true);
    assert.equal(conflicts(p.solution).size, 0);
    assert.ok(p.solution.every((v) => v >= 1 && v <= 6));
    assert.equal(solveWithSingles(p.puzzle).solved, true);
    assert.deepEqual(rateSudoku(p.puzzle).grade, 1);
  }
  assert.equal(puzzleForLevel(1, "mini").puzzle.length, 36);
});
