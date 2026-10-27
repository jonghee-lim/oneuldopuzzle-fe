import { Box, Button, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PuzzleThumb from "../components/home/PuzzleThumb";
import Page from "../components/layout/Page";
import PuzzleHeader from "../components/layout/PuzzleHeader";
import { TIER_INFO, tierResume } from "../components/tier/tierInfo";
import { TIER_PLAY_ROUTE } from "../components/tier/tierRoutes";
import { useTierNext } from "../components/tier/useTier";
import { TIERS, TIER_LABEL, type Tier, type TierPuzzle } from "../puzzle/core/tier";
import { formatTime } from "../puzzle/sudoku/game";
import { tierStatKey, usePuzzleStore } from "../stores/puzzleStore";
import { dessert } from "../theme/palette";
import { radius } from "../theme/shape";

/** 다섯 퍼즐의 첫 화면: 스도쿠처럼 난이도를 고르고 그 난이도의 다음 레벨을 시작합니다. 레벨은 난이도마다 따로 이어집니다(2026-10-27). */
export default function TierPage({ puzzle }: { puzzle: TierPuzzle }) {
  const navigate = useNavigate();
  const info = TIER_INFO[puzzle];
  const { tier, level } = useTierNext(puzzle);
  const cleared = usePuzzleStore((s) => s.tierCleared[puzzle]);
  const chooseTier = usePuzzleStore((s) => s.chooseTier);
  const resume = usePuzzleStore((s) => tierResume(s, puzzle));
  const best = usePuzzleStore((s) => (puzzle === "zones" || puzzle === "blocks" || puzzle === "sliding" ? s.stats[tierStatKey(puzzle, tier)]?.bestSeconds : undefined));

  return (
    <Page>
      <PuzzleHeader title={info.title} subtitle={info.rule} />
      <Box sx={{ px: 2, pt: 1 }}>
        <Box component="section" aria-labelledby="level-title" sx={{ borderRadius: radius.card, bgcolor: dessert.paper, overflow: "hidden", boxShadow: "0 1px 2px rgba(78,59,46,.06), 0 8px 24px rgba(78,59,46,.06)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 2.5, pt: 2.5, pb: 2, bgcolor: info.tint }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: dessert.strawberryDeep, letterSpacing: "0.02em" }}>
                {TIER_LABEL[tier]} · {info.board(level, tier)}
              </Typography>
              <Typography id="level-title" component="h2" sx={{ fontSize: 30, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", mt: 0.25 }}>
                레벨 {level}
              </Typography>
              <Typography sx={{ fontSize: 15, color: dessert.cocoaSoft, mt: 0.25 }}>{resume ? "풀던 판이 있어요" : best !== undefined ? `최고 기록 ${formatTime(best)}` : "첫 판을 풀어 봐요"}</Typography>
            </Box>
            <PuzzleThumb kind={puzzle} size={96} />
          </Box>
          <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
            <Typography id="tier-label" sx={{ mb: 1, fontSize: 14, fontWeight: 700 }}>
              난이도
            </Typography>
            <ToggleButtonGroup exclusive fullWidth value={tier} onChange={(_, v: Tier | null) => v && chooseTier(puzzle, v)} aria-labelledby="tier-label">
              {TIERS.map((t) => (
                <ToggleButton
                  key={t}
                  value={t}
                  aria-label={TIER_LABEL[t]}
                  sx={{
                    height: 56,
                    px: 0.5,
                    flexDirection: "column",
                    gap: "2px",
                    whiteSpace: "nowrap",
                    "&.Mui-selected, &.Mui-selected:hover": { bgcolor: dessert.mint, color: dessert.cocoa },
                  }}
                >
                  <Box component="span" sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
                    {TIER_LABEL[t]}
                  </Box>
                  <Box component="span" aria-hidden sx={{ fontSize: 12, fontWeight: 600, color: dessert.cocoaSoft, lineHeight: 1.2, fontVariantNumeric: "tabular-nums" }}>
                    레벨 {(cleared?.[t] ?? 0) + 1}
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Button variant="contained" size="large" fullWidth onClick={() => navigate(TIER_PLAY_ROUTE[puzzle])} sx={{ mt: 2, height: 56, fontSize: 18 }}>
              {resume ? "이어 하기" : "시작하기"}
            </Button>
          </Box>
        </Box>
        <Typography sx={{ fontSize: 13, color: dessert.cocoaSoft, mt: 1.5, px: 0.5 }}>레벨은 난이도마다 따로 이어져요. 좋아하는 난이도로 계속 풀어 보세요.</Typography>
      </Box>
    </Page>
  );
}
