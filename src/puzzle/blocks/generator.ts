// 블록 채우기 생성기: 판을 무작위로 1~4칸 조각으로 나누고, 그 조각들로 채우는 방법이 하나뿐인 판만 씁니다.
import { createRng, seedFrom, shuffle, type Rng } from "../core/rng.ts";
import { shapeOf, type Shape } from "./rules.ts";
import { countTilings } from "./solver.ts";

export interface BlockPuzzle {
  id: string;
  size: number;
  /** 블록 모양들(아래에 놓이는 순서) */
  shapes: Shape[];
  /** 답: 칸마다 블록 번호 */
  solution: number[];
}

function partition(size: number, rng: Rng): number[][] | null {
  const owner = new Array<number>(size * size).fill(-1);
  const pieces: number[][] = [];
  for (let start = 0; start < size * size; start += 1) {
    if (owner[start] !== -1) continue;
    // 큰 조각을 많이 써야 답이 하나로 좁혀집니다(1칸은 드물게).
    const roll = rng();
    const want = roll < 0.05 ? 1 : roll < 0.2 ? 2 : roll < 0.5 ? 3 : 4;
    const piece = [start];
    owner[start] = pieces.length;
    while (piece.length < want) {
      const around = shuffle(
        piece.flatMap((i) => {
          const r = Math.floor(i / size);
          const c = i % size;
          return [r > 0 ? i - size : -1, r < size - 1 ? i + size : -1, c > 0 ? i - 1 : -1, c < size - 1 ? i + 1 : -1];
        }),
        rng,
      ).filter((j) => j >= 0 && owner[j] === -1);
      if (around.length === 0) break;
      owner[around[0]] = pieces.length;
      piece.push(around[0]);
    }
    pieces.push(piece);
  }
  if (pieces.filter((p) => p.length === 1).length > 1) return null;
  return pieces;
}

export function generateBlocks(seed: string, size: number, tries = 3000): BlockPuzzle {
  const rng = createRng(seedFrom(seed));
  for (let t = 0; t < tries; t += 1) {
    const pieces = partition(size, rng);
    if (!pieces) continue;
    const shapes = pieces.map((p) => shapeOf(p, size));
    if (countTilings(size, shapes, 2) !== 1) continue;
    const solution = new Array<number>(size * size).fill(-1);
    pieces.forEach((p, k) => p.forEach((i) => (solution[i] = k)));
    // 아래 블록 줄은 답 순서가 보이지 않게 섞습니다.
    const order = shuffle(pieces.map((_, k) => k), rng);
    return { id: seed, size, shapes: order.map((k) => shapes[k]), solution: solution.map((k) => order.indexOf(k)) };
  }
  throw new Error(`블록 채우기 문제를 만들지 못했습니다: ${seed}`);
}

export function blockSizeForLevel(level: number): number {
  if (level <= 5) return 4;
  if (level <= 20) return 5;
  return 6;
}

export function blocksForLevel(level: number): BlockPuzzle {
  return generateBlocks(`blocks-${level}`, blockSizeForLevel(level));
}
