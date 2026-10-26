import { Box, Typography } from "@mui/material";
import type { ScoreLine } from "../../puzzle/core/score";
import { dessert } from "../../theme/palette";
import { radius } from "../../theme/shape";

/** 완성 창에서 이번 판 점수(+10 완성 · +5 빠르게 …)와 합계 */
export default function ScoreChips({ lines }: { lines: readonly ScoreLine[] | null }) {
  if (!lines || lines.length === 0) return null;
  const sum = lines.reduce((s, l) => s + l.points, 0);
  return (
    <Box sx={{ mt: 2 }}>
      <Typography sx={{ fontSize: 30, fontWeight: 800, color: dessert.strawberryDeep, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>+{sum}점</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 0.75, mt: 1 }}>
        {lines.map((l) => (
          <Box key={l.label} component="span" sx={{ px: 1.25, py: 0.5, borderRadius: radius.pill, bgcolor: dessert.mintMilk, color: dessert.mintDeep, fontSize: 13, fontWeight: 700 }}>
            {l.label} +{l.points}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
