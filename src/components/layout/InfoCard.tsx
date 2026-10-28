import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { dessert } from "../../theme/palette";
import { radius } from "../../theme/shape";

/** 이용안내·개인정보 처리방침의 글 묶음 하나: 제목과 본문 */
export default function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box component="section" sx={{ bgcolor: dessert.paper, borderRadius: radius.item, p: 2 }}>
      <Typography component="h2" sx={{ fontSize: 16, fontWeight: 800 }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 14, lineHeight: 1.8, mt: 0.75 }}>{children}</Typography>
    </Box>
  );
}
