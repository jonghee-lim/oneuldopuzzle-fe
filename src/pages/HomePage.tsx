import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, Button, ButtonBase, IconButton, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import DessertArt from "../components/dessert/DessertArt";
import AppHeader from "../components/layout/AppHeader";
import Page from "../components/layout/Page";
import { ESCAPES } from "../puzzle/escape/puzzles";
import { NONOGRAMS } from "../puzzle/nonogram/puzzles";
import { DIFFICULTY_LABEL, difficultyForLevel, type SudokuDifficulty } from "../puzzle/sudoku/generator";
import { formatTime } from "../puzzle/sudoku/game";
import { usePuzzleStore } from "../stores/puzzleStore";
import { dessert, dessertForLevel } from "../theme/palette";
import { radius } from "../theme/shape";

export default function HomePage() {
  const navigate = useNavigate();
  const clearedLevel = usePuzzleStore((s) => s.clearedLevel);
  const game = usePuzzleStore((s) => s.game);
  const chosenDifficulty = usePuzzleStore((s) => s.chosenDifficulty);
  const chooseDifficulty = usePuzzleStore((s) => s.chooseDifficulty);
  const level = clearedLevel + 1;
  const difficulty = chosenDifficulty ?? difficultyForLevel(level);
  const today = dessertForLevel(level);
  const next = dessertForLevel(level + 1);
  const inProgress = game && game.level === level && game.difficulty === difficulty && !game.completed && game.history.length + game.elapsedSeconds > 0;

  return (
    <Page>
      <AppHeader
        right={
          <IconButton component={Link} to="/settings" aria-label="설정">
            <SettingsOutlinedIcon />
          </IconButton>
        }
      />
      <Box sx={{ px: 2, pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* 이번 레벨의 디저트가 화면의 주인공입니다. 그림 바탕은 무늬 없이 한 가지 색으로 둡니다. */}
        <Box component="section" aria-labelledby="level-title" sx={{ borderRadius: radius.card, bgcolor: dessert.strawberryMilk, overflow: "hidden" }}>
          <Box sx={{ display: "flex", justifyContent: "center", pt: 4, pb: 2 }}>
            <DessertArt id={today.id} size="min(46vw, 200px)" title={today.name} />
          </Box>
          <Box sx={{ bgcolor: dessert.paper, px: 2.5, pt: 2.5, pb: 2.5 }}>
            <Typography id="level-title" component="h1" sx={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              레벨 {level} · {today.name}
            </Typography>
            <Typography sx={{ mt: 0.75, fontSize: 15, color: "text.secondary" }}>클래식 스도쿠</Typography>
            <Typography id="difficulty-label" sx={{ mt: 2, mb: 1, fontSize: 14, fontWeight: 600 }}>
              난이도
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={difficulty}
              onChange={(_, v: SudokuDifficulty | null) => v && chooseDifficulty(v)}
              aria-labelledby="difficulty-label"
            >
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
            <Button variant="contained" size="large" fullWidth onClick={() => navigate("/play")} sx={{ mt: 2.5, height: 56, fontSize: 18 }}>
              {inProgress ? `이어 하기 · ${formatTime(game.elapsedSeconds)}` : "시작하기"}
            </Button>
          </Box>
        </Box>

        <Box
          component="section"
          aria-label="진행 상황"
          sx={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", alignItems: "center", bgcolor: dessert.paper, borderRadius: radius.item, py: 1.5 }}
        >
          <Box sx={{ px: 2 }}>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>깬 레벨</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{clearedLevel}개</Typography>
          </Box>
          <Box sx={{ alignSelf: "stretch", bgcolor: dessert.creamDeep }} />
          <Box sx={{ px: 2, display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <DessertArt id={next.id} size={36} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>다음 디저트</Typography>
              <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{next.name}</Typography>
            </Box>
          </Box>
        </Box>
        <Box component="section" aria-labelledby="special-title" sx={{ pb: 2 }}>
          <Typography id="special-title" component="h2" sx={{ fontSize: 18, fontWeight: 700, px: 0.5, pb: 1 }}>
            스페셜 스테이지 체험
          </Typography>
          <Box sx={{ bgcolor: dessert.paper, borderRadius: radius.item, overflow: "hidden" }}>
            <SpecialRow to="/special/nonogram" title="노노그램" detail={`숫자 힌트로 칸을 칠해 그림 완성 · ${NONOGRAMS.length}단계`} />
            <Box sx={{ height: "1px", bgcolor: dessert.creamDeep, mx: 2 }} />
            <SpecialRow to="/special/escape" title="블록 탈출" detail={`블록을 밀어 딸기 블록을 출구로 · ${ESCAPES.length}단계`} />
          </Box>
        </Box>
      </Box>
    </Page>
  );
}

function SpecialRow({ to, title, detail }: { to: string; title: string; detail: string }) {
  return (
    <ButtonBase
      component={Link}
      to={to}
      sx={{
        width: "100%",
        minHeight: 64,
        px: 2,
        py: 1.5,
        justifyContent: "space-between",
        textAlign: "left",
        gap: 1,
        "&:active": { bgcolor: dessert.creamDeep },
        "&.Mui-focusVisible": { outline: `3px solid ${dessert.strawberryDeep}`, outlineOffset: "-3px" },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{title}</Typography>
        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{detail}</Typography>
      </Box>
      <ChevronRightIcon aria-hidden sx={{ color: dessert.cocoaSoft }} />
    </ButtonBase>
  );
}
