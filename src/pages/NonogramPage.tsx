import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SquareRoundedIcon from "@mui/icons-material/SquareRounded";
import UndoIcon from "@mui/icons-material/Undo";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
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
import { colDone, newNonogramGame, restartNonogram, rowDone, setTool, tapNonogramCell, undoNonogram, type NonogramTool } from "../puzzle/nonogram/game";
import { NONOGRAMS } from "../puzzle/nonogram/puzzles";
import { usePuzzleStore } from "../stores/puzzleStore";
import { dessert } from "../theme/palette";

export default function NonogramPage() {
  const [params, setParams] = useSearchParams();
  const stage = Math.min(Math.max(Number(params.get("stage") ?? 0) || 0, 0), NONOGRAMS.length - 1);
  return <NonogramStage key={stage} stage={stage} onStage={(s) => setParams({ stage: String(s) }, { replace: true })} />;
}

function NonogramStage({ stage, onStage }: { stage: number; onStage: (stage: number) => void }) {
  const picture = NONOGRAMS[stage];
  const [game, setGame] = useState(() => newNonogramGame(picture));
  const [confirm, setConfirm] = useState(false);
  const { width, height } = game;
  const doneRows = useMemo(() => Array.from({ length: height }, (_, r) => rowDone(game, r)), [game, height]);
  const doneCols = useMemo(() => Array.from({ length: width }, (_, c) => colDone(game, c)), [game, width]);
  const clueSize = width > 5 ? 13 : 16;
  const cleared = usePuzzleStore((s) => s.nonogramCleared);
  const clearNonogram = usePuzzleStore((s) => s.clearNonogram);
  const lastScore = usePuzzleStore((s) => s.lastScore);
  useEffect(() => {
    if (game.solved) {
      clearNonogram(stage);
      cue("clear");
    }
  }, [game.solved, stage, clearNonogram]);

  return (
    <Page>
      <PuzzleHeader title="노노그램" subtitle={`스페셜 스테이지 · ${picture.rows.length}×${width}`} />
      <Box sx={{ px: 1.5, pt: 1 }}>
        <StageTabs stages={NONOGRAMS.map((_, i) => `${i + 1}단계`)} done={NONOGRAMS.map((_, i) => cleared.includes(i))} value={stage} onChange={onStage} />
      </Box>

      {/* 위 단서는 판의 열에, 왼쪽 단서는 판의 행에 맞춰 같은 격자에 둡니다. */}
      <Box sx={{ px: 1.5, pt: 2, display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gridTemplateRows: "auto auto", columnGap: 0.75, rowGap: 0.75 }}>
        <Box />
        <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`, px: "3px", alignItems: "end" }} aria-label="열 단서">
          {game.clues.cols.map((clue, c) => (
            <Box
              key={c}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontSize: clueSize,
                fontWeight: 700,
                lineHeight: 1.25,
                color: doneCols[c] ? dessert.line : dessert.cocoa,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {clue.map((n, k) => (
                <span key={k}>{n}</span>
              ))}
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "grid", gridTemplateRows: `repeat(${height}, minmax(0, 1fr))`, py: "3px" }} aria-label="행 단서">
          {game.clues.rows.map((clue, r) => (
            <Box
              key={r}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "6px",
                fontSize: clueSize,
                fontWeight: 700,
                color: doneRows[r] ? dessert.line : dessert.cocoa,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {clue.map((n, k) => (
                <span key={k}>{n}</span>
              ))}
            </Box>
          ))}
        </Box>
        <PuzzleBoard
          size={width}
          label={`노노그램 판 ${height}×${width}`}
          onCellTap={(index) => {
            cue(game.tool === "fill" ? "place" : "tap");
            setGame((g) => tapNonogramCell(g, index));
          }}
          cellLabel={(index) => {
            const state = game.cells[index] === 1 ? "칠함" : game.cells[index] === 2 ? "X 표시" : "빈칸";
            return `${Math.floor(index / width) + 1}행 ${(index % width) + 1}열 ${state}`;
          }}
          thickEdges={(index) => ({ top: Math.floor(index / width) % 5 === 0, left: (index % width) % 5 === 0 })}
          cellColor={(index) => (game.cells[index] === 1 ? dessert.strawberryDeep : dessert.paper)}
          renderCell={(index) =>
            game.cells[index] === 2 ? <CloseIcon aria-hidden sx={{ fontSize: width > 5 ? 18 : 28, color: dessert.cocoaSoft }} /> : null
          }
        />
      </Box>

      <Box sx={{ px: 1.5, pt: 2, display: "flex", gap: 1, alignItems: "center" }}>
        <ToolButton label="다시 하기" onClick={() => setConfirm(true)} icon={<RestartAltIcon sx={{ fontSize: 18 }} />} />
        <Box sx={{ flex: 1 }} />
        <ToolButton label="되돌리기" onClick={() => setGame(undoNonogram)} icon={<UndoIcon sx={{ fontSize: 18 }} />} />
      </Box>

      <Box sx={{ px: 1.5, pt: 2, mt: "auto" }}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={game.tool}
          onChange={(_, tool: NonogramTool | null) => tool && setGame((g) => setTool(g, tool))}
          aria-label="도구"
        >
          <ToggleButton value="fill" sx={{ height: 60, gap: 1, fontSize: 17, fontWeight: 700 }}>
            <SquareRoundedIcon sx={{ color: dessert.strawberryDeep }} /> 칠하기
          </ToggleButton>
          <ToggleButton value="cross" sx={{ height: 60, gap: 1, fontSize: 17, fontWeight: 700 }}>
            <CloseIcon /> X 표시
          </ToggleButton>
        </ToggleButtonGroup>
        <Typography sx={{ mt: 1, fontSize: 13, color: "text.secondary", textAlign: "center" }}>
          숫자는 그 줄에 이어서 칠할 칸 수예요. 맞춘 줄의 숫자는 흐려집니다.
        </Typography>
      </Box>

      <ConfirmRestart
        open={confirm}
        detail="칠한 칸과 X 표시가 모두 지워집니다. 그림은 그대로입니다."
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setGame(restartNonogram);
          setConfirm(false);
        }}
      />
      <ClearDialog
        open={game.solved}
        art={<DessertArt id="cake" size={96} />}
        title={`${picture.name} 완성!`}
        detail="스페셜 노노그램을 풀었어요."
        nextLabel="다음 단계"
        score={lastScore}
        onNext={stage < NONOGRAMS.length - 1 ? () => onStage(stage + 1) : undefined}
      />
    </Page>
  );
}
