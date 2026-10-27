import CloseIcon from "@mui/icons-material/Close";
import { needsStart, useTierNext } from "../components/tier/useTier";
import { TIER_ROUTE } from "../components/tier/tierRoutes";
import { TIER_LABEL } from "../puzzle/core/tier";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SquareRoundedIcon from "@mui/icons-material/SquareRounded";
import UndoIcon from "@mui/icons-material/Undo";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import DessertArt from "../components/dessert/DessertArt";
import Page from "../components/layout/Page";
import PuzzleHeader from "../components/layout/PuzzleHeader";
import ClearDialog from "../components/puzzle/ClearDialog";
import ConfirmRestart from "../components/puzzle/ConfirmRestart";
import PuzzleBoard from "../components/puzzle/PuzzleBoard";
import ToolButton from "../components/puzzle/ToolButton";
import { useHint } from "../components/puzzle/useHint";
import { cue } from "../platform/feedback";
import { applyNonogramHint, colDone, findNonogramHint, nonogramHintSteps, restartNonogram, rowDone, setTool, tapNonogramCell, undoNonogram, type NonogramGame, type NonogramTool } from "../puzzle/nonogram/game";
import { pictureAt } from "../puzzle/nonogram/generator";
import { usePuzzleStore } from "../stores/puzzleStore";
import { dessert } from "../theme/palette";

/** 노노그램(끝없는 레벨, 2026-10-27): 판이 점점 커지고, 정해 둔 레벨에는 손으로 그린 디저트 그림이 나옵니다. */
export default function NonogramPage() {
  const game = usePuzzleStore((s) => s.nonogramGame);
  const next = useTierNext("nonogram");
  const startNonogram = usePuzzleStore((s) => s.startNonogram);
  useEffect(() => {
    const current = usePuzzleStore.getState().nonogramGame;
    if (needsStart(current, !!current?.solved, next)) startNonogram();
  }, [next, startNonogram]);
  if (!game) return null;
  return <NonogramLevel game={game} />;
}

function NonogramLevel({ game }: { game: NonogramGame }) {
  const setGame = usePuzzleStore((s) => s.updateNonogram);
  const startNonogram = usePuzzleStore((s) => s.startNonogram);
  const [confirm, setConfirm] = useState(false);
  const hint = useHint(game.cells.join(""), game.width);
  const { width, height } = game;
  const doneRows = useMemo(() => Array.from({ length: height }, (_, r) => rowDone(game, r)), [game, height]);
  const doneCols = useMemo(() => Array.from({ length: width }, (_, c) => colDone(game, c)), [game, width]);
  const clueSize = width > 5 ? 13 : 16;
  const lastStars = usePuzzleStore((s) => s.lastStars);
  const tier = game.tier ?? "easy";
  const picture = pictureAt(game.level, tier) !== undefined;
  // 이미 풀린 판을 다시 열 때는 소리를 내지 않습니다.
  const wasSolved = useRef(game.solved);
  useEffect(() => {
    if (game.solved && !wasSolved.current) cue("clear");
    wasSolved.current = game.solved;
  }, [game.solved]);

  return (
    <Page>
      <PuzzleHeader title={`레벨 ${game.level}`} subtitle={`노노그램 · ${TIER_LABEL[tier]} · ${height}×${width}${picture ? " · 그림" : ""}`} back={{ to: TIER_ROUTE.nonogram, label: "노노그램 화면으로" }} />

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
          focus={hint.focus}
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
        {hint.button(() =>
          hint.give(
            () => findNonogramHint(game),
            (h) => nonogramHintSteps(game, h),
            (h) => setGame((g) => applyNonogramHint(g, h)),
            (h) => `${Math.floor(h.index / game.width) + 1}행 ${(h.index % game.width) + 1}열${h.remove ? "은 비어 있어야 해서 X로 바꿨어요." : "을 칠했어요."}`,
          ),
        )}
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
        title={picture ? `${game.name} 완성!` : `레벨 ${game.level} 완성!`}
        detail={picture ? "디저트 그림이 나왔어요." : "숫자대로 무늬를 다 칠했어요."}
        nextLabel="다음 레벨"
        stars={lastStars}
        onNext={() => startNonogram()}
      />
      {hint.toast}
    </Page>
  );
}
