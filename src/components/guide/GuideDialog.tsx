import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, Typography } from "@mui/material";
import { Fragment, useState } from "react";
import DessertArt from "../dessert/DessertArt";
import { dessert } from "../../theme/palette";
import { GUIDES, type GuideCell, type GuideExample, type GuideKind } from "./guides";

/** 하는 법: 단계마다 한 문장과 작은 예시 판. 마지막 단계에서 '시작하기'로 닫습니다. */
export default function GuideDialog({ kind, open, onClose }: { kind: GuideKind; open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const guide = GUIDES[kind];
  const last = step === guide.steps.length - 1;
  const current = guide.steps[Math.min(step, guide.steps.length - 1)];
  const close = () => {
    onClose();
    setStep(0);
  };
  return (
    <Dialog open={open} onClose={close} aria-labelledby="guide-title" slotProps={{ paper: { sx: { width: "min(380px, calc(100% - 32px))", m: 2, bgcolor: dessert.cream } } }}>
      <Box sx={{ display: "flex", alignItems: "center", pl: 3, pr: 1, pt: 1.5 }}>
        <Typography id="guide-title" component="h2" sx={{ flex: 1, fontWeight: 800, fontSize: 19 }}>
          {guide.title}
        </Typography>
        <Typography aria-label={`${guide.steps.length}단계 중 ${step + 1}단계`} sx={{ fontSize: 13, fontWeight: 700, color: dessert.cocoaSoft, fontVariantNumeric: "tabular-nums", mr: 0.5 }}>
          {step + 1}/{guide.steps.length}
        </Typography>
        <IconButton aria-label="하는 법 닫기" onClick={close}>
          <CloseIcon />
        </IconButton>
      </Box>
      {/* 단계마다 글 길이가 달라도 아래 버튼이 움직이지 않게 높이를 잡아 둡니다. */}
      <DialogContent sx={{ pt: 1, minHeight: 300, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography sx={{ fontSize: 16, lineHeight: 1.6, color: dessert.cocoa }}>{current.text}</Typography>
        {current.example && <Example example={current.example} />}
        {current.caption && <Typography sx={{ fontSize: 13, lineHeight: 1.5, color: dessert.cocoaSoft, textAlign: "center" }}>{current.caption}</Typography>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: "space-between" }}>
        <Button onClick={() => setStep((s) => s - 1)} sx={{ color: "text.secondary", visibility: step === 0 ? "hidden" : "visible" }}>
          이전
        </Button>
        <Button variant="contained" onClick={() => (last ? close() : setStep((s) => s + 1))} sx={{ minWidth: 112 }}>
          {last ? "시작하기" : "다음"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Example({ example }: { example: GuideExample }) {
  const { cols, cells, rowClues, colClues, exitRow, box } = example;
  const rows = cells.length / cols;
  const cell = cols >= 9 ? 25 : cols >= 6 ? 30 : 38;
  const template = `${rowClues ? "auto " : ""}repeat(${cols}, ${cell}px)${exitRow !== undefined ? " 20px" : ""}`;
  const clue = { fontSize: 14, fontWeight: 800, color: dessert.cocoa, fontVariantNumeric: "tabular-nums" } as const;
  return (
    <Box aria-hidden sx={{ alignSelf: "center", display: "grid", gridTemplateColumns: template, columnGap: 0, rowGap: 0, alignItems: "center" }}>
      {colClues && (
        <>
          {rowClues && <Box />}
          {colClues.map((c, k) => (
            <Box key={k} sx={{ ...clue, display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.2, pb: 0.5 }}>
              {c.split(" ").map((n, j) => (
                <span key={j}>{n}</span>
              ))}
            </Box>
          ))}
          {exitRow !== undefined && <Box />}
        </>
      )}
      {Array.from({ length: rows }, (_, r) => (
        <Fragment key={r}>
          {rowClues && <Box sx={{ ...clue, pr: 1, textAlign: "right", whiteSpace: "nowrap", wordSpacing: "4px" }}>{rowClues[r]}</Box>}
          {cells.slice(r * cols, r * cols + cols).map((c, k) => (
            <Cell key={k} cell={c} size={cell} thickLeft={!!box && k > 0 && k % box[0] === 0} thickTop={!!box && r > 0 && r % box[1] === 0} />
          ))}
          {exitRow !== undefined && <Box sx={{ ...clue, color: dessert.strawberryDeep, textAlign: "center" }}>{r === exitRow ? "→" : ""}</Box>}
        </Fragment>
      ))}
    </Box>
  );
}

function Cell({ cell, size, thickLeft, thickTop }: { cell: GuideCell; size: number; thickLeft: boolean; thickTop: boolean }) {
  const line = `1px solid ${dessert.line}`;
  const thick = `2px solid ${dessert.cocoaSoft}`;
  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: cell.bg ?? dessert.paper,
        border: line,
        borderLeft: thickLeft ? thick : line,
        borderTop: thickTop ? thick : line,
        boxSizing: "border-box",
        fontSize: size * 0.55,
        fontWeight: 800,
        color: cell.color ?? dessert.cocoa,
        boxShadow: cell.ring ? `inset 0 0 0 3px ${dessert.strawberryDeep}` : undefined,
      }}
    >
      {cell.text}
      {cell.mark === "x" && <CloseIcon sx={{ fontSize: size * 0.7, color: dessert.cocoaSoft }} />}
      {cell.mark === "soft" && <CloseIcon sx={{ fontSize: size * 0.5, color: dessert.cocoaSoft, opacity: 0.35 }} />}
      {cell.mark === "macaron" && <DessertArt id="macaron" size={size * 0.8} />}
      {cell.mark === "dot" && <Box sx={{ width: size * 0.3, height: size * 0.3, borderRadius: "50%", bgcolor: dessert.mintDeep, opacity: 0.6 }} />}
      {cell.mark === "pin" && <Box sx={{ width: size * 0.3, height: size * 0.3, borderRadius: "50%", bgcolor: dessert.cocoa }} />}
    </Box>
  );
}
