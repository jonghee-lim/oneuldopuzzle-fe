// 오늘의 퍼즐: 첫 화면 띠에서 세 판을 차례로 열어 힌트 버튼만으로 풀고, 힌트 보상과 연속 출석을 확인합니다.
// 사용: node tests/e2e/daily.mjs [스크린샷 폴더]  (BASE_URL, CHROME_PATH 선택)
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const { chromium, devices } = createRequire(import.meta.url)("playwright");
const BASE = process.env.BASE_URL || "http://localhost:4180";
const shots = process.argv[2];

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] } : {});
const page = await browser.newPage({ ...devices["iPhone 13"] });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem("oneuldopuzzle-v1") ?? "{}").state ?? {});

await page.goto(BASE);
await page.getByRole("heading", { name: /오늘의 퍼즐/ }).waitFor();
if (shots) await page.screenshot({ path: `${shots}/d0-home.png`, fullPage: true });

// 처음 힌트는 3개. 스도쿠에서 하나 쓰면 2개
await page.getByRole("link", { name: /^오늘의 퍼즐 스도쿠/ }).tap();
await page.getByRole("heading", { name: "오늘의 퍼즐" }).waitFor();
await page.getByRole("button", { name: "힌트 3" }).tap();
await page.getByRole("button", { name: "힌트 2" }).waitFor();
await page.getByRole("alert").or(page.locator(".MuiSnackbarContent-message")).first().waitFor();
if (shots) await page.screenshot({ path: `${shots}/d1-sudoku-hint.png` });
const s1 = await state();
assert.equal(s1.hints, 2);
assert.equal(s1.dailySudoku.usedHint, true);
assert.equal(s1.dailySudoku.values.filter(Boolean).length, s1.dailySudoku.puzzle.filter(Boolean).length + 1);

// 나머지 판은 힌트를 넉넉히 넣어 두고 힌트 버튼만으로 끝까지 풉니다.
await page.evaluate(() => {
  const saved = JSON.parse(localStorage.getItem("oneuldopuzzle-v1"));
  saved.state.hints = 500;
  localStorage.setItem("oneuldopuzzle-v1", JSON.stringify(saved));
});
await page.reload();
async function solveWithHints() {
  const dialog = page.getByRole("dialog");
  for (let n = 0; n < 200 && !(await dialog.isVisible()); n += 1) await page.getByRole("button", { name: /^힌트 \d+$/ }).tap();
  await dialog.waitFor();
}
await solveWithHints();
await page.getByRole("heading", { name: "오늘의 퍼즐 완성!" }).waitFor();
assert.match(await page.getByRole("dialog").innerText(), /힌트 \+1개/);
if (shots) await page.screenshot({ path: `${shots}/d2-sudoku-clear.png` });

// 다음 오늘의 퍼즐 → 색깔 구역 → 세 번째 판
await page.getByRole("button", { name: /다음 오늘의 퍼즐/ }).tap();
await page.getByRole("grid", { name: /색깔 구역 판/ }).waitFor();
await solveWithHints();
await page.getByRole("button", { name: /다음 오늘의 퍼즐/ }).tap();
await page.getByRole("heading", { name: "오늘의 퍼즐" }).waitFor();
await solveWithHints();
await page.getByRole("heading", { name: "오늘의 퍼즐 모두 완성!" }).waitFor();
assert.match(await page.getByRole("dialog").innerText(), /힌트 \+3개 · 연속 1일/);
if (shots) await page.screenshot({ path: `${shots}/d3-all-clear.png` });

const end = await state();
assert.equal(end.dailyDone.length, 3);
assert.equal(end.dailyDays.length, 1);
// 오늘의 퍼즐은 레벨 진행과 따로
assert.deepEqual(end.sudokuCleared ?? {}, {});
assert.equal(end.zoneCleared ?? 0, 0);

await page.getByRole("button", { name: "처음 화면" }).tap();
await page.getByText("오늘 몫을 다 풀었어요. 내일 또 만나요!").waitFor();
await page.getByText("연속 1일").waitFor();
if (shots) await page.screenshot({ path: `${shots}/d4-home-done.png`, fullPage: true });

assert.deepEqual(errors, []);
await browser.close();
console.log("daily e2e ok");
