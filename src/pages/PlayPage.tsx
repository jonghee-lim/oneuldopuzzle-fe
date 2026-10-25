import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UndoIcon from "@mui/icons-material/Undo";
import { Box, Button, ButtonBase, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../components/layout/Page";
import PuzzleBoard from "../components/puzzle/PuzzleBoard";
import DessertArt from "../components/dessert/DessertArt";
import NumberPad from "../components/sudoku/NumberPad";
import SudokuCellContent from "../components/sudoku/SudokuCellContent";
import { DIFFICULTY_LABEL, difficultyForLevel } from "../puzzle/sudoku/generator";
import {
  conflictsOf, digitCounts, erase, formatTime, isFilledButWrong, isGiven, restart, tapCell, tapNumber, tick, toggleMemo, undo,
} from "../puzzle/sudoku/game";
import { boxOf } from "../puzzle/sudoku/rules";
import { usePuzzleStore } from "../stores/puzzleStore";
import { dessert, dessertForLevel } from "../theme/palette";
import { radius } from "../theme/shape";

export default function PlayPage() {
  const navigate = useNavigate();
  const clearedLevel = usePuzzleStore((s) => s.clearedLevel);
  const game = usePuzzleStore((s) => s.game);
  const settings = usePuzzleStore((s) => s.settings);
  const startLevel = usePuzzleStore((s) => s.startLevel);
  const updateGame = usePuzzleStore((s) => s.updateGame);
  const [confirmRestart, setConfirmRestart] = useState(false);

  // 다 푼 판을 보고 있는 동안에는 새 판으로 바꾸지 않습니다(완성 창에서 '다음 레벨'을 눌러야 넘어감).
  const chosenDifficulty = usePuzzleStore((s) => s.chosenDifficulty);
  useEffect(() => {
    const current = usePuzzleStore.getState().game;
    const level = clearedLevel + 1;
    const difficulty = chosenDifficulty ?? difficultyForLevel(level);
    if (!current || (!current.completed && (current.level !== level || current.difficulty !== difficulty))) startLevel(level);
  }, [clearedLevel, chosenDifficulty, startLevel]);

  // 화면을 보고 있을 때만 시간이 갑니다.
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") updateGame((g) => tick(g));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [updateGame]);

  const conflicts = useMemo(() => (game && settings.showConflicts ? conflictsOf(game) : new Set<number>()), [game, settings.showConflicts]);
  const counts = useMemo(() => (game ? digitCounts(game) : []), [game]);

  if (!game) return null;

  const mode = settings.inputMode;
  const selected = game.selected;
  const focusDigit = mode === "number-first" ? game.activeNumber : selected !== null ? game.values[selected] : 0;
  const wrongFill = isFilledButWrong(game);

  const cellBackground = (index: number) => {
    if (index === selected) return dessert.strawberryMilk;
    if (conflicts.has(index)) return dessert.conflictMilk;
    if (settings.highlightSame && focusDigit && game.values[index] === focusDigit) return dessert.mint;
    if (
      selected !== null &&
      (Math.floor(index / 9) === Math.floor(selected / 9) || index % 9 === selected % 9 || boxOf(index) === boxOf(selected))
    ) {
      return dessert.creamDeep;
    }
    return dessert.paper;
  };

  const goNext = () => {
    startLevel(game.level + 1);
  };

  return (
    <Page>
      <Box component="header" sx={{ display: "flex", alignItems: "center", px: 1, pt: "calc(env(safe-area-inset-top) + 8px)", pb: 0.5 }}>
        <IconButton aria-label="처음 화면으로" onClick={() => navigate("/")}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 1, minWidth: 0 }}>
          <DessertArt id={dessertForLevel(game.level).id} size={30} />
          <Box>
            <Typography component="h1" sx={{ fontWeight: 700, fontSize: 20, lineHeight: 1.2 }}>
              레벨 {game.level}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.3 }}>{DIFFICULTY_LABEL[game.difficulty]}</Typography>
          </Box>
        </Box>
        <Typography aria-label="걸린 시간" sx={{ width: 56, textAlign: "right", pr: 1, fontVariantNumeric: "tabular-nums", color: "text.secondary", fontWeight: 600 }}>
          {formatTime(game.elapsedSeconds)}
        </Typography>
      </Box>

      <Box sx={{ px: 1.5, pt: 1 }}>
        <PuzzleBoard
          size={9}
          label="스도쿠 판"
          onCellTap={(index) => updateGame((g) => tapCell(g, index, mode))}
          cellLabel={(index) => {
            const r = Math.floor(index / 9) + 1;
            const c = (index % 9) + 1;
            const v = game.values[index];
            return `${r}행 ${c}열 ${v ? `${v}${isGiven(game, index) ? " (처음 숫자)" : ""}` : "빈칸"}`;
          }}
          thickEdges={(index) => ({ top: Math.floor(index / 9) % 3 === 0, left: (index % 9) % 3 === 0 })}
          cellColor={cellBackground}
          renderCell={(index) => (
            <SudokuCellContent
              value={game.values[index]}
              notes={game.notes[index]}
              given={isGiven(game, index)}
              conflict={conflicts.has(index) && !isGiven(game, index)}
            />
          )}
        />
      </Box>

      <Box aria-live="polite" sx={{ minHeight: 28, px: 2, pt: 1, textAlign: "center" }}>
        {wrongFill && <Typography sx={{ fontSize: 14, color: dessert.conflict, fontWeight: 600 }}>다 채웠는데 어딘가 틀린 칸이 있어요.</Typography>}
        {!wrongFill && mode === "number-first" && !game.activeNumber && (
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>숫자를 먼저 고른 뒤 칸을 눌러 주세요.</Typography>
        )}
      </Box>

      <Box sx={{ px: 1.5, display: "flex", gap: 1, pb: 1 }}>
        {/* 다시 하기는 되돌릴 수 없어 왼쪽에 떨어뜨려 두고 확인 창을 거칩니다. */}
        <ToolButton label="다시 하기" onClick={() => setConfirmRestart(true)} icon={<RestartAltIcon sx={{ fontSize: 18 }} />} />
        <Box sx={{ flex: 1 }} />
        <ToolButton label="되돌리기" onClick={() => updateGame(undo)} icon={<UndoIcon sx={{ fontSize: 18 }} />} />
        {/* 메모는 작게 숨겨 둡니다(설계서). 켜면 숫자 패드가 민트색으로 바뀝니다. */}
        <ToolButton
          label={game.memoMode ? "메모 켜짐" : "메모"}
          active={game.memoMode}
          onClick={() => updateGame(toggleMemo)}
          icon={<EditOutlinedIcon sx={{ fontSize: 18 }} />}
        />
      </Box>

      <Box sx={{ px: 1.5, mt: "auto" }}>
        <NumberPad
          counts={counts}
          memoMode={game.memoMode}
          activeNumber={mode === "number-first" ? game.activeNumber : null}
          onNumber={(digit) => updateGame((g) => tapNumber(g, digit, mode))}
          onErase={() => updateGame(erase)}
        />
      </Box>

      <Dialog
        open={confirmRestart}
        onClose={() => setConfirmRestart(false)}
        aria-labelledby="restart-title"
        slotProps={{ paper: { sx: { width: "min(360px, calc(100% - 32px))", bgcolor: dessert.cream } } }}
      >
        <DialogTitle id="restart-title" sx={{ fontWeight: 700 }}>처음부터 다시 할까요?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.secondary" }}>넣은 숫자와 메모가 모두 지워지고 시간도 0:00으로 돌아갑니다. 문제는 그대로입니다.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmRestart(false)} sx={{ color: "text.secondary" }}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              updateGame(restart);
              setConfirmRestart(false);
            }}
          >
            다시 하기
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={game.completed} slotProps={{ paper: { sx: { width: "min(360px, calc(100% - 32px))", p: 3, textAlign: "center", bgcolor: dessert.cream } } }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <DessertArt id={dessertForLevel(game.level).id} size={112} />
        </Box>
        <Typography component="h2" sx={{ fontSize: 22, fontWeight: 800, mt: 1 }}>
          레벨 {game.level} 완성!
        </Typography>
        <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
          걸린 시간 {formatTime(game.elapsedSeconds)}
        </Typography>
        <Button variant="contained" size="large" fullWidth onClick={goNext} sx={{ mt: 3, height: 52 }}>
          다음 레벨
        </Button>
        <Button fullWidth onClick={() => { goNext(); navigate("/"); }} sx={{ mt: 1, color: "text.secondary" }}>
          처음 화면
        </Button>
      </Dialog>
    </Page>
  );
}

function ToolButton({ label, icon, onClick, active = false }: { label: string; icon: ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <ButtonBase
      onClick={onClick}
      disableRipple
      aria-pressed={active}
      sx={{
        gap: 0.5,
        px: 1.25,
        height: 40,
        borderRadius: radius.pill,
        fontSize: 14,
        fontWeight: 600,
        color: active ? "#FFFFFF" : dessert.cocoaSoft,
        bgcolor: active ? dessert.mintDeep : dessert.creamDeep,
        "&.Mui-focusVisible": { outline: `3px solid ${dessert.strawberryDeep}`, outlineOffset: "2px" },
      }}
    >
      {icon}
      <span className="tool-label">{label}</span>
    </ButtonBase>
  );
}
