import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 공유 패키지(app-core)는 TypeScript 원본이므로 미리 묶지 않고 그대로 씁니다(달 리듬과 같은 설정).
  optimizeDeps: { exclude: ["@smartinfolab/app-core"] },
  server: { host: "localhost", port: 5180, strictPort: true },
});
