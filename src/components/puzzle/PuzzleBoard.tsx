// 모든 퍼즐이 함께 쓰는 정사각형 판. 칸을 누르는 것만 받고 끌기(드래그)는 쓰지 않습니다(설계서).
// 퍼즐마다 칸 안 내용·색·굵은 선 위치만 넘기면 됩니다(스도쿠 상자, 색깔 구역 경계 등).
import { Box, ButtonBase } from "@mui/material";
import type { ReactNode } from "react";
import { dessert } from "../../theme/palette";
import { radius } from "../../theme/shape";

export interface ThickEdges {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
}

interface PuzzleBoardProps {
  size: number;
  label: string;
  renderCell: (index: number) => ReactNode;
  cellLabel: (index: number) => string;
  onCellTap: (index: number) => void;
  /** 칸 바탕색(고른 칸·강조·색깔 구역 등) */
  cellColor?: (index: number) => string;
  thickEdges?: (index: number) => ThickEdges;
  /** 칸 위에 얹는 것(블록 탈출의 블록 등). 판과 같은 크기의 층에 그립니다. */
  overlay?: ReactNode;
}

const THIN = `1px solid ${dessert.line}`;
const THICK = `2px solid ${dessert.cocoaSoft}`;

export default function PuzzleBoard({ size, label, renderCell, cellLabel, onCellTap, cellColor, thickEdges, overlay }: PuzzleBoardProps) {
  return (
    <Box
      role="grid"
      aria-label={label}
      sx={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        width: "100%",
        aspectRatio: "1 / 1",
        bgcolor: dessert.paper,
        border: `3px solid ${dessert.cocoaSoft}`,
        borderRadius: radius.item,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: size * size }, (_, index) => {
        const row = Math.floor(index / size);
        const col = index % size;
        const edges = thickEdges?.(index) ?? {};
        return (
          <ButtonBase
            key={index}
            role="gridcell"
            aria-label={cellLabel(index)}
            disableRipple
            onClick={() => onCellTap(index)}
            sx={{
                position: "relative",
                minWidth: 0,
                minHeight: 0,
                borderTop: row === 0 ? "none" : edges.top ? THICK : THIN,
                borderLeft: col === 0 ? "none" : edges.left ? THICK : THIN,
                // 오른쪽·아래 선은 다음 칸이 그리므로 겹쳐 굵어지지 않습니다.
                transition: "background-color 120ms",
                "&.Mui-focusVisible": { outline: `3px solid ${dessert.strawberryDeep}`, outlineOffset: "-3px", zIndex: 1 },
                bgcolor: cellColor?.(index),
            }}
          >
            {renderCell(index)}
          </ButtonBase>
        );
      })}
      {overlay}
    </Box>
  );
}
