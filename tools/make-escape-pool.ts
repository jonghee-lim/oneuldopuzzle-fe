// 블록 탈출 끝없는 레벨용 문제 모음을 만듭니다(2026-10-27). 무작위 판에서 시작해 블록을 하나씩 더하고·빼고·옮겨 보며
// 최소 이동 수가 줄지 않는 쪽으로 키워 갑니다(언덕 오르기). 지나가며 만난 풀리는 판을 최소 이동 수와 함께 한 줄씩 적습니다.
// 사용: node --experimental-strip-types tools/make-escape-pool.ts <씨앗> <시작 판 수> [판마다 바꿔 보기 수] >> 결과.jsonl
// 여러 씨앗으로 나눠 돌린 뒤 tools/pick-escape-levels.ts로 레벨 표를 고릅니다.
import { createRng, seedFrom } from "../src/puzzle/core/rng.ts";
import { ESCAPE_SIZE, EXIT_ROW, TARGET_ID, formatBoard, occupancy, blockCells, type Block } from "../src/puzzle/escape/rules.ts";
import { solveEscape } from "../src/puzzle/escape/solver.ts";

const seed = process.argv[2] ?? "escape-pool";
const starts = Number(process.argv[3] ?? 50);
const steps = Number(process.argv[4] ?? 300);
const rng = createRng(seedFrom(seed));
const ids = "ABCDEFGHIJKLMNOPQRSTUVWYZ";
const seen = new Set<string>();

function randomBlock(blocks: Block[]): Block | null {
  for (let guard = 0; guard < 100; guard += 1) {
    const horizontal = rng() < 0.5;
    const length = rng() < 0.3 ? 3 : 2;
    const row = Math.floor(rng() * (horizontal ? ESCAPE_SIZE : ESCAPE_SIZE - length + 1));
    const col = Math.floor(rng() * (horizontal ? ESCAPE_SIZE - length + 1 : ESCAPE_SIZE));
    // 출구 줄에 가로 블록을 두면 영영 못 나가므로 두지 않습니다.
    if (horizontal && row === EXIT_ROW) continue;
    const used = new Set(blocks.map((b) => b.id));
    const id = [...ids].find((ch) => !used.has(ch));
    if (!id) return null;
    const block = { id, row, col, length, horizontal };
    const occ = occupancy(blocks);
    if (blockCells(block).some((i) => occ[i] !== null)) continue;
    return block;
  }
  return null;
}

/** 블록 글자를 위에서부터 차례로 다시 붙여 같은 판이 같은 글로 적히게 합니다. */
function normalize(blocks: Block[]): string {
  const order = blocks.filter((b) => b.id !== TARGET_ID).sort((a, b) => a.row * 6 + a.col - (b.row * 6 + b.col));
  return formatBoard([...blocks.filter((b) => b.id === TARGET_ID), ...order.map((b, k) => ({ ...b, id: ids[k] }))]);
}

function mutate(blocks: Block[]): Block[] {
  const others = blocks.filter((b) => b.id !== TARGET_ID);
  const roll = rng();
  if (roll < 0.4 || others.length < 6) {
    const add = randomBlock(blocks);
    return add ? [...blocks, add] : blocks;
  }
  const victim = others[Math.floor(rng() * others.length)];
  const rest = blocks.filter((b) => b !== victim);
  if (roll < 0.7) return rest;
  const add = randomBlock(rest);
  return add ? [...rest, add] : rest;
}

for (let s = 0; s < starts; s += 1) {
  let blocks: Block[] = [{ id: TARGET_ID, row: EXIT_ROW, col: Math.floor(rng() * 2), length: 2, horizontal: true }];
  for (let k = 0; k < 8; k += 1) {
    const add = randomBlock(blocks);
    if (add) blocks.push(add);
  }
  let score = solveEscape(formatBoard(blocks), 80_000)?.minMoves ?? -1;
  for (let step = 0; step < steps; step += 1) {
    const next = mutate(blocks);
    const board = normalize(next);
    const solved = solveEscape(board, 80_000);
    if (!solved) continue;
    if (!seen.has(board) && solved.minMoves >= 3) {
      seen.add(board);
      console.log(JSON.stringify({ board, moves: solved.minMoves, blocks: next.length }));
    }
    if (solved.minMoves >= score) {
      blocks = next;
      score = solved.minMoves;
    }
  }
}
