import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UndoIcon from "@mui/icons-material/Undo";
import { Box, ButtonBase, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DessertArt from "../components/dessert/DessertArt";
import Page from "../components/layout/Page";
import PuzzleHeader from "../components/layout/PuzzleHeader";
import ClearDialog from "../components/puzzle/ClearDialog";
import ConfirmRestart from "../components/puzzle/ConfirmRestart";
import PuzzleBoard from "../components/puzzle/PuzzleBoard";
import StageTabs from "../components/puzzle/StageTabs";
import ToolButton from "../components/puzzle/ToolButton";
import { cue } from "../platform/feedback";
import { newEscapeGame, restartEscape, swipeBlock, tapBlock, tapEscapeCell, targetCells, undoEscape } from "../puzzle/escape/game";
import type { Block } from "../puzzle/escape/rules";
import { useSwipe, type Swipe } from "../components/puzzle/useSwipe";
import type { ReactNode } from "react";
import { ESCAPES } from "../puzzle/escape/puzzles";
import { ESCAPE_SIZE, EXIT_ROW, TARGET_ID } from "../puzzle/escape/rules";
import { usePuzzleStore } from "../stores/puzzleStore";
import { dessert } from "../theme/palette";
import { radius } from "../theme/shape";

// 다른 블록은 디저트 색을 돌려 가며 칠하고, 딸기 블록만 진한 딸기색입니다.
const BLOCK_COLORS = ["#BFE8D9", "#F4D9A8", "#F8C8D4", "#D8CFF0", "#C9E4F2", "#F7DE8F"];

export default function EscapePage() {
  const [params, setParams] = useSearchParams();
  const stage = Math.min(Math.max(Number(params.get("stage") ?? 0) || 0, 0), ESCAPES.length - 1);
  return <EscapeStage key={stage} stage={stage} onStage={(s) => setParams({ stage: String(s) }, { replace: true })} />;
}

function EscapeStage({ stage, onStage }: { stage: number; onStage: (stage: number) => void }) {
  const puzzle = ESCAPES[stage];
  const [game, setGame] = useState(() => newEscapeGame(puzzle.board));
  const [confirm, setConfirm] = useState(false);
  const targets = useMemo(() => targetCells(game), [game]);
  const cellPct = 100 / ESCAPE_SIZE;
  const escapeBest = usePuzzleStore((s) => s.escapeBest);
  const clearEscape = usePuzzleStore((s) => s.clearEscape);
  const lastScore = usePuzzleStore((s) => s.lastScore);
  const best = escapeBest[stage];
  useEffect(() => {
    if (game.escaped) {
      clearEscape(stage, game.moves, puzzle.minMoves);
      cue("clear");
    }
  }, [game.escaped, game.moves, stage, puzzle.minMoves, clearEscape]);

  const blocks = (
    <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* 출구: 딸기 블록 줄 오른쪽 끝 */}
      <Box
        aria-hidden
        sx={{ position: "absolute", right: 0, top: `${EXIT_ROW * cellPct}%`, height: `${cellPct}%`, width: 6, bgcolor: dessert.strawberryDeep }}
      />
      {game.blocks.map((b, k) => {
        const isTarget = b.id === TARGET_ID;
        const selected = game.selected === b.id;
        return (
          <EscapeBlock
            key={b.id}
            block={b}
            label={`${isTarget ? "딸기 블록" : `블록 ${b.id}`}, ${b.horizontal ? "가로" : "세로"} ${b.length}칸${selected ? ", 고름" : ""}`}
            selected={selected}
            onTap={() => {
              cue("tap");
              setGame((g) => tapBlock(g, b.id));
            }}
            onSwipe={(sw) => {
              // 블록 방향과 같은 축으로 쓴 것만 받습니다. 쓴 거리를 칸 수로 바꿔 그만큼 옮깁니다.
              const axisOk = b.horizontal ? sw.dir === "left" || sw.dir === "right" : sw.dir === "up" || sw.dir === "down";
              if (!axisOk) return;
              // 블록 크기 = 칸 수 × 칸 크기 - 여백 8px 이므로 거꾸로 칸 크기를 구합니다.
              const cellPx = ((b.horizontal ? sw.rect.width : sw.rect.height) + 8) / b.length;
              const step = sw.dir === "right" || sw.dir === "down" ? 1 : -1;
              setGame((g) => swipeBlock(g, b.id, step, Math.round(sw.distance / cellPx)));
              cue("place");
            }}
            sx={{
              position: "absolute",
              pointerEvents: "auto",
              left: `calc(${b.col * cellPct}% + 4px)`,
              top: `calc(${b.row * cellPct}% + 4px)`,
              width: `calc(${(b.horizontal ? b.length : 1) * cellPct}% - 8px)`,
              height: `calc(${(b.horizontal ? 1 : b.length) * cellPct}% - 8px)`,
              borderRadius: radius.item,
              bgcolor: isTarget ? dessert.strawberryDeep : BLOCK_COLORS[k % BLOCK_COLORS.length],
              outline: selected ? `4px solid ${dessert.cocoa}` : "none",
              outlineOffset: "-4px",
              transition: "left 160ms ease-out, top 160ms ease-out",
              "@media (prefers-reduced-motion: reduce)": { transition: "none" },
              "&.Mui-focusVisible": { outline: `3px solid ${dessert.cocoa}` },
            }}
          >
            {isTarget && <DessertArt id="cake" size="70%" />}
          </EscapeBlock>
        );
      })}
    </Box>
  );

  return (
    <Page>
      <PuzzleHeader title="블록 탈출" subtitle={`스페셜 스테이지 · ${puzzle.name}`} right={<span aria-label="이동 수">{game.moves}수</span>} />
      <Box sx={{ px: 1.5, pt: 1 }}>
        <StageTabs stages={ESCAPES.map((_, i) => `${i + 1}단계`)} done={ESCAPES.map((_, i) => escapeBest[i] !== undefined)} value={stage} onChange={onStage} />
      </Box>
      <Box sx={{ px: 1.5, pt: 2 }}>
        <PuzzleBoard
          size={ESCAPE_SIZE}
          label="블록 탈출 판"
          onCellTap={(index) => {
            if (targets.has(index)) cue("place");
            setGame((g) => tapEscapeCell(g, index));
          }}
          cellLabel={(index) => `${Math.floor(index / ESCAPE_SIZE) + 1}행 ${(index % ESCAPE_SIZE) + 1}열${targets.has(index) ? ", 옮길 수 있는 칸" : ""}`}
          cellColor={(index) => (targets.has(index) ? dessert.mint : dessert.creamDeep)}
          renderCell={(index) =>
            targets.has(index) ? <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: radius.pill, bgcolor: dessert.mintDeep }} /> : null
          }
          overlay={blocks}
        />
      </Box>
      <Box aria-live="polite" sx={{ px: 2, pt: 1.5, minHeight: 44, textAlign: "center" }}>
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          {game.selected ? "초록 점이 있는 칸을 누르거나 블록을 쓸면 그쪽으로 밀려요." : `블록을 쓸거나 눌러서 옮기세요. 딸기 블록을 오른쪽 출구로 보내면 성공이에요. 최소 ${puzzle.minMoves}수${best !== undefined ? ` · 내 기록 ${best}수` : ""}.`}
        </Typography>
      </Box>
      <Box sx={{ px: 1.5, pt: 1, display: "flex", gap: 1 }}>
        <ToolButton label="다시 하기" onClick={() => setConfirm(true)} icon={<RestartAltIcon sx={{ fontSize: 18 }} />} />
        <Box sx={{ flex: 1 }} />
        <ToolButton label="되돌리기" onClick={() => setGame(undoEscape)} icon={<UndoIcon sx={{ fontSize: 18 }} />} />
      </Box>

      <ConfirmRestart
        open={confirm}
        detail="블록이 처음 자리로 돌아가고 이동 수도 0으로 돌아갑니다."
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setGame(restartEscape);
          setConfirm(false);
        }}
      />
      <ClearDialog
        open={game.escaped}
        art={<DessertArt id="cake" size={96} />}
        title="탈출 성공!"
        detail={`${game.moves}수 만에 나왔어요 · 최소 ${puzzle.minMoves}수`}
        nextLabel="다음 단계"
        score={lastScore}
        onNext={stage < ESCAPES.length - 1 ? () => onStage(stage + 1) : undefined}
      />
    </Page>
  );
}

/** 블록 하나: 누르면 고르기, 쓸면 그 방향으로 옮기기 */
function EscapeBlock({
  label,
  selected,
  onTap,
  onSwipe,
  sx,
  children,
}: {
  block: Block;
  label: string;
  selected: boolean;
  onTap: () => void;
  onSwipe: (swipe: Swipe) => void;
  sx: object;
  children: ReactNode;
}) {
  const swipe = useSwipe(onSwipe);
  return (
    <ButtonBase disableRipple aria-label={label} aria-pressed={selected} onClick={onTap} {...swipe} sx={sx}>
      {children}
    </ButtonBase>
  );
}
