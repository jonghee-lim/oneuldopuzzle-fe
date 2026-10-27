import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UndoIcon from "@mui/icons-material/Undo";
import { Box, ButtonBase, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import DessertArt from "../components/dessert/DessertArt";
import Page from "../components/layout/Page";
import PuzzleHeader from "../components/layout/PuzzleHeader";
import ClearDialog from "../components/puzzle/ClearDialog";
import ConfirmRestart from "../components/puzzle/ConfirmRestart";
import PuzzleBoard from "../components/puzzle/PuzzleBoard";
import ToolButton from "../components/puzzle/ToolButton";
import { cue } from "../platform/feedback";
import { applyBlockHint, blockHintSteps, canPlace, findBlockHint, occupancy, restartBlocks, selectBlock, tapBlockCell, tickBlocks, undoBlocks } from "../puzzle/blocks/game";
import type { Shape } from "../puzzle/blocks/rules";
import { formatTime } from "../puzzle/sudoku/game";
import { usePuzzleStore } from "../stores/puzzleStore";
import { useIsDaily } from "../components/daily/daily";
import { useDailyClear } from "../components/daily/useDailyClear";
import { useHint } from "../components/puzzle/useHint";
import { ZONE_COLORS, dessert } from "../theme/palette";
import { radius } from "../theme/shape";

/** 블록 채우기(설계서 보너스): 아래 블록을 고르고 판의 칸을 누르면 블록의 점 찍힌 칸이 거기에 놓입니다. */
export default function BlocksPage() {
  const daily = useIsDaily();
  const game = usePuzzleStore((s) => (daily ? s.dailyBlocks : s.blockGame));
  const cleared = usePuzzleStore((s) => s.blockCleared);
  const startBlocks = usePuzzleStore((s) => s.startBlocks);
  const updateBlocks = usePuzzleStore((s) => (daily ? s.updateDailyBlocks : s.updateBlocks));
  const startDailyBlocks = usePuzzleStore((s) => s.startDailyBlocks);
  const hint = useHint(game?.placed.join(","), game?.puzzle.size);
  const dailyClear = useDailyClear(game?.elapsedSeconds ?? 0);
  const lastStars = usePuzzleStore((s) => s.lastStars);
  const [confirm, setConfirm] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (daily) {
      startDailyBlocks();
      return;
    }
    const current = usePuzzleStore.getState().blockGame;
    if (!current || (!current.solved && current.level !== cleared + 1)) startBlocks();
  }, [daily, cleared, startBlocks, startDailyBlocks]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") updateBlocks((g) => tickBlocks(g));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [updateBlocks]);

  const occ = useMemo(() => (game ? occupancy(game) : []), [game]);
  // 고른 블록을 놓을 수 있는 칸(점 찍힌 칸이 갈 자리)에 민트 점을 찍어 줍니다.
  const fits = useMemo(() => new Set(game ? occ.flatMap((v, i) => (v === -1 && canPlace(game, i, occ) ? [i] : [])) : []), [game, occ]);
  if (!game) return null;
  const { size, shapes } = game.puzzle;
  const left = game.placed.filter((a) => a === null).length;

  return (
    <Page>
      <PuzzleHeader
        title={daily ? "오늘의 퍼즐" : `레벨 ${game.level}`}
        subtitle={`블록 채우기 · ${size}×${size}`}
        art={<DessertArt id="pudding" size={30} />}
        right={<span aria-label="걸린 시간">{formatTime(game.elapsedSeconds)}</span>}
      />
      <Box sx={{ px: 2, pt: 0.5, textAlign: "center" }}>
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>블록을 고르고 민트 점 칸을 누르면 블록의 ● 칸이 거기 놓여요.</Typography>
      </Box>
      <Box sx={{ px: 1.5, pt: 1.5 }}>
        <PuzzleBoard
          focus={hint.focus}
          size={size}
          label={`블록 채우기 판 ${size}×${size}`}
          onCellTap={(index) => {
            const { game: next, result } = tapBlockCell(game, index);
            if (result === "blocked") {
              cue("wrong");
              setNotice("여기에는 들어가지 않아요. 민트 점이 있는 칸을 눌러 주세요.");
              return;
            }
            setNotice(null);
            if (result === "none") return;
            updateBlocks(() => next);
            cue(next.solved ? "clear" : result === "placed" ? "place" : "erase");
          }}
          cellLabel={(index) =>
            `${Math.floor(index / size) + 1}행 ${(index % size) + 1}열 ${occ[index] === -1 ? (fits.has(index) ? "빈칸, 놓을 수 있음" : "빈칸") : `블록 ${occ[index] + 1}, 누르면 빼기`}`
          }
          cellColor={(index) => (occ[index] === -1 ? (fits.has(index) ? dessert.mintMilk : dessert.paper) : ZONE_COLORS[occ[index] % ZONE_COLORS.length])}
          thickEdges={(index) => {
            const r = Math.floor(index / size);
            const c = index % size;
            const o = occ[index];
            return {
              top: r > 0 && o !== -1 && occ[index - size] !== o,
              left: c > 0 && o !== -1 && occ[index - 1] !== o,
              bottom: r < size - 1 && o !== -1 && occ[index + size] !== o,
              right: c < size - 1 && o !== -1 && occ[index + 1] !== o,
            };
          }}
          renderCell={(index) =>
            fits.has(index) ? <Box aria-hidden sx={{ width: 10, height: 10, borderRadius: radius.pill, bgcolor: dessert.mintDeep }} /> : null
          }
        />
      </Box>
      <Box aria-live="polite" sx={{ px: 2, pt: 1, minHeight: 28, textAlign: "center" }}>
        <Typography sx={{ fontSize: 14, color: notice ? dessert.conflict : "text.secondary", fontWeight: notice ? 600 : 400 }}>
          {notice ?? `남은 블록 ${left}개`}
        </Typography>
      </Box>

      <Box role="group" aria-label="블록" sx={{ px: 1.5, pt: 1, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
        {shapes.map((shape, k) => {
          const used = game.placed[k] !== null;
          const selected = game.selected === k;
          return (
            <ButtonBase
              key={k}
              disabled={used}
              aria-pressed={selected}
              aria-label={`블록 ${k + 1}, ${shape.length}칸${used ? ", 놓음" : selected ? ", 고름" : ""}`}
              onClick={() => {
                cue("tap");
                setNotice(null);
                updateBlocks((g) => selectBlock(g, k));
              }}
              sx={{
                p: 1,
                minWidth: 56,
                minHeight: 56,
                borderRadius: radius.item,
                bgcolor: selected ? dessert.mintMilk : dessert.paper,
                outline: selected ? `3px solid ${dessert.mintDeep}` : `1px solid ${dessert.line}`,
                outlineOffset: selected ? "-3px" : "-1px",
                opacity: used ? 0.25 : 1,
                "&.Mui-focusVisible": { outline: `3px solid ${dessert.strawberryDeep}` },
              }}
            >
              <ShapeView shape={shape} color={ZONE_COLORS[k % ZONE_COLORS.length]} />
            </ButtonBase>
          );
        })}
      </Box>
      <Box sx={{ px: 1.5, pt: 2, display: "flex", gap: 1, mt: "auto" }}>
        <ToolButton label="다시 하기" onClick={() => setConfirm(true)} icon={<RestartAltIcon sx={{ fontSize: 18 }} />} />
        <Box sx={{ flex: 1 }} />
        {hint.button(() =>
          hint.give(
            () => findBlockHint(game),
            (h) => blockHintSteps(game, h),
            (h) => {
              const next = applyBlockHint(game, h);
              updateBlocks(() => next);
              if (next.solved) cue("clear");
            },
            (h) => (h.remove ? `${h.piece + 1}번 블록은 자리가 아니라서 뺐어요.` : `${h.piece + 1}번 블록을 제자리에 놓았어요.`),
          ),
        )}
        <ToolButton label="되돌리기" onClick={() => updateBlocks(undoBlocks)} icon={<UndoIcon sx={{ fontSize: 18 }} />} />
      </Box>

      <ConfirmRestart
        open={confirm}
        detail="놓은 블록이 모두 아래로 돌아가고 시간도 0:00으로 돌아갑니다."
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          updateBlocks(restartBlocks);
          setConfirm(false);
        }}
      />
      <ClearDialog
        open={game.solved}
        art={<DessertArt id="pudding" size={96} />}
        title={daily ? dailyClear.title : `레벨 ${game.level} 완성!`}
        detail={daily ? dailyClear.detail : `걸린 시간 ${formatTime(game.elapsedSeconds)}`}
        nextLabel={daily ? dailyClear.nextLabel : "다음 레벨"}
        onNext={daily ? dailyClear.onNext : () => startBlocks()}
        share={daily ? dailyClear.share : undefined}
        stars={daily ? null : lastStars}
      />
      {hint.toast}
    </Page>
  );
}

/** 블록 모양 그림. 점 찍힌 칸이 기준 칸(판에서 누른 칸에 오는 칸)입니다. */
function ShapeView({ shape, color }: { shape: Shape; color: string }) {
  const minC = Math.min(...shape.map(([, c]) => c));
  const rows = Math.max(...shape.map(([r]) => r)) + 1;
  const cols = Math.max(...shape.map(([, c]) => c)) - minC + 1;
  const unit = 14;
  return (
    <Box aria-hidden component="svg" viewBox={`0 0 ${cols * unit} ${rows * unit}`} sx={{ width: cols * unit, height: rows * unit, display: "block" }}>
      {shape.map(([r, c], k) => (
        <g key={k}>
          <rect x={(c - minC) * unit + 0.5} y={r * unit + 0.5} width={unit - 1} height={unit - 1} rx="2.5" fill={color} stroke={dessert.cocoaSoft} strokeWidth="1" />
          {k === 0 && <circle cx={(c - minC) * unit + unit / 2} cy={r * unit + unit / 2} r="2.6" fill={dessert.cocoa} />}
        </g>
      ))}
    </Box>
  );
}
