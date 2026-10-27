import { Box, Typography } from "@mui/material";
import type { StarLine } from "../../puzzle/core/score";
import { dessert } from "../../theme/palette";
import { radius } from "../../theme/shape";
import StarIcon from "../dessert/StarIcon";
import { usePuzzleStore } from "../../stores/puzzleStore";
import { DESSERTS } from "../../theme/palette";
import { HINT_PER_UNLOCK } from "../../puzzle/core/score";

/** 완성 창에서 이번 판 별(1~3개)과 받은 조건·놓친 조건 */
export default function StarChips({ lines }: { lines: readonly StarLine[] | null }) {
  const unlock = usePuzzleStore((s) => s.lastUnlock);
  if (!lines || lines.length === 0) return null;
  const opened = unlock ? DESSERTS.find((d) => d.id === unlock) : undefined;
  const got = lines.filter((l) => l.got).length;
  return (
    <Box sx={{ mt: 2 }}>
      <Box role="img" aria-label={`별 ${got}개`} sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
        {lines.map((_, i) => (
          <StarIcon key={i} on={i < got} size={40} />
        ))}
      </Box>
      <Typography sx={{ mt: 0.5, fontSize: 15, fontWeight: 800, color: dessert.cocoa }}>별 {got}개</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 0.75, mt: 1 }}>
        {lines.map((l) => (
          <Box
            key={l.label}
            component="span"
            sx={{ px: 1.25, py: 0.5, borderRadius: radius.pill, fontSize: 13, fontWeight: 700, bgcolor: l.got ? dessert.mintMilk : dessert.creamDeep, color: l.got ? dessert.mintDeep : dessert.cocoaSoft }}
          >
            {l.got ? "★" : "☆"} {l.label}
          </Box>
        ))}
      </Box>
      {opened && (
        <Typography role="status" sx={{ mt: 1.5, px: 1.5, py: 1, borderRadius: radius.item, bgcolor: dessert.vanilla, fontSize: 14, fontWeight: 700 }}>
          도감에 {opened.name} 열림! 힌트 +{HINT_PER_UNLOCK}개
        </Typography>
      )}
    </Box>
  );
}
