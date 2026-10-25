// 스페셜 스테이지 체험: 시작 화면에서 들어가 노노그램·블록 탈출 1단계를 터치로만 끝까지 풉니다.
// 사용: node --experimental-strip-types tests/e2e/special.mjs [스크린샷 폴더]  (BASE_URL, CHROME_PATH 선택)
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { NONOGRAMS } from "../../src/puzzle/nonogram/puzzles.ts";
import { pictureGrid } from "../../src/puzzle/nonogram/rules.ts";
import { ESCAPES } from "../../src/puzzle/escape/puzzles.ts";
import { solveEscape } from "../../src/puzzle/escape/solver.ts";
import { ESCAPE_SIZE, parseBoard } from "../../src/puzzle/escape/rules.ts";

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

assert.deepEqual(errors, []);
await browser.close();
console.log("special e2e ok");
