import { test } from "node:test";
import assert from "node:assert/strict";
import { isZoneSolved, zoneConflicts } from "../src/puzzle/zones/rules.ts";
import { logicGrade, solveZones } from "../src/puzzle/zones/solver.ts";
import { zonesForLevel, zoneSizeForLevel } from "../src/puzzle/zones/generator.ts";
import { newZoneGame, restartZone, setZoneTool, tapZoneCell, undoZone } from "../src/puzzle/zones/game.ts";

test("색깔 구역 퍼즐(쉬움 1~120, 보통·어려움 1~60)은 답이 하나이고 찍지 않고 풀린다", () => {
  for (const [tier, last] of [["easy", 120], ["normal", 60], ["hard", 60]] as const) for (let level = 1; level <= last; level += 1) {
    const p = zonesForLevel(level, tier);
    assert.equal(p.size, zoneSizeForLevel(level, tier));
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
  // 난이도마다 판 크기가 커지고, 쉬움은 예전 레벨과 같은 문제
  assert.deepEqual([zoneSizeForLevel(5, "easy"), zoneSizeForLevel(5, "normal"), zoneSizeForLevel(5, "hard")], [6, 7, 8]);
  assert.equal(zonesForLevel(7, "easy").id, "zones-7");
  assert.notDeepEqual(zonesForLevel(7, "normal").regions, zonesForLevel(7, "hard").regions);
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
