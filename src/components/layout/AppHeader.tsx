import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/** 왼쪽 로고+앱 이름(홈 링크), 오른쪽 아이콘 자리. 안전 영역은 헤더에서 비웁니다. */
export default function AppHeader({ right }: { right?: ReactNode }) {
  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        pt: "calc(env(safe-area-inset-top) + 12px)",
        pb: 1,
      }}
    >
      <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", gap: 1, color: "inherit", textDecoration: "none" }}>
        <Box component="img" src="/favicon.svg" alt="" sx={{ width: 32, height: 32 }} />
        <Typography component="span" sx={{ fontWeight: 800, fontSize: 20 }}>
          오늘Do퍼즐
        </Typography>
      </Box>
      {right}
    </Box>
  );
}
