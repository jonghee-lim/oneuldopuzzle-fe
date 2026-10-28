// '다른 앱' 화면에 보여 줄 스마트인포랩 앱과, 실행 환경마다 어디로 보낼지 정하는 한 곳(2026-10-28 사용자 결정 A안).
// 설정·처음 화면의 메뉴 링크로만 들어오고 배너·끝 창 추천은 두지 않는다(Google Play '광고 포함' 기준).
// 스토어 번호는 콘솔 배포 기록의 설치 주소에서 옮겼다. 콘솔 앱 기본정보에 칸이 생기면 빌드 때 그 값을 읽게 바꾼다.

export type StorePlatform = "web" | "ios" | "android";

export type OtherApp = {
  id: string;
  name: string;
  summary: string;
  icon: string;
  web: string;
  /** App Store 앱 번호. 없으면 iOS 앱에서 숨긴다. */
  iosId?: string;
  /** Google Play 패키지 이름. 없으면 안드로이드 앱에서 숨긴다. */
  androidPackage?: string;
};

// 오늘Do클래스는 학원·학부모 전용이라 넣지 않는다.
export const OTHER_APPS: readonly OtherApp[] = [
  {
    id: "oneuldoit",
    name: "오늘DoIt",
    summary: "할 일과 일정을 한곳에 모아 관리합니다.",
    icon: "/other-apps/oneuldoit.png",
    web: "https://oneuldoit.smartinfol.com",
    iosId: "6821601400",
    androidPackage: "com.smartinfol.oneuldoit",
  },
  {
    id: "dallhythm",
    name: "달 리듬",
    summary: "생리 주기와 컨디션을 기록합니다.",
    icon: "/other-apps/dallhythm.png",
    web: "https://dallhythm.smartinfol.com",
    iosId: "6818856504",
    androidPackage: "com.smartinfol.dallhythm",
  },
  {
    id: "oneuldoeat",
    name: "오늘DoEat",
    summary: "오늘 메뉴부터 일주일 식단까지 정리합니다.",
    icon: "/other-apps/oneuldoeat.png",
    web: "https://oneuldoeat.smartinfol.com",
    iosId: "6823227264",
  },
];

/** 그 환경에서 열 주소. iOS 앱은 App Store, 안드로이드 앱은 Google Play만 쓴다(다른 스토어 이름을 보이지 않음). */
export function otherAppLink(app: OtherApp, platform: StorePlatform): string | null {
  if (platform === "ios") return app.iosId ? `https://apps.apple.com/kr/app/id${app.iosId}` : null;
  if (platform === "android") return app.androidPackage ? `https://play.google.com/store/apps/details?id=${app.androidPackage}` : null;
  return app.web;
}

/** 그 환경에서 보여 줄 앱과 주소. 열 곳이 없는 앱은 뺀다. */
export function otherAppsFor(platform: StorePlatform): { app: OtherApp; href: string }[] {
  return OTHER_APPS.flatMap((app) => {
    const href = otherAppLink(app, platform);
    return href ? [{ app, href }] : [];
  });
}
