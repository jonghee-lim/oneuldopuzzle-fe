// 블록 탈출 스페셜 문제 후보를 만듭니다. 무작위 판을 많이 만들어 검사기로 풀어 보고, 최소 이동 수가 큰 판을 골라 출력합니다.
// 사용: npm run make:escape -- <씨앗> <원하는 최소 이동 수> [시도 수] [최대 이동 수]
import { createRng, seedFrom } from "../src/puzzle/core/rng.ts";
import { ESCAPE_SIZE, EXIT_ROW, TARGET_ID, formatBoard, occupancy, blockCells, type Block } from "../src/puzzle/escape/rules.ts";
import { solveEscape } from "../src/puzzle/escape/solver.ts";

const seed = process.argv[2] ?? "escape";
const want = Number(process.argv[3] ?? 10);
const tries = Number(process.argv[4] ?? 4000);
const most = Number(process.argv[5] ?? Infinity);
const rng = createRng(seedFrom(seed));
const ids = "ABCDEFGHIJKLMNOPQRSTUVWYZ";

let best: { board: string; moves: number } | null = null;
for (let t = 0; t < tries; t += 1) {
  const blocks: Block[] = [{ id: TARGET_ID, row: EXIT_ROW, col: Math.floor(rng() * 2), length: 2, horizontal: true }];
  const count = 8 + Math.floor(rng() * 6);
  for (let k = 0, guard = 0; k < count && guard < 200; guard += 1) {
    const horizontal = rng() < 0.5;
    const length = rng() < 0.3 ? 3 : 2;
    const row = Math.floor(rng() * (horizontal ? ESCAPE_SIZE : ESCAPE_SIZE - length + 1));
    const col = Math.floor(rng() * (horizontal ? ESCAPE_SIZE - length + 1 : ESCAPE_SIZE));
    // 출구 줄에 가로 블록을 두면 영영 못 나가므로 두지 않습니다.
    if (horizontal && row === EXIT_ROW) continue;
    const block = { id: ids[k], row, col, length, horizontal };
    const occ = occupancy(blocks);
    if (blockCells(block).some((i) => occ[i] !== null)) continue;
    blocks.push(block);
    k += 1;
  }
  const board = formatBoard(blocks);
  const solved = solveEscape(board);
  if (!solved || solved.minMoves > most) continue;
  if (!best || solved.minMoves > best.moves) best = { board, moves: solved.minMoves };
  if (solved.minMoves >= want) break;
}
console.log(JSON.stringify(best));
