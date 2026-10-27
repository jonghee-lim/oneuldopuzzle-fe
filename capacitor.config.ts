import type { CapacitorConfig } from "@capacitor/cli";

// 앱 id는 스토어에 한 번 올리면 바꿀 수 없다. 출시 전에 형제 앱 규칙과 맞는지 확인한다.
const config: CapacitorConfig = {
  appId: "com.smartinfolab.oneuldopuzzle",
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
