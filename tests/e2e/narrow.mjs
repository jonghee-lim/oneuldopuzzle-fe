// 좁은 화면(화면 확대를 켠 iPhone은 320px): 어느 화면도 가로로 넘치지 않는지 봅니다.
// 넘치면 iOS가 화면 전체를 줄였다 키워 판 크기가 바뀌어 보입니다(2026-10-27 신고).
// 사용: node tests/e2e/narrow.mjs [스크린샷 폴더]  (BASE_URL, CHROME_PATH 선택)
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const { chromium, devices } = createRequire(import.meta.url)("playwright");
const BASE = process.env.BASE_URL || "http://localhost:4180";
const shots = process.argv[2];

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] } : {});
const ROUTES = ["/", "/sudoku", "/play", "/play?daily", "/zones", "/blocks", "/sliding", "/special/nonogram", "/special/escape", "/levels/zones", "/levels/sliding", "/levels/escape", "/records", "/settings", "/apps", "/guide", "/privacy"];
const problems = [];

for (const width of [320, 360]) {
  const page = await browser.newPage({ ...devices["iPhone 13"], viewport: { width, height: 640 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  // 하는 법(처음 열 때 저절로 뜸)은 따로 확인하고, 여기서는 이미 본 것으로 둡니다.
  await page.addInitScript(() => {
    if (!localStorage.getItem("oneuldopuzzle-guide-seen")) localStorage.setItem("oneuldopuzzle-guide-seen", JSON.stringify(["sudoku", "zones", "nonogram", "escape", "sliding", "blocks"]));
  });
  // 화면 밖으로 나간 글자·아이콘(자식 없는 요소)을 찾습니다. 화면 너비가 늘었는지(iOS가 줄여 보이는 경우)도 봅니다.
  const check = async (where) => {
    const found = await page.evaluate((W) => {
      // 화면보다 좁은 상자 안에서 잘려 보이지 않는 것(진행 막대, 숨긴 스위치 입력 칸)은 넘친 것이 아닙니다.
      const clipped = (e) => {
        for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
          const o = getComputedStyle(a).overflowX;
          if ((o === "hidden" || o === "clip") && a.getBoundingClientRect().width < W - 1) return true;
        }
        return getComputedStyle(e).opacity === "0";
      };
      const out = [...document.querySelectorAll("body *")]
        .filter((e) => e.children.length === 0 && e.getClientRects().length > 0)
        .filter((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && (r.right > W + 0.5 || r.left < -0.5) && !clipped(e);
        })
        .map((e) => `${e.tagName}:${(e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 20)}`);
      if (window.innerWidth !== W) out.push(`화면 너비 ${window.innerWidth}`);
      // 판은 정사각형이고 칸 높이가 모두 같아야 합니다(iOS에서 줄마다 칸 높이가 달라진 신고, 2026-10-27).
      for (const grid of document.querySelectorAll("[role=grid]")) {
        const b = grid.getBoundingClientRect();
        const hs = [...grid.querySelectorAll("[role=gridcell]")].map((c) => c.getBoundingClientRect().height);
        if (Math.abs(b.width - b.height) > 1.5 || Math.max(...hs) - Math.min(...hs) > 1.5) out.push(`판 모양 ${Math.round(b.width)}×${Math.round(b.height)}`);
      }
      return out;
    }, width);
    if (found.length) problems.push(`${width}px ${where}: ${found.slice(0, 5).join(", ")}`);
  };
  for (const route of ROUTES) {
    await page.goto(`${BASE}${route}`);
    await page.waitForTimeout(400);
    await check(route);
    const memo = page.getByRole("button", { name: /^메모( 켜짐)?$/ });
    if (await memo.count()) {
      await memo.tap();
      await check(`${route} 메모 켬`);
      await memo.tap();
    }
    const hint = page.getByRole("button", { name: /^힌트 \d+$/ });
    if (await hint.count()) {
      await hint.tap();
      await page.waitForTimeout(400);
      await check(`${route} 힌트`);
      if (shots && width === 320) await page.screenshot({ path: `${shots}/n-${width}${route.replace(/[/?]/g, "_")}.png` });
    }
    // 하는 법: 단계마다 예시 판이 화면 안에 들어오는지
    const help = page.getByRole("button", { name: "하는 법" });
    if (await help.count()) {
      await help.tap();
      for (let step = 1; step < 6; step += 1) {
        await page.waitForTimeout(250);
        await check(`${route} 하는 법 ${step}`);
        if (shots && width === 320) await page.screenshot({ path: `${shots}/g-${width}${route.replace(/[/?]/g, "_")}-${step}.png` });
        const next = page.getByRole("button", { name: "다음" });
        if (!(await next.count())) break;
        await next.tap();
      }
      await page.getByRole("button", { name: "시작하기" }).tap();
    }
  }
  assert.deepEqual(errors, []);
  await page.close();
}
await browser.close();
assert.deepEqual(problems, []);
console.log("narrow e2e ok");
