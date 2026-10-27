import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UndoIcon from "@mui/icons-material/Undo";
import { Box, Button, Dialog, IconButton, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../components/layout/Page";
import ConfirmRestart from "../components/puzzle/ConfirmRestart";
import PuzzleBoard from "../components/puzzle/PuzzleBoard";
import StarChips from "../components/puzzle/StarChips";
import ToolButton from "../components/puzzle/ToolButton";
import { cue } from "../platform/feedback";
import type { SudokuGame } from "../puzzle/sudoku/game";
import { findConflicts } from "../puzzle/sudoku/rules";
import PuzzleThumb from "../components/home/PuzzleThumb";
import NumberPad from "../components/sudoku/NumberPad";
import SudokuCellContent from "../components/sudoku/SudokuCellContent";
import { DIFFICULTY_LABEL } from "../puzzle/sudoku/generator";
import {
  applyHint, conflictsOf, deadCells, findHint, digitCounts, sudokuHintSteps, erase, newlyCompletedCells, formatTime, isFilledButWrong, isGiven, restart, tapCell, tapNumber, tick, toggleMemo, undo, wrongCells,
} from "../puzzle/sudoku/game";
import { boxOf } from "../puzzle/sudoku/rules";
import { sudokuNext, usePuzzleStore } from "../stores/puzzleStore";
import { useIsDaily } from "../components/daily/daily";
import { useDailyClear } from "../components/daily/useDailyClear";
import ClearDialog from "../components/puzzle/ClearDialog";
import { useHint } from "../components/puzzle/useHint";
import { flash, popIn } from "../theme/motion";
import { dessert } from "../theme/palette";

const HINT_REASON = {
  only: "이 칸에는 이 숫자밖에 들어갈 수 없어요.",
  row: "이 가로줄에서 이 숫자가 갈 곳은 여기뿐이에요.",
  col: "이 세로줄에서 이 숫자가 갈 곳은 여기뿐이에요.",
  box: "이 상자에서 이 숫자가 갈 곳은 여기뿐이에요.",
  answer: "단서로 찾기 어려운 칸이라 답을 넣었어요.",
} as const;

const cellName = (index: number) => `${Math.floor(index / 9) + 1}행 ${(index % 9) + 1}열`;

export default function PlayPage() {
  const navigate = useNavigate();
  const sudokuCleared = usePuzzleStore((s) => s.sudokuCleared);
  // 주소에 ?daily가 붙으면 오늘의 퍼즐 스도쿠를 엽니다(레벨과 따로).
  const daily = useIsDaily();
  const game = usePuzzleStore((s) => (daily ? s.dailySudoku : s.game));
  const settings = usePuzzleStore((s) => s.settings);
  const startLevel = usePuzzleStore((s) => s.startLevel);
  const updateGame = usePuzzleStore((s) => (daily ? s.updateDailySudoku : s.updateGame));
  const startDailySudoku = usePuzzleStore((s) => s.startDailySudoku);
  const read = () => (daily ? usePuzzleStore.getState().dailySudoku : usePuzzleStore.getState().game);
  // 시계가 돌 때마다 판 객체가 바뀌므로, 놓인 내용이 바뀔 때만 힌트 단계를 처음부터 셉니다.
  const hint = useHint(game?.values.join(","), 9);
  const dailyClear = useDailyClear(game?.elapsedSeconds ?? 0);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const lastStars = usePuzzleStore((s) => s.lastStars);
  // 줄·상자를 다 채우면 그 칸들이 한 번 반짝입니다(key를 바꿔 매번 다시 재생).
  const [flashCells, setFlashCells] = useState<{ key: number; cells: Set<number> }>({ key: 0, cells: new Set() });

  /** 판을 바꾸고 결과에 맞는 소리·진동·반짝임을 냅니다. */
  const act = (update: (g: SudokuGame) => SudokuGame) => {
    const before = read();
    updateGame(update);
    const after = read();
    if (!before || !after || before === after || before.values === after.values) return;
    if (after.completed) {
      cue("clear");
      return;
    }
    const changed = after.values.findIndex((v, i) => v !== before.values[i]);
    const done = newlyCompletedCells(before, after);
    if (done.length) {
      setFlashCells((f) => ({ key: f.key + 1, cells: new Set(done) }));
      cue("line");
    } else if (changed >= 0 && after.values[changed] && findConflicts(after.values).has(changed)) cue("wrong");
    else cue(changed >= 0 && after.values[changed] ? "place" : "erase");
  };

  // 다 푼 판을 보고 있는 동안에는 새 판으로 바꾸지 않습니다(완성 창에서 '다음 레벨'을 눌러야 넘어감).
  const chosenDifficulty = usePuzzleStore((s) => s.chosenDifficulty);
  useEffect(() => {
    if (daily) {
      usePuzzleStore.getState().ensureDaily();
      startDailySudoku();
      return;
    }
    const current = usePuzzleStore.getState().game;
    const { level, difficulty } = sudokuNext({ sudokuCleared, chosenDifficulty });
    if (!current || (!current.completed && (current.level !== level || current.difficulty !== difficulty))) startLevel(level);
  }, [daily, sudokuCleared, chosenDifficulty, startLevel, startDailySudoku]);

  // 화면을 보고 있을 때만 시간이 갑니다.
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") updateGame((g) => tick(g));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [updateGame]);

  const conflicts = useMemo(() => (game && settings.showConflicts ? conflictsOf(game) : new Set<number>()), [game, settings.showConflicts]);
  const counts = useMemo(() => (game ? digitCounts(game) : []), [game]);
  // 넣을 숫자가 없는 빈칸이 생기면 앞에서 넣은 숫자가 틀렸다는 뜻이라 바로 알려 줍니다(2026-10-26 레벨 13 '답 없음' 신고).
  const dead = useMemo(() => new Set(game ? deadCells(game) : []), [game]);
  // '틀린 칸 보기'는 누른 순간의 판에만 보이고, 숫자를 바꾸면 사라집니다.
  const [checkedValues, setCheckedValues] = useState<readonly number[] | null>(null);
  const showWrong = !!game && checkedValues === game.values;
  const wrong = useMemo(() => new Set(game && showWrong ? wrongCells(game) : []), [game, showWrong]);

  if (!game) return null;

  const mode = settings.inputMode;
  const selected = game.selected;
  const focusDigit = mode === "number-first" ? game.activeNumber : selected !== null ? game.values[selected] : 0;
  const wrongFill = isFilledButWrong(game);
  const stuck = wrongFill || dead.size > 0;

  const cellBackground = (index: number) => {
    if (index === selected) return dessert.strawberryMilk;
    if (conflicts.has(index) || wrong.has(index) || dead.has(index)) return dessert.conflictMilk;
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
        <IconButton aria-label={daily ? "처음 화면으로" : "스도쿠 화면으로"} onClick={() => navigate(daily ? "/" : "/sudoku")}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 1, minWidth: 0 }}>
          <Box>
            <Typography component="h1" sx={{ fontWeight: 700, fontSize: 20, lineHeight: 1.2 }}>
              {daily ? "오늘의 퍼즐" : `레벨 ${game.level}`}
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
          focus={hint.focus}
          size={9}
          label="스도쿠 판"
          onCellTap={(index) => act((g) => tapCell(g, index, mode))}
          cellLabel={(index) => {
            const r = Math.floor(index / 9) + 1;
            const c = (index % 9) + 1;
            const v = game.values[index];
            return `${r}행 ${c}열 ${v ? `${v}${isGiven(game, index) ? " (처음 숫자)" : ""}` : "빈칸"}`;
          }}
          thickEdges={(index) => ({ top: Math.floor(index / 9) % 3 === 0, left: (index % 9) % 3 === 0 })}
          cellColor={cellBackground}
          renderCell={(index) => (
            <>
              {flashCells.cells.has(index) && (
                <Box key={flashCells.key} aria-hidden sx={{ position: "absolute", inset: 0, bgcolor: dessert.mint, ...flash }} />
              )}
              <SudokuCellContent
                value={game.values[index]}
                notes={game.notes[index]}
                given={isGiven(game, index)}
                conflict={(conflicts.has(index) || wrong.has(index)) && !isGiven(game, index)}
              />
            </>
          )}
        />
      </Box>

      <Box aria-live="polite" sx={{ minHeight: 28, px: 2, pt: 1, textAlign: "center" }}>
        {stuck && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 14, color: dessert.conflict, fontWeight: 600 }}>
              {/* 작은 화면에서도 한 줄에 들어가게 짧게 씁니다. 막힌 칸은 연한 빨강 바탕으로 함께 보입니다. */}
              {showWrong ? `틀린 숫자 ${wrong.size}개를 빨갛게 표시했어요` : wrongFill ? "어딘가 틀린 칸이 있어요" : "넣을 숫자가 없는 칸이 있어요"}
            </Typography>
            {!showWrong && (
              <Button size="small" onClick={() => {
                  updateGame((g) => (g.usedCheck ? g : { ...g, usedCheck: true }));
                  setCheckedValues(read()?.values ?? null);
                }} sx={{ fontWeight: 700, color: dessert.conflict, minHeight: 28, py: 0, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                틀린 칸 보기
              </Button>
            )}
          </Box>
        )}
        {!stuck && mode === "number-first" && !game.activeNumber && (
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>숫자를 먼저 고른 뒤 칸을 눌러 주세요.</Typography>
        )}
      </Box>

      <Box sx={{ px: 1.5, display: "flex", gap: 1, pb: 1 }}>
        {/* 다시 하기는 되돌릴 수 없어 왼쪽에 떨어뜨려 두고 확인 창을 거칩니다. */}
        <ToolButton label="다시 하기" compact onClick={() => setConfirmRestart(true)} icon={<RestartAltIcon sx={{ fontSize: 20 }} />} />
        <Box sx={{ flex: 1 }} />
        {hint.button(() =>
          hint.give(
            () => findHint(game),
            (h) => sudokuHintSteps(game, h),
            (h) => act((g) => applyHint(g, h)),
            (h) => (h.kind === "wrong" ? `${cellName(h.index)} 숫자가 틀려서 지웠어요.` : `${cellName(h.index)}에 ${h.digit}: ${HINT_REASON[h.reason]}`),
          ),
        )}
        <ToolButton label="되돌리기" onClick={() => act(undo)} icon={<UndoIcon sx={{ fontSize: 18 }} />} />
        {/* 메모는 작게 숨겨 둡니다(설계서). 켜면 버튼과 숫자 패드가 민트색으로 바뀝니다. 이름 길이를 바꾸지 않아 줄 너비가 그대로입니다. */}
        <ToolButton
          label="메모"
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
          onNumber={(digit) => act((g) => tapNumber(g, digit, mode))}
          onErase={() => act(erase)}
        />
      </Box>

      <ConfirmRestart
        open={confirmRestart}
        detail="넣은 숫자와 메모가 모두 지워지고 시간도 0:00으로 돌아갑니다. 문제는 그대로입니다."
        onCancel={() => setConfirmRestart(false)}
        onConfirm={() => {
          updateGame(restart);
          setConfirmRestart(false);
        }}
      />

      {daily && (
        <ClearDialog
          open={game.completed}
          art={<PuzzleThumb kind="sudoku" size={96} />}
          title={dailyClear.title}
          detail={dailyClear.detail}
          nextLabel={dailyClear.nextLabel}
          onNext={dailyClear.onNext}
          share={dailyClear.share}
        />
      )}
      {hint.toast}
      <Dialog open={!daily && game.completed} slotProps={{ paper: { sx: { width: "min(360px, calc(100% - 32px))", p: 3, textAlign: "center", bgcolor: dessert.cream } } }}>
        <Box sx={{ display: "flex", justifyContent: "center", ...popIn }}>
          <PuzzleThumb kind="sudoku" size={96} />
        </Box>
        <Typography component="h2" sx={{ fontSize: 22, fontWeight: 800, mt: 1 }}>
          레벨 {game.level} 완성!
        </Typography>
        <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
          걸린 시간 {formatTime(game.elapsedSeconds)}
        </Typography>
        <StarChips lines={daily ? null : lastStars} />
        <Button variant="contained" size="large" fullWidth onClick={goNext} sx={{ mt: 3, height: 52 }}>
          다음 레벨
        </Button>
        <Button fullWidth onClick={() => { goNext(); navigate("/sudoku"); }} sx={{ mt: 1, color: "text.secondary" }}>
          스도쿠 화면
        </Button>
      </Dialog>
    </Page>
  );
}

