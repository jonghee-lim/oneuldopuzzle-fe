// 설치형 앱(Capacitor)에서만 하는 일: 안드로이드 뒤로 가기 버튼, 상태 표시줄 색, 시작 화면 닫기, 기기 진동.
// 웹에서는 아무것도 하지 않고 플러그인도 불러오지 않습니다.
import { isIosApp, isNativeApp } from "@smartinfolab/app-core/runtime";
import type { StorePlatform } from "./otherApps";

export { isNativeApp };

/** 스토어 링크를 고를 실행 환경: iOS 앱, 안드로이드 앱, 그 밖(웹·웹앱)은 web. */
export function storePlatform(): StorePlatform {
  if (!isNativeApp()) return "web";
  return isIosApp() ? "ios" : "android";
}

/** 앱이 처음 그려진 뒤 한 번 부릅니다. goBack은 앱 안에서 한 칸 뒤로, 처음 화면이면 false를 돌려줍니다. */
export async function setupNative(goBack: () => boolean) {
  if (!isNativeApp()) return;
  const [{ App }, { StatusBar, Style }, { SplashScreen }] = await Promise.all([
    import("@capacitor/app"),
    import("@capacitor/status-bar"),
    import("@capacitor/splash-screen"),
  ]);
  void App.addListener("backButton", () => {
    if (!goBack()) void App.exitApp();
  });
  // 크림 바탕이라 상태 표시줄 글자는 어둡게
  void StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  void SplashScreen.hide().catch(() => {});
}

type Buzz = "light" | "medium" | "success" | "error";

/** 기기 진동. iOS 웹뷰는 navigator.vibrate가 없어서 앱에서는 Haptics 플러그인을 씁니다. */
export async function nativeBuzz(kind: Buzz) {
  const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");
  if (kind === "light") return Haptics.impact({ style: ImpactStyle.Light });
  if (kind === "medium") return Haptics.impact({ style: ImpactStyle.Medium });
  return Haptics.notification({ type: kind === "success" ? NotificationType.Success : NotificationType.Error });
}
