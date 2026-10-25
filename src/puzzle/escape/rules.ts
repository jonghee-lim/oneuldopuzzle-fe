// 블록 탈출: 6×6 판에서 블록을 제 방향(가로 블록은 좌우, 세로 블록은 위아래)으로만 밀어
// 딸기 블록(X)을 오른쪽 출구까지 보냅니다. 판은 36자 문자열로 적습니다('.' 빈칸, 같은 글자가 한 블록).

export const ESCAPE_SIZE = 6;
/** 출구가 있는 줄(위에서 세 번째) */
export const EXIT_ROW = 2;
export const TARGET_ID = "X";

export interface Block {
  id: string;
  row: number;
  col: number;
  length: number;
  horizontal: boolean;
}

export function parseBoard(text: string): Block[] {
  if (text.length !== ESCAPE_SIZE * ESCAPE_SIZE) throw new Error(`블록 탈출 판은 36자여야 합니다(${text.length}자).`);
  const cells = new Map<string, number[]>();
  Array.from(text).forEach((ch, i) => {
    if (ch === ".") return;
    cells.set(ch, [...(cells.get(ch) ?? []), i]);
  });
  const blocks: Block[] = [];
  for (const [id, indexes] of cells) {
    const rows = indexes.map((i) => Math.floor(i / ESCAPE_SIZE));
    const cols = indexes.map((i) => i % ESCAPE_SIZE);
    const horizontal = rows.every((r) => r === rows[0]);
    const vertical = cols.every((c) => c === cols[0]);
    const length = indexes.length;
    const contiguous = horizontal
      ? Math.max(...cols) - Math.min(...cols) === length - 1
      : Math.max(...rows) - Math.min(...rows) === length - 1;
    if (length < 2 || length > 3 || (!horizontal && !vertical) || !contiguous) throw new Error(`블록 ${id} 모양이 올바르지 않습니다.`);
    blocks.push({ id, row: Math.min(...rows), col: Math.min(...cols), length, horizontal });
  }
  return blocks.sort((a, b) => a.id.localeCompare(b.id));
}

export function formatBoard(blocks: readonly Block[]): string {
  const cells = new Array<string>(ESCAPE_SIZE * ESCAPE_SIZE).fill(".");
  for (const b of blocks) for (const i of blockCells(b)) cells[i] = b.id;
  return cells.join("");
}

export function blockCells(b: Block): number[] {
  return Array.from({ length: b.length }, (_, k) =>
    b.horizontal ? b.row * ESCAPE_SIZE + b.col + k : (b.row + k) * ESCAPE_SIZE + b.col,
  );
}

export function occupancy(blocks: readonly Block[]): (string | null)[] {
  const cells = new Array<string | null>(ESCAPE_SIZE * ESCAPE_SIZE).fill(null);
  for (const b of blocks) for (const i of blockCells(b)) cells[i] = b.id;
  return cells;
}

/** 블록이 갈 수 있는 위치(가로 블록은 왼쪽 끝 열, 세로 블록은 위쪽 끝 행)들. 지금 위치는 빼고 돌려줍니다. */
export function reachablePositions(blocks: readonly Block[], id: string): number[] {
  const block = blocks.find((b) => b.id === id);
  if (!block) return [];
  const occ = occupancy(blocks);
  const free = (r: number, c: number) => occ[r * ESCAPE_SIZE + c] === null || occ[r * ESCAPE_SIZE + c] === id;
  const start = block.horizontal ? block.col : block.row;
  const result: number[] = [];
  for (const step of [-1, 1]) {
    for (let pos = start + step; pos >= 0 && pos + block.length <= ESCAPE_SIZE; pos += step) {
      const edge = step < 0 ? pos : pos + block.length - 1;
      const ok = block.horizontal ? free(block.row, edge) : free(edge, block.col);
      if (!ok) break;
      result.push(pos);
    }
  }
  return result.sort((a, b) => a - b);
}

export function moveBlock(blocks: readonly Block[], id: string, position: number): Block[] {
  return blocks.map((b) => (b.id !== id ? b : b.horizontal ? { ...b, col: position } : { ...b, row: position }));
}

export function isEscaped(blocks: readonly Block[]): boolean {
  const target = blocks.find((b) => b.id === TARGET_ID);
  return !!target && target.col + target.length === ESCAPE_SIZE;
}
