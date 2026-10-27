import { Box, Button, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PuzzleThumb from "../components/home/PuzzleThumb";
import Page from "../components/layout/Page";
import PuzzleHeader from "../components/layout/PuzzleHeader";
import { DIFFICULTY_LABEL, type SudokuDifficulty } from "../puzzle/sudoku/generator";
import { formatTime, hasProgress } from "../puzzle/sudoku/game";
import { sudokuNext, usePuzzleStore } from "../stores/puzzleStore";
import { dessert } from "../theme/palette";
import { radius } from "../theme/shape";

/** 스도쿠 첫 화면: 난이도를 고르고 그 난이도의 다음 레벨을 시작합니다. 레벨은 난이도마다 따로 이어집니다. */
export default function SudokuPage() {
  const navigate = useNavigate();
  const sudokuCleared = usePuzzleStore((s) => s.sudokuCleared);
  const chosenDifficulty = usePuzzleStore((s) => s.chosenDifficulty);
  const chooseDifficulty = usePuzzleStore((s) => s.chooseDifficulty);
  const game = usePuzzleStore((s) => s.game);
  const paused = usePuzzleStore((s) => s.paused);
  const { difficulty, level } = sudokuNext({ sudokuCleared, chosenDifficulty });
  const best = usePuzzleStore((s) => s.stats[difficulty]?.bestSeconds);
  // 고른 난이도로 풀던 판(지금 판 또는 난이도를 바꾸느라 멈춰 둔 판)에 숫자·메모를 넣었으면 이어 하기
  const resume = [game, paused[difficulty]].find((g) => g && g.level === level && g.difficulty === difficulty && !g.completed && hasProgress(g));

  return (
    <Page>
      <PuzzleHeader title="클래식 스도쿠" subtitle="가로·세로·상자마다 1~9" />
      <Box sx={{ px: 2, pt: 1 }}>
        <Box component="section" aria-labelledby="level-title" sx={{ borderRadius: radius.card, bgcolor: dessert.paper, overflow: "hidden", boxShadow: "0 1px 2px rgba(78,59,46,.06), 0 8px 24px rgba(78,59,46,.06)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 2.5, pt: 2.5, pb: 2, bgcolor: dessert.strawberryMilk }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: dessert.strawberryDeep, letterSpacing: "0.02em" }}>{DIFFICULTY_LABEL[difficulty]}</Typography>
              <Typography id="level-title" component="h2" sx={{ fontSize: 30, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", mt: 0.25 }}>
                레벨 {level}
              </Typography>
              <Typography sx={{ fontSize: 15, color: dessert.cocoaSoft, mt: 0.25 }}>{resume ? "풀던 판이 있어요" : best !== undefined ? `최고 기록 ${formatTime(best)}` : "첫 판을 풀어 봐요"}</Typography>
            </Box>
            <PuzzleThumb kind="sudoku" size={96} />
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
                  aria-label={DIFFICULTY_LABEL[d]}
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
                    {DIFFICULTY_LABEL[d]}
                  </Box>
                  <Box component="span" aria-hidden sx={{ fontSize: 12, fontWeight: 600, color: dessert.cocoaSoft, lineHeight: 1.2, fontVariantNumeric: "tabular-nums" }}>
                    레벨 {(sudokuCleared[d] ?? 0) + 1}
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Button variant="contained" size="large" fullWidth onClick={() => navigate("/play")} sx={{ mt: 2, height: 56, fontSize: 18 }}>
              {resume ? `이어 하기 · ${formatTime(resume.elapsedSeconds)}` : "시작하기"}
            </Button>
          </Box>
        </Box>
        <Typography sx={{ fontSize: 13, color: dessert.cocoaSoft, mt: 1.5, px: 0.5 }}>레벨은 난이도마다 따로 이어져요. 좋아하는 난이도로 계속 풀어 보세요.</Typography>
      </Box>
    </Page>
  );
}
