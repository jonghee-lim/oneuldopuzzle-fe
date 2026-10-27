import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UndoIcon from "@mui/icons-material/Undo";
import { Box, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import DessertArt from "../components/dessert/DessertArt";
import Page from "../components/layout/Page";
import PuzzleHeader from "../components/layout/PuzzleHeader";
import ClearDialog from "../components/puzzle/ClearDialog";
import ConfirmRestart from "../components/puzzle/ConfirmRestart";
import PuzzleBoard from "../components/puzzle/PuzzleBoard";
import ToolButton from "../components/puzzle/ToolButton";
import { cue } from "../platform/feedback";
import { restartSlide, swipeSlide, tapSlide, tickSlide, undoSlide } from "../puzzle/sliding/game";
import { slideHint } from "../puzzle/sliding/hint";
import { movableCells } from "../puzzle/sliding/rules";
import { formatTime } from "../puzzle/sudoku/game";
import { usePuzzleStore } from "../stores/puzzleStore";
import { useIsDaily } from "../components/daily/daily";
import { useDailyClear } from "../components/daily/useDailyClear";
import { useHint } from "../components/puzzle/useHint";
import { dessert } from "../theme/palette";
import { radius } from "../theme/shape";

/** 슬라이딩 퍼즐(설계서 보너스): 빈칸과 같은 줄의 조각을 누르면 밀립니다. 조각은 미끄러지듯 움직입니다. */
export default function SlidingPage() {
  const daily = useIsDaily();
  const game = usePuzzleStore((s) => (daily ? s.dailySlide : s.slideGame));
  const cleared = usePuzzleStore((s) => s.slideCleared);
  const startSlide = usePuzzleStore((s) => s.startSlide);
  const updateSlide = usePuzzleStore((s) => (daily ? s.updateDailySlide : s.updateSlide));
  const startDailySlide = usePuzzleStore((s) => s.startDailySlide);
  const hint = useHint();
  const dailyClear = useDailyClear(game?.elapsedSeconds ?? 0);
  const lastScore = usePuzzleStore((s) => s.lastScore);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (daily) {
      startDailySlide();
      return;
    }
    const current = usePuzzleStore.getState().slideGame;
    if (!current || (!current.solved && current.level !== cleared + 1)) startSlide();
  }, [daily, cleared, startSlide, startDailySlide]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") updateSlide((g) => tickSlide(g));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [updateSlide]);

  const movable = useMemo(() => (game ? movableCells(game.board, game.puzzle.size) : new Set<number>()), [game]);
  if (!game) return null;
  const { size, minMoves } = game.puzzle;
  const pct = 100 / size;

  const tiles = (
    <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {game.board.map((n, i) =>
        n === 0 ? null : (
          <Box
            key={n}
            aria-hidden
            sx={{
              position: "absolute",
              left: `calc(${(i % size) * pct}% + 4px)`,
              top: `calc(${Math.floor(i / size) * pct}% + 4px)`,
              width: `calc(${pct}% - 8px)`,
              height: `calc(${pct}% - 8px)`,
              borderRadius: radius.item,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // 제자리에 온 조각은 민트로 바뀌어 얼마나 맞췄는지 한눈에 보입니다.
              bgcolor: n === i + 1 ? dessert.mint : dessert.strawberryMilk,
              color: dessert.cocoa,
              boxShadow: `inset 0 -4px 0 ${n === i + 1 ? "#9FD6C2" : "#F2C4CF"}`,
              fontSize: size === 3 ? "clamp(28px, 11vw, 48px)" : "clamp(22px, 8vw, 36px)",
              fontWeight: 800,
              fontVariantNumeric: "tabular-nums",
              transition: "left 140ms ease-out, top 140ms ease-out, background-color 200ms",
              "@media (prefers-reduced-motion: reduce)": { transition: "none" },
            }}
          >
            {n}
          </Box>
        ),
      )}
    </Box>
  );

  return (
    <Page>
      <PuzzleHeader
        title={daily ? "오늘의 퍼즐" : `레벨 ${game.level}`}
        subtitle={`슬라이딩 · ${size}×${size}`}
        art={<DessertArt id="cookie" size={30} />}
        right={<span aria-label="이동 수">{game.moves}수</span>}
      />
      <Box sx={{ px: 2, pt: 0.5, textAlign: "center" }}>
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          조각을 빈칸 쪽으로 쓸거나 눌러서 1부터 순서대로 맞춰 주세요.
          {minMoves !== null && ` 최소 ${minMoves}수.`}
        </Typography>
      </Box>
      <Box sx={{ px: 1.5, pt: 1.5 }}>
        <PuzzleBoard
          size={size}
          label={`슬라이딩 판 ${size}×${size}`}
          onCellTap={(index) => {
            if (!movable.has(index)) return;
            updateSlide((g) => tapSlide(g, index));
            cue(usePuzzleStore.getState().slideGame?.solved ? "clear" : "place");
          }}
          cellLabel={(index) => {
            const n = game.board[index];
            return `${Math.floor(index / size) + 1}행 ${(index % size) + 1}열 ${n ? `${n}번 조각${movable.has(index) ? ", 밀 수 있음" : ""}` : "빈칸"}`;
          }}
          onCellSwipe={(index, dir) => {
            const before = usePuzzleStore.getState().slideGame;
            updateSlide((g) => swipeSlide(g, index, dir));
            const after = usePuzzleStore.getState().slideGame;
            if (after !== before) cue(after?.solved ? "clear" : "place");
          }}
          cellColor={() => dessert.creamDeep}
          renderCell={() => null}
          overlay={tiles}
        />
      </Box>
      <Box sx={{ px: 2, pt: 1, minHeight: 28, textAlign: "center" }}>
        <Typography sx={{ fontSize: 14, color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
          제자리 {game.board.filter((n, i) => n === i + 1).length} / {size * size - 1} · {formatTime(game.elapsedSeconds)}
        </Typography>
      </Box>
      <Box sx={{ px: 1.5, pt: 1, display: "flex", gap: 1 }}>
        <ToolButton label="다시 하기" onClick={() => setConfirm(true)} icon={<RestartAltIcon sx={{ fontSize: 18 }} />} />
        <Box sx={{ flex: 1 }} />
        {hint.button(() =>
          hint.give(
            () => slideHint(game.board, size),
            (index) => {
              updateSlide((g) => tapSlide(g, index));
              cue(usePuzzleStore.getState()[daily ? "dailySlide" : "slideGame"]?.solved ? "clear" : "place");
            },
            (index) => `${game.board[index]}번 조각을 밀었어요.`,
          ),
        )}
        <ToolButton label="되돌리기" onClick={() => updateSlide(undoSlide)} icon={<UndoIcon sx={{ fontSize: 18 }} />} />
      </Box>

      <ConfirmRestart
        open={confirm}
        detail="조각이 처음 자리로 돌아가고 이동 수와 시간도 0으로 돌아갑니다."
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          updateSlide(restartSlide);
          setConfirm(false);
        }}
      />
      <ClearDialog
        open={game.solved}
        art={<DessertArt id="cookie" size={96} />}
        title={daily ? dailyClear.title : `레벨 ${game.level} 완성!`}
        detail={daily ? dailyClear.detail : `${game.moves}수 · ${formatTime(game.elapsedSeconds)}${minMoves !== null ? ` · 최소 ${minMoves}수` : ""}`}
        nextLabel={daily ? dailyClear.nextLabel : "다음 레벨"}
        onNext={daily ? dailyClear.onNext : () => startSlide()}
        score={daily ? null : lastScore}
      />
      {hint.toast}
    </Page>
  );
}
