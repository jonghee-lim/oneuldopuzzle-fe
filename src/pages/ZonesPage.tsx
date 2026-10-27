import CloseIcon from "@mui/icons-material/Close";
import { needsStart, useTierNext } from "../components/tier/useTier";
import { TIER_ROUTE } from "../components/tier/tierRoutes";
import { TIER_LABEL } from "../puzzle/core/tier";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UndoIcon from "@mui/icons-material/Undo";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import DessertArt from "../components/dessert/DessertArt";
import Page from "../components/layout/Page";
import PuzzleHeader from "../components/layout/PuzzleHeader";
import { useGuide } from "../components/guide/useGuide";
import ClearDialog from "../components/puzzle/ClearDialog";
import ConfirmRestart from "../components/puzzle/ConfirmRestart";
import PuzzleBoard from "../components/puzzle/PuzzleBoard";
import ToolButton from "../components/puzzle/ToolButton";
import { cue } from "../platform/feedback";
import { formatTime } from "../puzzle/sudoku/game";
import { applyZoneHint, blockedZoneCells, findZoneHint, zoneHintSteps, placedOf, restartZone, setZoneTool, tapZoneCell, tickZone, undoZone, zoneGameConflicts, type ZoneGame, type ZoneTool } from "../puzzle/zones/game";
import { usePuzzleStore } from "../stores/puzzleStore";
import { useIsDaily } from "../components/daily/daily";
import { useDailyClear } from "../components/daily/useDailyClear";
import { useHint } from "../components/puzzle/useHint";
import { ZONE_COLORS, dessert } from "../theme/palette";

/** 색깔 구역 퍼즐(설계서 보너스): 줄·칸줄·색깔 구역마다 마카롱 하나, 서로 붙지 않게 */
export default function ZonesPage() {
  const daily = useIsDaily();
  const game = usePuzzleStore((s) => (daily ? s.dailyZone : s.zoneGame));
  const next = useTierNext("zones");
  const startZone = usePuzzleStore((s) => s.startZone);
  const updateZone = usePuzzleStore((s) => (daily ? s.updateDailyZone : s.updateZone));
  const startDailyZone = usePuzzleStore((s) => s.startDailyZone);
  const read = () => (daily ? usePuzzleStore.getState().dailyZone : usePuzzleStore.getState().zoneGame);
  const hint = useHint(game?.cells.join(""), game?.puzzle.size);
  const guide = useGuide("zones");
  const dailyClear = useDailyClear(game?.elapsedSeconds ?? 0);
  const lastStars = usePuzzleStore((s) => s.lastStars);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (daily) {
      startDailyZone();
      return;
    }
    const current = usePuzzleStore.getState().zoneGame;
    if (needsStart(current, !!current?.solved, next)) startZone();
  }, [daily, next, startZone, startDailyZone]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") updateZone((g) => tickZone(g));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [updateZone]);

  const conflicts = useMemo(() => (game ? zoneGameConflicts(game) : new Set<number>()), [game]);
  const autoCross = usePuzzleStore((s) => s.settings.autoCross);
  const blocked = useMemo(() => (game && autoCross ? blockedZoneCells(game) : new Set<number>()), [game, autoCross]);
  if (!game) return null;
  const { size, regions } = game.puzzle;
  const placed = placedOf(game).length;

  const act = (update: (g: ZoneGame) => ZoneGame, index: number) => {
    updateZone(update);
    const after = read();
    if (!after) return;
    if (after.solved) cue("clear");
    else if (after.cells[index] === 2) cue(zoneGameConflicts(after).has(index) ? "wrong" : "place");
    else cue("tap");
  };

  return (
    <Page>
      <PuzzleHeader help={guide.button}
        title={daily ? "오늘의 퍼즐" : `레벨 ${game.level}`}
        subtitle={`색깔 구역 · ${daily ? "" : `${TIER_LABEL[game.tier ?? "easy"]} · `}${size}×${size}`}
        back={daily ? undefined : { to: TIER_ROUTE.zones, label: "색깔 구역 화면으로" }}
        art={<DessertArt id="macaron" size={30} />}
        right={<span aria-label="걸린 시간">{formatTime(game.elapsedSeconds)}</span>}
      />
      <Box sx={{ px: 2, pt: 0.5, textAlign: "center" }}>
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          가로줄·세로줄·색깔 구역마다 마카롱 <b>하나씩</b>. 마카롱끼리는 대각선으로도 붙을 수 없어요.
        </Typography>
      </Box>
      <Box sx={{ px: 1.5, pt: 1.5 }}>
        <PuzzleBoard
          focus={hint.focus}
          size={size}
          label={`색깔 구역 판 ${size}×${size}`}
          onCellTap={(index) => act((g) => tapZoneCell(g, index), index)}
          cellLabel={(index) => {
            const state = game.cells[index] === 2 ? "마카롱" : game.cells[index] === 1 ? "X 표시" : blocked.has(index) ? "막힌 칸" : "빈칸";
            return `${Math.floor(index / size) + 1}행 ${(index % size) + 1}열, ${regions[index] + 1}번 구역, ${state}${conflicts.has(index) ? ", 겹침" : ""}`;
          }}
          cellColor={(index) => (conflicts.has(index) ? dessert.conflictMilk : ZONE_COLORS[regions[index] % ZONE_COLORS.length])}
          thickEdges={(index) => {
            const r = Math.floor(index / size);
            const c = index % size;
            return { top: r > 0 && regions[index - size] !== regions[index], left: c > 0 && regions[index - 1] !== regions[index] };
          }}
          renderCell={(index) =>
            game.cells[index] === 2 ? (
              <Box sx={{ width: "72%", display: "flex", justifyContent: "center", outline: conflicts.has(index) ? `3px solid ${dessert.conflict}` : "none", borderRadius: "50%" }}>
                <DessertArt id="macaron" size="100%" />
              </Box>
            ) : game.cells[index] === 1 ? (
              <CloseIcon aria-hidden sx={{ fontSize: size > 6 ? 18 : 24, color: dessert.cocoaSoft, opacity: 0.7 }} />
            ) : blocked.has(index) ? (
              <CloseIcon aria-hidden sx={{ fontSize: size > 6 ? 12 : 16, color: dessert.cocoaSoft, opacity: 0.35 }} />
            ) : null
          }
        />
      </Box>
      <Box aria-live="polite" sx={{ px: 2, pt: 1, minHeight: 28, textAlign: "center" }}>
        {conflicts.size > 0 ? (
          <Typography sx={{ fontSize: 14, color: dessert.conflict, fontWeight: 600 }}>같은 줄·구역에 있거나 붙어 있는 마카롱이 있어요.</Typography>
        ) : (
          <Typography sx={{ fontSize: 14, color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
            마카롱 {placed} / {size}
          </Typography>
        )}
      </Box>
      <Box sx={{ px: 1.5, pt: 1, display: "flex", gap: 1 }}>
        <ToolButton label="다시 하기" onClick={() => setConfirm(true)} icon={<RestartAltIcon sx={{ fontSize: 18 }} />} />
        <Box sx={{ flex: 1 }} />
        {hint.button(() =>
          hint.give(
            () => findZoneHint(game),
            (h) => zoneHintSteps(game, h),
            (h) => act((g) => applyZoneHint(g, h), h.index),
            (h) => `${Math.floor(h.index / size) + 1}행 ${(h.index % size) + 1}열 ${h.remove ? "마카롱은 자리가 아니라서 뺐어요." : "에 마카롱을 놓았어요."}`,
          ),
        )}
        <ToolButton label="되돌리기" onClick={() => updateZone(undoZone)} icon={<UndoIcon sx={{ fontSize: 18 }} />} />
      </Box>
      <Box sx={{ px: 1.5, pt: 2, mt: "auto" }}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={game.tool}
          onChange={(_, tool: ZoneTool | null) => tool && updateZone((g) => setZoneTool(g, tool))}
          aria-label="도구"
        >
          <ToggleButton value="place" sx={{ height: 60, gap: 1, fontSize: 17, fontWeight: 700 }}>
            <DessertArt id="macaron" size={26} /> 마카롱 놓기
          </ToggleButton>
          <ToggleButton value="cross" sx={{ height: 60, gap: 1, fontSize: 17, fontWeight: 700 }}>
            <CloseIcon /> X 표시
          </ToggleButton>
        </ToggleButtonGroup>
        <Typography sx={{ mt: 1, fontSize: 13, color: "text.secondary", textAlign: "center" }}>X는 ‘여긴 아니다’ 표시예요. 같은 칸을 한 번 더 누르면 지워져요.</Typography>
      </Box>

      <ConfirmRestart
        open={confirm}
        detail="놓은 마카롱과 X 표시가 모두 지워지고 시간도 0:00으로 돌아갑니다."
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          updateZone(restartZone);
          setConfirm(false);
        }}
      />
      <ClearDialog
        open={game.solved}
        art={<DessertArt id="macaron" size={96} />}
        title={daily ? dailyClear.title : `레벨 ${game.level} 완성!`}
        detail={daily ? dailyClear.detail : `걸린 시간 ${formatTime(game.elapsedSeconds)}`}
        nextLabel={daily ? dailyClear.nextLabel : "다음 레벨"}
        onNext={daily ? dailyClear.onNext : () => startZone()}
        share={daily ? dailyClear.share : undefined}
        stars={daily ? null : lastStars}
      />
      {hint.toast}
      {guide.dialog}
    </Page>
  );
}
