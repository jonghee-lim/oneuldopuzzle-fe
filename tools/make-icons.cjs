// 앱 아이콘·시작 화면 그림을 assets/icon-source.svg 하나에서 만듭니다(2026-10-27 디저트 → 스도쿠 칸).
// 사용: node tools/make-icons.cjs && npx capacitor-assets generate --android --ios --iconBackgroundColor "#FBF7F2" --iconBackgroundColorDark "#FBF7F2" --splashBackgroundColor "#FBF7F2" --splashBackgroundColorDark "#FBF7F2"
const { chromium } = require("playwright");
const fs = require("fs");
const svg = fs.readFileSync("assets/icon-source.svg", "utf8");
// scale: 아이콘 안에서 판이 차지하는 비율, bg: 바탕색(없으면 투명)
async function render(page, out, size, { scale = 1, bg = null } = {}) {
  const inner = Math.round(size * scale);
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:${bg ?? "transparent"};width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center">
    <div style="width:${inner}px;height:${inner}px">${svg.replace("<svg ", `<svg width="${inner}" height="${inner}" `)}</div></body></html>`);
  await page.screenshot({ path: out, omitBackground: !bg });
}
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const cream = "#FBF7F2";
  await render(p, "assets/icon-only.png", 1024, { scale: 0.86, bg: cream });
  await render(p, "assets/icon-foreground.png", 1024, { scale: 0.6 });
  await render(p, "assets/splash.png", 2732, { scale: 0.22, bg: cream });
  await render(p, "assets/splash-dark.png", 2732, { scale: 0.22, bg: cream });
  await render(p, "public/apple-touch-icon.png", 180, { scale: 0.86, bg: cream });
  await render(p, "public/icon-192.png", 192, { scale: 0.86, bg: cream });
  await render(p, "public/icon-512.png", 512, { scale: 0.86, bg: cream });
  await b.close();
})();
