import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Box, Button, Chip, IconButton, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
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
      <Box sx={{ px: 2, pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box
          sx={{
            borderRadius: radius.card,
            bgcolor: dessert.paper,
            border: `1.5px solid ${dessert.line}`,
            p: 3,
            textAlign: "center",
            backgroundImage: `radial-gradient(circle at 20% 15%, ${dessert.strawberryMilk} 0 38px, transparent 39px), radial-gradient(circle at 85% 80%, ${dessert.mintMilk} 0 46px, transparent 47px)`,
          }}
        >
          <Typography sx={{ fontSize: 72, lineHeight: 1.1 }} aria-hidden>
            {dessertForLevel(level)}
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 15, color: "text.secondary" }}>클래식 스도쿠</Typography>
          <Typography component="h1" sx={{ fontSize: 34, fontWeight: 800 }}>
            레벨 {level}
          </Typography>
          <Chip label={DIFFICULTY_LABEL[difficultyForLevel(level)]} size="small" sx={{ mt: 1, bgcolor: dessert.mintMilk, color: dessert.mintDeep, fontWeight: 700 }} />
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => navigate("/play")}
            sx={{ mt: 3, height: 56, fontSize: 18 }}
          >
            {inProgress ? `이어 하기 · ${formatTime(game.elapsedSeconds)}` : "시작하기"}
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Box sx={{ flex: 1, borderRadius: radius.item, bgcolor: dessert.strawberryMilk, p: 2 }}>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>깬 레벨</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 800 }}>{clearedLevel}개</Typography>
          </Box>
          <Box sx={{ flex: 1, borderRadius: radius.item, bgcolor: dessert.mintMilk, p: 2 }}>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>다음 디저트</Typography>
            <Typography sx={{ fontSize: 22 }} aria-label="다음 레벨 디저트">
              {dessertForLevel(level + 1)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Page>
  );
}
