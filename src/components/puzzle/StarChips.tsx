import { Box, Typography } from "@mui/material";
import type { StarLine } from "../../puzzle/core/score";
import { dessert } from "../../theme/palette";
import { radius } from "../../theme/shape";
import StarIcon from "../dessert/StarIcon";
import { formatTime } from "../../puzzle/sudoku/game";
import { usePuzzleStore } from "../../stores/puzzleStore";

/** 완성 창에서 이번 판 별(1~3개)과 받은 조건·놓친 조건, 시간을 재는 퍼즐은 최고 기록과 견준 결과 */
export default function StarChips({ lines }: { lines: readonly StarLine[] | null }) {
  const last = usePuzzleStore((s) => s.lastRecord);
  if (!lines || lines.length === 0) return null;
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
      {last && <RecordLine seconds={last.seconds} prevBest={last.prevBest} />}
    </Box>
  );
}

function RecordLine({ seconds, prevBest }: { seconds: number; prevBest?: number }) {
  const best = prevBest === undefined || seconds < prevBest;
  const text =
    prevBest === undefined
      ? `첫 기록 ${formatTime(seconds)}`
      : best
        ? `최고 기록! ${formatTime(prevBest)} → ${formatTime(seconds)}`
        : seconds === prevBest
          ? `최고 기록과 같아요 ${formatTime(seconds)}`
          : `이번 ${formatTime(seconds)} · 최고 기록 ${formatTime(prevBest)}`;
  return (
    <Typography role="status" sx={{ mt: 1.5, px: 1.5, py: 1, borderRadius: radius.item, fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", bgcolor: best ? dessert.vanilla : dessert.creamDeep, color: dessert.cocoa }}>
      {text}
    </Typography>
  );
}
