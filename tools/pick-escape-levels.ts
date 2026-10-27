// make-escape-pool.ts가 모은 판(jsonl 여러 개)에서 블록 탈출 레벨 표를 고릅니다.
// 최소 이동 수 3부터 한 수씩 올리며, 수마다 PER_MOVES만큼 레벨을 둡니다(쉬운 쪽은 짧게, 어려운 쪽은 길게).
// 그 수의 판이 모자라면 있는 만큼만 쓰고, 하나도 없는 수가 나오면 표를 끝냅니다. 같은 수에서는 블록이 적은 판부터 씁니다.
// 사용: node --experimental-strip-types tools/pick-escape-levels.ts 결과1.jsonl 결과2.jsonl ... > src/puzzle/escape/table.ts
import { readFileSync } from "node:fs";

/** 최소 이동 수마다 둘 레벨 수 */
const perMoves = (moves: number) => (moves <= 8 ? 3 : moves <= 14 ? 4 : 8);
const byMoves = new Map<number, { board: string; blocks: number }[]>();
const seen = new Set<string>();
for (const file of process.argv.slice(2)) {
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.startsWith("{")) continue;
    const { board, moves, blocks } = JSON.parse(line) as { board: string; moves: number; blocks: number };
    if (seen.has(board)) continue;
    seen.add(board);
    byMoves.set(moves, [...(byMoves.get(moves) ?? []), { board, blocks }]);
  }
}
for (const list of byMoves.values()) list.sort((a, b) => a.blocks - b.blocks || a.board.localeCompare(b.board));

const rows: [string, number][] = [];
for (let moves = 3; byMoves.get(moves)?.length; moves += 1) {
  for (const next of byMoves.get(moves)!.slice(0, perMoves(moves))) rows.push([next.board, moves]);
}
console.log(`// tools/pick-escape-levels.ts가 만든 표입니다. 손으로 고치지 마세요. [판, 최소 이동 수]
export const ESCAPE_TABLE: readonly (readonly [string, number])[] = [
${rows.map(([b, m]) => `  ["${b}", ${m}],`).join("\n")}
];`);
console.error(`레벨 ${rows.length}개 (최소 이동 수 3~${rows.at(-1)?.[1]})`);
