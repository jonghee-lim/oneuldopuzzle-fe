import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Box, Button, ButtonBase, IconButton, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import DessertArt from "../components/dessert/DessertArt";
import PuzzleThumb from "../components/home/PuzzleThumb";
import AppHeader from "../components/layout/AppHeader";
import Page from "../components/layout/Page";
import { ESCAPES } from "../puzzle/escape/puzzles";
import { NONOGRAMS } from "../puzzle/nonogram/puzzles";
import { DIFFICULTY_LABEL, difficultyForLevel, type SudokuDifficulty } from "../puzzle/sudoku/generator";
import { formatTime, hasProgress } from "../puzzle/sudoku/game";
import { zoneSizeForLevel } from "../puzzle/zones/generator";
import { usePuzzleStore } from "../stores/puzzleStore";
import { dessert, dessertForLevel } from "../theme/palette";
import { radius } from "../theme/shape";

export default function HomePage() {
  const navigate = useNavigate();
  const clearedLevel = usePuzzleStore((s) => s.clearedLevel);
  const game = usePuzzleStore((s) => s.game);
  const paused = usePuzzleStore((s) => s.paused);
  const chosenDifficulty = usePuzzleStore((s) => s.chosenDifficulty);
  const chooseDifficulty = usePuzzleStore((s) => s.chooseDifficulty);
  const score = usePuzzleStore((s) => s.score);
  const zoneCleared = usePuzzleStore((s) => s.zoneCleared);
  const zoneGame = usePuzzleStore((s) => s.zoneGame);
  const nonogramCleared = usePuzzleStore((s) => s.nonogramCleared);
  const escapeBest = usePuzzleStore((s) => s.escapeBest);
  const level = clearedLevel + 1;
  const difficulty = chosenDifficulty ?? difficultyForLevel(level);
  const today = dessertForLevel(level);
  // 고른 난이도로 풀던 판(지금 판 또는 난이도를 바꾸느라 멈춰 둔 판)에 숫자·메모를 넣었으면 이어 하기
  const resume = [game, paused[difficulty]].find((g) => g && g.level === level && g.difficulty === difficulty && !g.completed && hasProgress(g));
  const zoneLevel = zoneCleared + 1;
  const zoneResume = zoneGame && zoneGame.level === zoneLevel && !zoneGame.solved && zoneGame.cells.some(Boolean);
  const escapeDone = Object.keys(escapeBest).length;

  return (
    <Page>
      <AppHeader
        right={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ButtonBase
              component={Link}
              to="/records"
              aria-label={`점수표, 총점 ${score}점`}
              sx={{ gap: 0.5, px: 1.25, height: 36, borderRadius: radius.pill, bgcolor: dessert.vanilla, fontWeight: 800, fontSize: 15, fontVariantNumeric: "tabular-nums" }}
            >
              <EmojiEventsOutlinedIcon sx={{ fontSize: 18, color: "#B07A16" }} />
              {score.toLocaleString("ko-KR")}
            </ButtonBase>
            <IconButton component={Link} to="/settings" aria-label="설정">
              <SettingsOutlinedIcon />
            </IconButton>
          </Box>
        }
      />
      <Box sx={{ px: 2, pt: 0.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* 메인: 오늘의 스도쿠. 이번 레벨의 디저트가 주인공입니다. */}
        <Box component="section" aria-labelledby="level-title" sx={{ borderRadius: radius.card, bgcolor: dessert.paper, overflow: "hidden", boxShadow: "0 1px 2px rgba(78,59,46,.06), 0 8px 24px rgba(78,59,46,.06)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 2.5, pt: 2.5, pb: 2, bgcolor: dessert.strawberryMilk }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: dessert.strawberryDeep, letterSpacing: "0.02em" }}>클래식 스도쿠</Typography>
              <Typography id="level-title" component="h1" sx={{ fontSize: 30, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", mt: 0.25 }}>
                레벨 {level}
              </Typography>
              <Typography sx={{ fontSize: 15, color: dessert.cocoaSoft, mt: 0.25 }}>{today.name}</Typography>
            </Box>
            <DessertArt id={today.id} size="min(30vw, 128px)" title={today.name} />
          </Box>
          <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
            <Typography id="difficulty-label" sx={{ mb: 1, fontSize: 14, fontWeight: 700 }}>
              난이도
            </Typography>
            <ToggleButtonGroup exclusive fullWidth value={difficulty} onChange={(_, v: SudokuDifficulty | null) => v && chooseDifficulty(v)} aria-labelledby="difficulty-label">
              {(Object.keys(DIFFICULTY_LABEL) as SudokuDifficulty[]).map((d) => (
                <ToggleButton
                  key={d}
                  value={d}
                  sx={{
                    height: 44,
                    px: 0.5,
                    fontSize: 14,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    "&.Mui-selected, &.Mui-selected:hover": { bgcolor: dessert.mint, color: dessert.cocoa },
                  }}
                >
                  {DIFFICULTY_LABEL[d]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Button variant="contained" size="large" fullWidth onClick={() => navigate("/play")} sx={{ mt: 2, height: 56, fontSize: 18 }}>
              {resume ? `이어 하기 · ${formatTime(resume.elapsedSeconds)}` : "시작하기"}
            </Button>
          </Box>
        </Box>

        <Typography component="h2" sx={{ fontSize: 18, fontWeight: 800, px: 0.5, pt: 1 }}>
          퍼즐 모음
        </Typography>
        {/* 다른 퍼즐은 같은 크기의 타일로 나란히 둡니다. 색깔 구역은 레벨이 끝없이 이어져 넓게 둡니다. */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <Tile
            to="/zones"
            wide
            tint={dessert.mintMilk}
            thumb={<PuzzleThumb kind="zones" size={64} />}
            title="색깔 구역"
            detail="줄·구역마다 마카롱 하나"
            badge={zoneResume ? "이어 하기" : `레벨 ${zoneLevel} · ${zoneSizeForLevel(zoneLevel)}×${zoneSizeForLevel(zoneLevel)}`}
            isNew={zoneCleared === 0}
          />
          <Tile
            to="/special/nonogram"
            tint={dessert.strawberryMilk}
            thumb={<PuzzleThumb kind="nonogram" />}
            title="노노그램"
            detail="숫자로 그림 완성"
            badge={`${nonogramCleared.length}/${NONOGRAMS.length} 완료`}
            special
          />
          <Tile
            to="/special/escape"
            tint={dessert.vanilla}
            thumb={<PuzzleThumb kind="escape" />}
            title="블록 탈출"
            detail="딸기 블록을 출구로"
            badge={`${escapeDone}/${ESCAPES.length} 완료`}
            special
          />
        </Box>
        <Typography sx={{ fontSize: 13, color: "text.secondary", px: 0.5, pb: 2 }}>곧 추가: 블록 채우기 · 슬라이딩 퍼즐</Typography>
      </Box>
    </Page>
  );
}

function Tile({
  to,
  tint,
  thumb,
  title,
  detail,
  badge,
  wide = false,
  special = false,
  isNew = false,
}: {
  to: string;
  tint: string;
  thumb: ReactNode;
  title: string;
  detail: string;
  badge: string;
  wide?: boolean;
  special?: boolean;
  isNew?: boolean;
}) {
  return (
    <ButtonBase
      component={Link}
      to={to}
      sx={{
        gridColumn: wide ? "1 / -1" : undefined,
        display: "flex",
        flexDirection: wide ? "row" : "column",
        alignItems: wide ? "center" : "flex-start",
        justifyContent: "flex-start",
        gap: wide ? 2 : 1.25,
        p: 2,
        minHeight: wide ? 96 : 168,
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
      <Box sx={{ minWidth: 0, flex: wide ? 1 : undefined }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: 17, fontWeight: 800 }}>{title}</Typography>
          {special && <Chip label="스페셜" color={dessert.strawberryDeep} />}
          {isNew && <Chip label="NEW" color={dessert.mintDeep} />}
        </Box>
        <Typography sx={{ fontSize: 13, color: dessert.cocoaSoft, mt: 0.25 }}>{detail}</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 700, mt: 0.75, fontVariantNumeric: "tabular-nums" }}>{badge}</Typography>
      </Box>
      {wide && <ChevronRightIcon aria-hidden sx={{ color: dessert.cocoaSoft }} />}
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
