import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { TIER_INFO, tierResume } from "../components/tier/tierInfo";
import { TIER_ROUTE } from "../components/tier/tierRoutes";
import { useTierNext } from "../components/tier/useTier";
import { TIER_LABEL, type TierPuzzle } from "../puzzle/core/tier";
import { Box, ButtonBase, IconButton, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import DailyBand from "../components/daily/DailyBand";
import StarIcon from "../components/dessert/StarIcon";
import PuzzleThumb from "../components/home/PuzzleThumb";
import AppHeader from "../components/layout/AppHeader";
import Page from "../components/layout/Page";
import { totalStarsOf } from "../puzzle/core/collection";
import { DIFFICULTY_LABEL } from "../puzzle/sudoku/generator";
import { hasProgress } from "../puzzle/sudoku/game";
import { sudokuNext, usePuzzleStore } from "../stores/puzzleStore";
import { dessert } from "../theme/palette";
import { radius } from "../theme/shape";

export default function HomePage() {
  const stars = usePuzzleStore((s) => s.stars);
  const sudokuCleared = usePuzzleStore((s) => s.sudokuCleared);
  const chosenDifficulty = usePuzzleStore((s) => s.chosenDifficulty);
  const game = usePuzzleStore((s) => s.game);
  const paused = usePuzzleStore((s) => s.paused);
  const { difficulty, level } = sudokuNext({ sudokuCleared, chosenDifficulty });
  const sudokuResume = [game, paused[difficulty]].some((g) => g && g.level === level && g.difficulty === difficulty && !g.completed && hasProgress(g));
  const totalStars = totalStarsOf(stars);

  return (
    <Page>
      <AppHeader
        right={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ButtonBase
              component={Link}
              to="/records"
              aria-label={`기록표, 별 ${totalStars}개`}
              sx={{ gap: 0.5, px: 1.25, height: 36, borderRadius: radius.pill, bgcolor: dessert.vanilla, fontWeight: 800, fontSize: 15, fontVariantNumeric: "tabular-nums" }}
            >
              <StarIcon size={18} />
              {totalStars.toLocaleString("ko-KR")}
            </ButtonBase>
            <IconButton component={Link} to="/settings" aria-label="설정">
              <SettingsOutlinedIcon />
            </IconButton>
          </Box>
        }
      />
      <Box sx={{ px: 2, pt: 1, pb: 2 }}>
        <Typography component="h1" sx={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", px: 0.5 }}>
          어떤 퍼즐을 풀까요?
        </Typography>
        <Typography sx={{ fontSize: 14, color: dessert.cocoaSoft, px: 0.5, mt: 0.25, mb: 2 }}>
          여섯 가지 퍼즐, 모두 레벨이 이어져요.
        </Typography>
        <DailyBand />
        <Box sx={{ height: 12 }} />
        {/* 여섯 퍼즐을 같은 크기 카드로 나란히 둡니다(2026-10-26 사용자 결정: 스도쿠만 크게 두지 않음). */}
        <Box component="nav" aria-label="퍼즐 고르기" sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <Tile
            to="/sudoku"
            tint={dessert.strawberryMilk}
            thumb={<PuzzleThumb kind="sudoku" />}
            title="스도쿠"
            detail="1~9를 겹치지 않게"
            badge={sudokuResume ? "이어 하기" : `${DIFFICULTY_LABEL[difficulty]} · 레벨 ${level}`}
            resume={sudokuResume}
          />
          {HOME_TIER_ORDER.map((puzzle) => (
            <TierTile key={puzzle} puzzle={puzzle} />
          ))}
        </Box>
        {/* 내 다른 앱은 메뉴 링크로만 알립니다(배너·끝 창 추천 없음, 2026-10-28 사용자 결정). */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <ButtonBase component={Link} to="/apps" sx={{ px: 1.5, py: 1, borderRadius: radius.pill, fontSize: 13, color: dessert.cocoaSoft, textDecoration: "underline", textUnderlineOffset: "3px" }}>
            스마트인포랩의 다른 앱
          </ButtonBase>
        </Box>
      </Box>
    </Page>
  );
}

const HOME_TIER_ORDER: readonly TierPuzzle[] = ["zones", "blocks", "sliding", "nonogram", "escape"];

/** 다섯 퍼즐 카드: 고른 난이도와 다음 레벨, 풀던 판이 있으면 이어 하기 */
function TierTile({ puzzle }: { puzzle: TierPuzzle }) {
  const info = TIER_INFO[puzzle];
  const { tier, level } = useTierNext(puzzle);
  const resume = usePuzzleStore((s) => tierResume(s, puzzle));
  return (
    <Tile
      to={TIER_ROUTE[puzzle]}
      tint={info.tint}
      thumb={<PuzzleThumb kind={puzzle} />}
      title={info.title}
      detail={info.short}
      badge={resume ? "이어 하기" : `${TIER_LABEL[tier]} · 레벨 ${level}`}
      resume={resume}
    />
  );
}

function Tile({ to, tint, thumb, title, detail, badge, resume = false }: { to: string; tint: string; thumb: ReactNode; title: string; detail: string; badge: string; resume?: boolean }) {
  return (
    <ButtonBase
      component={Link}
      to={to}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: 1.25,
        p: 2,
        minHeight: 176,
        textAlign: "left",
        borderRadius: radius.card,
        bgcolor: tint,
        transition: "transform 120ms ease-out",
        "&:active": { transform: "scale(0.97)" },
        "@media (prefers-reduced-motion: reduce)": { transition: "none", "&:active": { transform: "none" } },
        "&.Mui-focusVisible": { outline: `3px solid ${dessert.strawberryDeep}`, outlineOffset: "2px" },
      }}
    >
      <Box sx={{ borderRadius: radius.item, overflow: "hidden", flexShrink: 0 }}>{thumb}</Box>
      <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
        <Typography sx={{ fontSize: 17, fontWeight: 800 }}>{title}</Typography>
        <Typography sx={{ fontSize: 13, color: dessert.cocoaSoft, mt: 0.25 }}>{detail}</Typography>
        <Box sx={{ mt: "auto", pt: 0.75 }}>
          {resume ? <Chip label={badge} color={dessert.mintDeep} /> : <Typography sx={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{badge}</Typography>}
        </Box>
      </Box>
    </ButtonBase>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <Box component="span" sx={{ px: 0.75, py: "1px", borderRadius: radius.pill, bgcolor: color, color: "#FFFFFF", fontSize: 11, fontWeight: 800, letterSpacing: "0.02em" }}>
      {label}
    </Box>
  );
}
