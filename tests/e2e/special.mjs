// 퍼즐 모음: 시작 화면에서 들어가 노노그램·블록 탈출 1단계와 색깔 구역·슬라이딩·블록 채우기 레벨 1을 터치로만 끝까지 풉니다.
// 사용: node --experimental-strip-types tests/e2e/special.mjs [스크린샷 폴더]  (BASE_URL, CHROME_PATH 선택)
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { NONOGRAMS } from "../../src/puzzle/nonogram/puzzles.ts";
import { pictureGrid } from "../../src/puzzle/nonogram/rules.ts";
import { ESCAPES } from "../../src/puzzle/escape/puzzles.ts";
import { solveEscape } from "../../src/puzzle/escape/solver.ts";
import { ESCAPE_SIZE, parseBoard } from "../../src/puzzle/escape/rules.ts";
import { slideFrom } from "../../src/puzzle/sliding/rules.ts";
import { minSlides } from "../../src/puzzle/sliding/solver.ts";

const { chromium, devices } = createRequire(import.meta.url)("playwright");
const BASE = process.env.BASE_URL || "http://localhost:4180";
const shots = process.argv[2];

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] } : {});
const page = await browser.newPage({ ...devices["iPhone 13"] });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

// 노노그램
await page.goto(BASE);
if (shots) await page.screenshot({ path: `${shots}/s0-home.png`, fullPage: true });
await page.getByRole("link", { name: /노노그램/ }).tap();
await page.getByRole("grid", { name: /노노그램 판/ }).waitFor();
const grid = pictureGrid(NONOGRAMS[0]);
const cells = page.getByRole("gridcell");
await page.getByRole("button", { name: "X 표시" }).tap();
await cells.nth(grid.indexOf(0)).tap();
await page.getByRole("button", { name: "칠하기" }).tap();
for (let i = 0; i < grid.length; i += 1) if (grid[i] === 1) await cells.nth(i).tap();
await page.getByRole("heading", { name: `${NONOGRAMS[0].name} 완성!` }).waitFor();
if (shots) await page.screenshot({ path: `${shots}/s1-nonogram.png` });
await page.getByRole("button", { name: "다음 단계" }).tap();
await page.getByRole("grid", { name: "노노그램 판 10×10" }).waitFor();
if (shots) await page.screenshot({ path: `${shots}/s2-nonogram10.png` });

// 블록 탈출
await page.goto(BASE);
await page.getByRole("link", { name: /블록 탈출/ }).tap();
await page.getByRole("grid", { name: "블록 탈출 판" }).waitFor();
const solved = solveEscape(ESCAPES[0].board);
let blocks = parseBoard(ESCAPES[0].board);
for (const [id, pos] of solved.moves) {
  await page.getByRole("button", { name: new RegExp(`^${id === "X" ? "딸기 블록" : `블록 ${id}`},`) }).tap();
  const b = blocks.find((x) => x.id === id);
  const cur = b.horizontal ? b.col : b.row;
  const edge = pos > cur ? pos + b.length - 1 : pos;
  const index = b.horizontal ? b.row * ESCAPE_SIZE + edge : edge * ESCAPE_SIZE + b.col;
  if (shots && id === solved.moves[0][0]) await page.screenshot({ path: `${shots}/s3-escape-select.png` });
  await page.getByRole("gridcell").nth(index).tap();
  blocks = blocks.map((x) => (x.id !== id ? x : x.horizontal ? { ...x, col: pos } : { ...x, row: pos }));
}
await page.getByRole("heading", { name: "탈출 성공!" }).waitFor();
if (shots) await page.screenshot({ path: `${shots}/s4-escape-clear.png` });

// 색깔 구역: 홈 타일에서 들어가 답 자리를 눌러 완성하고 다음 레벨로
await page.goto(BASE);
await page.getByRole("link", { name: /색깔 구역/ }).tap();
await page.getByRole("grid", { name: /색깔 구역 판/ }).waitFor();
const zone = await page.evaluate(() => JSON.parse(localStorage.getItem("oneuldopuzzle-v1")).state.zoneGame);
const zc = page.getByRole("gridcell");
// 붙어 있는 두 자리에 놓으면 겹침 안내가 나오고 되돌리기로 지운다
const first = zone.puzzle.solution[0];
await zc.nth(first).tap();
await zc.nth(zone.puzzle.size + first).tap();
await page.getByText("같은 줄·구역에 있거나 붙어 있는 마카롱이 있어요.").waitFor();
await page.getByRole("button", { name: "되돌리기" }).tap();
if (shots) await page.screenshot({ path: `${shots}/s5-zones.png` });
for (const [r, c] of zone.puzzle.solution.entries()) if (r > 0) await zc.nth(r * zone.puzzle.size + c).tap();
await page.getByRole("heading", { name: "레벨 1 완성!" }).waitFor();
if (shots) await page.screenshot({ path: `${shots}/s6-zones-clear.png` });
await page.getByRole("button", { name: "다음 레벨" }).tap();
await page.getByRole("heading", { name: "레벨 2" }).waitFor();

// 슬라이딩: 최소 수 표를 따라 한 칸씩 줄여 가며 누르면 최소 수로 완성
await page.goto(BASE);
await page.getByRole("link", { name: /슬라이딩/ }).tap();
await page.getByRole("grid", { name: /슬라이딩 판/ }).waitFor();
const slide = await page.evaluate(() => JSON.parse(localStorage.getItem("oneuldopuzzle-v1")).state.slideGame);
let board = slide.board;
const sc = page.getByRole("gridcell");
if (shots) await page.screenshot({ path: `${shots}/s9-sliding.png` });
while (minSlides(board, 3) > 0) {
  const d = minSlides(board, 3);
  const i = board.findIndex((_, k) => {
    const n = slideFrom(board, 3, k);
    return n && minSlides(n, 3) === d - 1;
  });
  await sc.nth(i).tap();
  board = slideFrom(board, 3, i);
}
await page.getByRole("heading", { name: "레벨 1 완성!" }).waitFor();
await page.getByText("최소 수 +6").waitFor();
if (shots) await page.screenshot({ path: `${shots}/s10-sliding-clear.png` });

// 블록 채우기: 블록을 고르고 답의 기준 칸을 누르기, 엉뚱한 자리는 막힘 안내
await page.goto(BASE);
await page.getByRole("link", { name: /블록 채우기/ }).tap();
await page.getByRole("grid", { name: /블록 채우기 판/ }).waitFor();
const bg = await page.evaluate(() => JSON.parse(localStorage.getItem("oneuldopuzzle-v1")).state.blockGame);
const bc = page.getByRole("gridcell");
const anchors = bg.puzzle.shapes.map((_, k) => bg.puzzle.solution.indexOf(k));
if (shots) await page.screenshot({ path: `${shots}/s11-blocks.png` });
for (let k = 0; k < anchors.length; k += 1) {
  const chip = page.getByRole("button", { name: new RegExp(`^블록 ${k + 1},`) });
  if ((await chip.getAttribute("aria-pressed")) !== "true") await chip.tap();
  await bc.nth(anchors[k]).tap();
}
await page.getByRole("heading", { name: "레벨 1 완성!" }).waitFor();
if (shots) await page.screenshot({ path: `${shots}/s12-blocks-clear.png` });

// 점수표: 스페셜·보너스 기록
await page.goto(`${BASE}/records`);
const st = await page.evaluate(() => JSON.parse(localStorage.getItem("oneuldopuzzle-v1")).state);
assert.equal(st.zoneCleared, 1);
assert.equal(st.slideCleared, 1);
assert.equal(st.blockCleared, 1);
assert.deepEqual(st.nonogramCleared, [0]);
assert.ok(st.escapeBest[0] >= ESCAPES[0].minMoves);
assert.ok(st.score >= 250);
if (shots) await page.screenshot({ path: `${shots}/s7-records.png`, fullPage: true });
await page.goto(BASE);
if (shots) await page.screenshot({ path: `${shots}/s8-home-after.png`, fullPage: true });

assert.deepEqual(errors, []);
await browser.close();
console.log("special e2e ok");
