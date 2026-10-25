import { Box } from "@mui/material";
import type { ReactNode } from "react";

/** 본문 폭을 휴대폰 화면에 맞추고 큰 화면에서는 가운데에 둡니다. */
export default function Page({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 520, flex: "1 1 auto", display: "flex", flexDirection: "column", pb: "calc(env(safe-area-inset-bottom) + 16px)" }}>
        {children}
      </Box>
    </Box>
  );
}
