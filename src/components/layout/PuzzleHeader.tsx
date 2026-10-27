import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Box, IconButton, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

/** 풀이 화면 위 줄: 뒤로(기본은 처음 화면), 가운데 제목(h1)과 한 줄 설명, 오른쪽 상태(시간·이동 수) */
export default function PuzzleHeader({ title, subtitle, art, right, back }: { title: string; subtitle?: string; art?: ReactNode; right?: ReactNode; back?: { to: string; label: string } }) {
  const navigate = useNavigate();
  return (
    <Box component="header" sx={{ display: "flex", alignItems: "center", px: 1, pt: "calc(env(safe-area-inset-top) + 8px)", pb: 0.5 }}>
      <IconButton aria-label={back?.label ?? "처음 화면으로"} onClick={() => navigate(back?.to ?? "/")}>
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 1, minWidth: 0 }}>
        {art}
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h1" sx={{ fontWeight: 700, fontSize: 20, lineHeight: 1.2 }}>
            {title}
          </Typography>
          {subtitle && <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.3 }}>{subtitle}</Typography>}
        </Box>
      </Box>
      <Box sx={{ minWidth: 56, textAlign: "right", pr: 1, color: "text.secondary", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{right}</Box>
    </Box>
  );
}
