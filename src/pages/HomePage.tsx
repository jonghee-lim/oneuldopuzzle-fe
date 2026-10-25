import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import DessertArt from "../components/dessert/DessertArt";
import AppHeader from "../components/layout/AppHeader";
import Page from "../components/layout/Page";
import { DIFFICULTY_LABEL, difficultyForLevel } from "../puzzle/sudoku/generator";
import { formatTime } from "../puzzle/sudoku/game";
import { usePuzzleStore } from "../stores/puzzleStore";
import { dessert, dessertForLevel } from "../theme/palette";
import { radius } from "../theme/shape";

export default function HomePage() {
  const navigate = useNavigate();
  const clearedLevel = usePuzzleStore((s) => s.clearedLevel);
  const game = usePuzzleStore((s) => s.game);
  const level = clearedLevel + 1;
  const today = dessertForLevel(level);
  const next = dessertForLevel(level + 1);
  const inProgress = game && game.level === level && !game.completed && game.history.length + game.elapsedSeconds > 0;

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
            <Typography sx={{ mt: 0.75, fontSize: 15, color: "text.secondary" }}>
              클래식 스도쿠 · {DIFFICULTY_LABEL[difficultyForLevel(level)]}
            </Typography>
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
      </Box>
    </Page>
  );
}
