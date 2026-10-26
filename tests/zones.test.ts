import { test } from "node:test";
import assert from "node:assert/strict";
import { isZoneSolved, zoneConflicts } from "../src/puzzle/zones/rules.ts";
import { logicGrade, solveZones } from "../src/puzzle/zones/solver.ts";
import { zonesForLevel, zoneSizeForLevel } from "../src/puzzle/zones/generator.ts";
import { newZoneGame, restartZone, setZoneTool, tapZoneCell, undoZone } from "../src/puzzle/zones/game.ts";

test("레벨 1~120 색깔 구역 퍼즐은 답이 하나이고 찍지 않고 풀린다", () => {
  for (let level = 1; level <= 120; level += 1) {
    const p = zonesForLevel(level);
    assert.equal(p.size, zoneSizeForLevel(level));
    assert.equal(new Set(p.regions).size, p.size, `레벨 ${level} 구역 수`);
    const { count, solution } = solveZones(p.size, p.regions, 2);
    assert.equal(count, 1, `레벨 ${level} 답 개수`);
    assert.deepEqual(solution, p.solution);
    assert.ok(logicGrade(p.size, p.regions) > 0, `레벨 ${level} 논리 풀이`);
    assert.ok(isZoneSolved(p.size, p.regions, p.solution.map((c, r) => r * p.size + c)));
  }
});

test("같은 레벨은 언제나 같은 문제", () => {
  assert.deepEqual(zonesForLevel(7), zonesForLevel(7));
});

test("붙어 있거나 같은 줄·구역의 디저트를 어긋남으로 찾는다", () => {
  const regions = [0, 0, 1, 1, 0, 2, 1, 3, 2, 2, 3, 3, 2, 2, 3, 3];
  assert.deepEqual([...zoneConflicts(4, regions, [0, 5])].sort(), [0, 5]); // 대각선으로 붙음
  assert.deepEqual([...zoneConflicts(4, regions, [0, 2])].sort(), [0, 2]); // 같은 줄
  assert.equal(zoneConflicts(4, regions, [1, 7]).size, 0);
});

test("판 조작: 놓기·X·되돌리기·다시 하기·완성", () => {
  const p = zonesForLevel(1);
  let g = newZoneGame(1, p);
  g = tapZoneCell(g, 0);
  assert.equal(g.cells[0], 2);
  g = tapZoneCell(setZoneTool(g, "cross"), 1);
  assert.equal(g.cells[1], 1);
  g = undoZone(g);
  assert.equal(g.cells[1], 0);
  g = restartZone(g);
  assert.ok(g.cells.every((v) => v === 0));
  assert.equal(g.tool, "cross");
  g = setZoneTool(g, "place");
  for (const [r, c] of p.solution.entries()) g = tapZoneCell(g, r * p.size + c);
  assert.ok(g.solved);
});
