import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UndoIcon from "@mui/icons-material/Undo";
import { Box, ButtonBase, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DessertArt from "../components/dessert/DessertArt";
import Page from "../components/layout/Page";
import PuzzleHeader from "../components/layout/PuzzleHeader";
import ClearDialog from "../components/puzzle/ClearDialog";
import ConfirmRestart from "../components/puzzle/ConfirmRestart";
import PuzzleBoard from "../components/puzzle/PuzzleBoard";
import StageTabs from "../components/puzzle/StageTabs";
import ToolButton from "../components/puzzle/ToolButton";
import { newEscapeGame, restartEscape, tapBlock, tapEscapeCell, targetCells, undoEscape } from "../puzzle/escape/game";
import { ESCAPES } from "../puzzle/escape/puzzles";
import { ESCAPE_SIZE, EXIT_ROW, TARGET_ID } from "../puzzle/escape/rules";
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
          <ButtonBase
            key={b.id}
            disableRipple
            aria-label={`${isTarget ? "딸기 블록" : `블록 ${b.id}`}, ${b.horizontal ? "가로" : "세로"} ${b.length}칸${selected ? ", 고름" : ""}`}
            aria-pressed={selected}
            onClick={() => setGame((g) => tapBlock(g, b.id))}
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
          </ButtonBase>
        );
      })}
    </Box>
  );

  return (
    <Page>
      <PuzzleHeader title="블록 탈출" subtitle={`스페셜 스테이지 · ${puzzle.name}`} right={<span aria-label="이동 수">{game.moves}수</span>} />
      <Box sx={{ px: 1.5, pt: 1 }}>
        <StageTabs stages={ESCAPES.map((_, i) => `${i + 1}단계`)} value={stage} onChange={onStage} />
      </Box>
      <Box sx={{ px: 1.5, pt: 2 }}>
        <PuzzleBoard
          size={ESCAPE_SIZE}
          label="블록 탈출 판"
          onCellTap={(index) => setGame((g) => tapEscapeCell(g, index))}
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
          {game.selected ? "초록 점이 있는 칸을 누르면 블록이 그쪽으로 밀려요." : `블록을 눌러 고르세요. 딸기 블록을 오른쪽 출구로 보내면 성공이에요. 최소 ${puzzle.minMoves}수.`}
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
        onNext={stage < ESCAPES.length - 1 ? () => onStage(stage + 1) : undefined}
      />
    </Page>
  );
}
