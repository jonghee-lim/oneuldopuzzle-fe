// 휴대폰 화면에서 스도쿠 한 판을 터치로만 끝까지 풀어 봅니다.
// 사용: npm run build && npx vite preview --port 4180 & node tests/e2e/play.cjs [스크린샷 폴더]
const { chromium, devices } = require("playwright");
const assert = require("node:assert/strict");

const BASE = process.env.BASE_URL || "http://localhost:4180";
const shots = process.argv[2];

(async () => {
  // CHROME_PATH가 있으면 그 브라우저를 씁니다(설치된 Playwright 브라우저 버전이 다를 때).
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] } : {});
  const page = await browser.newPage({ ...devices["iPhone 13"] });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  // 첫 화면은 여섯 퍼즐 카드, 스도쿠 카드를 누르면 스도쿠 화면(난이도 고르기)
  await page.goto(BASE);
  await page.getByRole("heading", { name: "어떤 퍼즐을 풀까요?" }).waitFor();
  assert.equal(await page.getByRole("navigation", { name: "퍼즐 고르기" }).getByRole("link").count(), 6);
  if (shots) await page.screenshot({ path: `${shots}/1-home.png`, fullPage: true });
  await page.getByRole("navigation", { name: "퍼즐 고르기" }).getByRole("link", { name: /스도쿠/ }).tap();
  await page.getByRole("heading", { name: "레벨 1" }).waitFor();
  if (shots) await page.screenshot({ path: `${shots}/1b-sudoku.png` });
  // 난이도를 고르면 그 난이도로 문제가 나온다
  await page.getByRole("button", { name: "어려움", exact: true }).tap();
  await page.getByRole("button", { name: "시작하기" }).tap();
  await page.getByText("어려움").first().waitFor();
  // 판을 열어 두기만 하고 돌아오면 '이어 하기'가 아니라 '시작하기'(2026-10-26 '이어 하기 0:03' 신고)
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: "스도쿠 화면으로" }).tap();
  await page.getByRole("button", { name: "시작하기" }).waitFor();
  await page.getByRole("button", { name: "시작하기" }).tap();
  const hard = await page.evaluate(() => JSON.parse(localStorage.getItem("oneuldopuzzle-v1")).state.game);
  assert.equal(hard.difficulty, "hard");
  await page.getByRole("button", { name: "스도쿠 화면으로" }).tap();
  await page.getByRole("button", { name: "쉬움", exact: true }).tap();
  await page.getByRole("button", { name: "시작하기" }).tap();
  await page.getByRole("grid", { name: "스도쿠 판" }).waitFor();

  const game = await page.evaluate(() => JSON.parse(localStorage.getItem("oneuldopuzzle-v1")).state.game);
  const cells = page.getByRole("gridcell");
  const empties = game.puzzle.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);

  // 메모 두 개 적어 보기
  await page.getByRole("button", { name: "메모", exact: true }).tap();
  await cells.nth(empties[0]).tap();
  await page.getByRole("button", { name: "메모 1" }).tap();
  await page.getByRole("button", { name: "메모 2" }).tap();
  await cells.nth(empties[1]).tap();
  if (shots) await page.screenshot({ path: `${shots}/2-memo.png` });
  await page.getByRole("button", { name: "메모 켜짐" }).tap();

  // 틀린 숫자를 넣으면 빨갛게(같은 줄 처음 숫자와 겹치게)
  const target = empties[0];
  const row = Math.floor(target / 9);
  const clash = game.puzzle.slice(row * 9, row * 9 + 9).find(Boolean);
  await cells.nth(target).tap();
  await page.getByRole("button", { name: String(clash), exact: true }).tap();
  if (shots) await page.screenshot({ path: `${shots}/3-conflict.png` });
  await page.getByRole("button", { name: "되돌리기" }).tap();

  // 다시 하기: 확인 창을 거쳐 넣은 숫자·메모가 비워진다
  await cells.nth(empties[2]).tap();
  await page.getByRole("button", { name: String(game.solution[empties[2]]), exact: true }).tap();
  await page.getByRole("button", { name: "다시 하기" }).tap();
  if (shots) await page.screenshot({ path: `${shots}/3b-restart.png` });
  await page.getByRole("dialog").getByRole("button", { name: "다시 하기" }).tap();
  await page.getByRole("dialog").waitFor({ state: "detached" });
  const restarted = await page.evaluate(() => JSON.parse(localStorage.getItem("oneuldopuzzle-v1")).state.game);
  assert.deepEqual(restarted.values, game.puzzle);
  assert.equal(restarted.notes.every((n) => n === 0), true);

  // 나머지를 답대로 채우기
  for (const i of empties) {
    await cells.nth(i).tap();
    await page.getByRole("button", { name: String(game.solution[i]), exact: true }).tap();
  }
  await page.getByRole("heading", { name: "레벨 1 완성!" }).waitFor();
  await page.getByText(/^\+\d+점$/).waitFor();
  if (shots) await page.screenshot({ path: `${shots}/4-clear.png` });
  await page.getByRole("button", { name: "다음 레벨" }).tap();
  await page.getByText("레벨 2").first().waitFor();
  if (shots) await page.screenshot({ path: `${shots}/5-level2.png` });

  // 점수표에 방금 푼 판이 올라간다
  await page.goto(`${BASE}/records`);
  await page.getByRole("heading", { name: "점수표" }).waitFor();
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem("oneuldopuzzle-v1")).state);
  assert.ok(st.score > 0);
  assert.equal(st.stats.easy.cleared, 1);
  // 레벨은 난이도마다 따로: 쉬움만 1레벨 깼고 어려움은 그대로 레벨 1
  assert.deepEqual(st.sudokuCleared, { easy: 1 });
  if (shots) await page.screenshot({ path: `${shots}/5b-records.png`, fullPage: true });

  // 숫자 먼저 고르기
  await page.goto(`${BASE}/settings`);
  await page.getByRole("button", { name: "숫자 먼저 고르기" }).tap();
  if (shots) await page.screenshot({ path: `${shots}/6-settings.png` });
  await page.goto(`${BASE}/play`);
  const g2 = await page.evaluate(() => JSON.parse(localStorage.getItem("oneuldopuzzle-v1")).state.game);
  assert.equal(g2.level, 2);
  const e2 = g2.puzzle.findIndex((v) => !v);
  await page.getByRole("button", { name: String(g2.solution[e2]), exact: true }).tap();
  await page.getByRole("gridcell").nth(e2).tap();
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("oneuldopuzzle-v1")).state.game);
  assert.equal(after.values[e2], g2.solution[e2]);

  assert.deepEqual(errors, []);
  await browser.close();
  console.log("e2e ok");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
