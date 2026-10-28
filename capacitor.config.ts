import type { CapacitorConfig } from "@capacitor/cli";

// 앱 id는 스토어에 한 번 올리면 바꿀 수 없다. 형제 앱 규칙 com.smartinfol.<앱>을 따른다(2026-10-28).
const config: CapacitorConfig = {
  appId: "com.smartinfol.oneuldopuzzle",
  appName: "오늘Do퍼즐",
  webDir: "dist",
  backgroundColor: "#FBF7F2",
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: "#FBF7F2",
      showSpinner: false,
    },
  },
};

export default config;
