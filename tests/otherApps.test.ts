import { test } from "node:test";
import assert from "node:assert/strict";
import { otherAppsFor } from "../src/platform/otherApps.ts";

test("다른 앱: iOS 앱은 App Store 주소만, 안드로이드 앱은 Play 주소만, 웹은 웹 주소", () => {
  const ios = otherAppsFor("ios");
  assert.deepEqual(ios.map((x) => x.app.id), ["oneuldoit", "dallhythm", "oneuldoeat"]);
  assert.ok(ios.every((x) => x.href.startsWith("https://apps.apple.com/kr/app/id")));
  assert.equal(ios.find((x) => x.app.id === "oneuldoeat")?.href, "https://apps.apple.com/kr/app/id6823227264");

  // 오늘DoEat은 Play에 없어서 안드로이드에서는 빠진다.
  const android = otherAppsFor("android");
  assert.deepEqual(android.map((x) => x.app.id), ["oneuldoit", "dallhythm"]);
  assert.ok(android.every((x) => x.href.startsWith("https://play.google.com/store/apps/details?id=com.smartinfol.")));

  const web = otherAppsFor("web");
  assert.equal(web.length, 3);
  assert.ok(web.every((x) => x.href.startsWith("https://") && x.href.endsWith(".smartinfol.com")));
});

test("다른 앱: 어느 환경도 다른 스토어 주소나 앱 안 주소를 내보내지 않음", () => {
  for (const p of ["web", "ios", "android"] as const) {
    for (const { href } of otherAppsFor(p)) {
      assert.ok(!/localhost|capacitor:|127\.0\.0\.1/.test(href), href);
      if (p === "ios") assert.ok(!href.includes("play.google"), href);
      if (p === "android") assert.ok(!href.includes("apple.com"), href);
    }
  }
});
