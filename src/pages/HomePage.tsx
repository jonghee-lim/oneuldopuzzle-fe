import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Box, ButtonBase, IconButton, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import DailyBand from "../components/daily/DailyBand";
import DessertArt from "../components/dessert/DessertArt";
import StarIcon from "../components/dessert/StarIcon";
import PuzzleThumb from "../components/home/PuzzleThumb";
import AppHeader from "../components/layout/AppHeader";
import Page from "../components/layout/Page";
import { STARS_PER_DESSERT, isUnlocked, nextUnlockAt, totalStarsOf, unlockedByStars } from "../puzzle/core/collection";
import { ESCAPES } from "../puzzle/escape/puzzles";
import { NONOGRAMS } from "../puzzle/nonogram/puzzles";
import { DIFFICULTY_LABEL } from "../puzzle/sudoku/generator";
import { hasProgress } from "../puzzle/sudoku/game";
import { blockSizeForLevel } from "../puzzle/blocks/generator";
import { slideSizeForLevel } from "../puzzle/sliding/generator";
import { zoneSizeForLevel } from "../puzzle/zones/generator";
import { sudokuNext, usePuzzleStore } from "../stores/puzzleStore";
import { DESSERTS, dessert } from "../theme/palette";
import { radius } from "../theme/shape";

export default function HomePage() {
  const stars = usePuzzleStore((s) => s.stars);
  const treats = usePuzzleStore((s) => s.treats);
  const sudokuCleared = usePuzzleStore((s) => s.sudokuCleared);
  const chosenDifficulty = usePuzzleStore((s) => s.chosenDifficulty);
  const game = usePuzzleStore((s) => s.game);
  const paused = usePuzzleStore((s) => s.paused);
  const zoneCleared = usePuzzleStore((s) => s.zoneCleared);
  const zoneGame = usePuzzleStore((s) => s.zoneGame);
  const nonogramCleared = usePuzzleStore((s) => s.nonogramCleared);
  const escapeBest = usePuzzleStore((s) => s.escapeBest);
  const slideCleared = usePuzzleStore((s) => s.slideCleared);
  const slideGame = usePuzzleStore((s) => s.slideGame);
  const blockCleared = usePuzzleStore((s) => s.blockCleared);
  const blockGame = usePuzzleStore((s) => s.blockGame);

  const { difficulty, level } = sudokuNext({ sudokuCleared, chosenDifficulty });
  const sudokuResume = [game, paused[difficulty]].some((g) => g && g.level === level && g.difficulty === difficulty && !g.completed && hasProgress(g));
  const zoneLevel = zoneCleared + 1;
  const zoneResume = !!zoneGame && zoneGame.level === zoneLevel && !zoneGame.solved && zoneGame.cells.some(Boolean);
  const slideLevel = slideCleared + 1;
  const slideResume = !!slideGame && slideGame.level === slideLevel && !slideGame.solved && slideGame.moves > 0;
  const blockLevel = blockCleared + 1;
  const blockResume = !!blockGame && blockGame.level === blockLevel && !blockGame.solved && blockGame.placed.some((a) => a !== null);
  const size = (n: number) => `${n}×${n}`;
  const totalStars = totalStarsOf(stars);

  return (
    <Page>
      <AppHeader
        right={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ButtonBase
              component={Link}
              to="/desserts"
              aria-label={`디저트 도감, 별 ${totalStars}개`}
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
          <Tile
            to="/zones"
            tint={dessert.mintMilk}
            thumb={<PuzzleThumb kind="zones" />}
            title="색깔 구역"
            detail="줄·구역마다 마카롱 하나"
            badge={zoneResume ? "이어 하기" : `레벨 ${zoneLevel} · ${size(zoneSizeForLevel(zoneLevel))}`}
            resume={zoneResume}
          />
          <Tile
            to="/blocks"
            tint={dessert.vanilla}
            thumb={<PuzzleThumb kind="blocks" />}
            title="블록 채우기"
            detail="빈틈없이 꽉 채우기"
            badge={blockResume ? "이어 하기" : `레벨 ${blockLevel} · ${size(blockSizeForLevel(blockLevel))}`}
            resume={blockResume}
          />
          <Tile
            to="/sliding"
            tint={dessert.strawberryMilk}
            thumb={<PuzzleThumb kind="sliding" />}
            title="슬라이딩"
            detail="밀어서 순서대로"
            badge={slideResume ? "이어 하기" : `레벨 ${slideLevel} · ${size(slideSizeForLevel(slideLevel))}`}
            resume={slideResume}
          />
          <Tile
            to="/special/nonogram"
            tint={dessert.vanilla}
            thumb={<PuzzleThumb kind="nonogram" />}
            title="노노그램"
            detail="숫자로 그림 완성"
            badge={`${nonogramCleared.length}/${NONOGRAMS.length} 완료`}
          />
          <Tile
            to="/special/escape"
            tint={dessert.mintMilk}
            thumb={<PuzzleThumb kind="escape" />}
            title="블록 탈출"
            detail="딸기 블록을 출구로"
            badge={`${Object.keys(escapeBest).length}/${ESCAPES.length} 완료`}
          />
        </Box>
        <Box sx={{ height: 12 }} />
        <DessertBand totalStars={totalStars} treats={treats} />
      </Box>
    </Page>
  );
}

/** 첫 화면 아래 도감 띠: 모은 디저트와 다음 디저트까지 남은 별 */
function DessertBand({ totalStars, treats }: { totalStars: number; treats: Readonly<Record<string, number>> }) {
  const n = DESSERTS.length;
  const open = DESSERTS.filter((d, i) => isUnlocked(i, d.id, totalStars, n, treats)).length;
  const next = nextUnlockAt(totalStars, n);
  const shown = DESSERTS[Math.min(unlockedByStars(totalStars, n), n - 1)];
  return (
    <ButtonBase
      component={Link}
      to="/desserts"
      sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1.5, p: 2, borderRadius: radius.card, bgcolor: dessert.paper, textAlign: "left", boxShadow: "0 1px 2px rgba(78,59,46,.06), 0 8px 24px rgba(78,59,46,.06)" }}
    >
      <Box sx={next === null ? undefined : { filter: "brightness(0)", opacity: 0.15 }}>
        <DessertArt id={shown.id} size={48} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography component="h2" sx={{ fontSize: 17, fontWeight: 800 }}>
          디저트 도감{" "}
          <Box component="span" sx={{ color: dessert.cocoaSoft, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {open}/{n}
          </Box>
        </Typography>
        <Typography sx={{ fontSize: 13, color: dessert.cocoaSoft }}>
          {next === null ? "별로 여는 디저트를 모두 모았어요" : `별 ${next - totalStars}개 더 모으면 다음 디저트`}
        </Typography>
        {next !== null && (
          <Box aria-hidden sx={{ mt: 0.75, height: 6, borderRadius: radius.pill, bgcolor: dessert.creamDeep, overflow: "hidden" }}>
            <Box sx={{ height: "100%", width: `${((totalStars % STARS_PER_DESSERT) / STARS_PER_DESSERT) * 100}%`, bgcolor: "#F2B33D" }} />
          </Box>
        )}
      </Box>
    </ButtonBase>
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
