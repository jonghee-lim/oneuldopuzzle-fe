// 모든 퍼즐이 함께 쓰는 정사각형 판. 칸을 누르는 것만 받고 끌기(드래그)는 쓰지 않습니다(설계서).
// 퍼즐마다 칸 안 내용·색·굵은 선 위치만 넘기면 됩니다(스도쿠 상자, 색깔 구역 경계 등).
import { Box, ButtonBase, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";
import { useSwipe, type SwipeDir } from "./useSwipe";
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
  /** 칸에서 손가락을 쓸었을 때(슬라이딩 등). 없으면 쓸기는 무시합니다. */
  onCellSwipe?: (index: number, dir: SwipeDir) => void;
  /** 힌트가 비추는 칸(useHint().focus). 블록 위에도 보이게 맨 위 층에 그립니다. */
  focus?: readonly number[] | null;
}

const THIN = `1px solid ${dessert.line}`;
const THICK = `2px solid ${dessert.cocoaSoft}`;
// 힌트로 비춘 칸 테두리. 빨강은 틀린 칸에만 쓰므로 노랑을 씁니다.
const HINT_RING = "#E0A21B";

export default function PuzzleBoard({ size, label, renderCell, cellLabel, onCellTap, cellColor, thickEdges, overlay, onCellSwipe, focus }: PuzzleBoardProps) {
  return (
    <Box
      role="grid"
      aria-label={label}
      sx={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        width: "100%",
        // 판 높이는 정사각형 칸 줄이 모여 정해집니다. 판에 aspect-ratio를 주고 줄 높이를 내용에 맡기면
        // iOS Safari가 숫자·메모가 든 줄을 다르게 늘려 칸 높이가 들쭉날쭉해집니다(2026-10-27 신고).
        bgcolor: dessert.paper,
        border: `3px solid ${dessert.cocoaSoft}`,
        borderRadius: radius.item,
        overflow: "hidden",
        // 판 위에서 손가락이 움직여도 화면이 끌려가거나 튕기지 않게 합니다(2026-10-26 신고).
        touchAction: "none",
      }}
    >
      {Array.from({ length: size * size }, (_, index) => {
        const row = Math.floor(index / size);
        const col = index % size;
        const edges = thickEdges?.(index) ?? {};
        return (
          <Cell key={index} index={index} label={cellLabel(index)} onTap={onCellTap} onSwipe={onCellSwipe}
            sx={{
              position: "relative",
              minWidth: 0,
              minHeight: 0,
              aspectRatio: "1 / 1",
              overflow: "hidden",
              borderTop: row === 0 ? "none" : edges.top ? THICK : THIN,
              borderLeft: col === 0 ? "none" : edges.left ? THICK : THIN,
              // 오른쪽·아래 선은 다음 칸이 그리므로 겹쳐 굵어지지 않습니다.
              transition: "background-color 120ms",
              "&.Mui-focusVisible": { outline: `3px solid ${dessert.strawberryDeep}`, outlineOffset: "-3px", zIndex: 1 },
              bgcolor: cellColor?.(index),
            }}
          >
            {renderCell(index)}
          </Cell>
        );
      })}
      {overlay}
      {focus?.map((i) => (
        <Box
          key={`focus-${i}`}
          aria-hidden
          sx={{
            position: "absolute",
            left: `${((i % size) * 100) / size}%`,
            top: `${(Math.floor(i / size) * 100) / size}%`,
            width: `${100 / size}%`,
            height: `${100 / size}%`,
            pointerEvents: "none",
            zIndex: 2,
            bgcolor: "rgba(242, 179, 61, 0.22)",
            boxShadow: `inset 0 0 0 2px ${HINT_RING}`,
            "@keyframes hint-glow": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.55 } },
            animation: "hint-glow 1.4s ease-in-out infinite",
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          }}
        />
      ))}
    </Box>
  );
}

function Cell({
  index,
  label,
  onTap,
  onSwipe,
  sx,
  children,
}: {
  index: number;
  label: string;
  onTap: (index: number) => void;
  onSwipe?: (index: number, dir: SwipeDir) => void;
  sx: SxProps<Theme>;
  children: ReactNode;
}) {
  const swipe = useSwipe((s) => onSwipe?.(index, s.dir));
  return (
    <ButtonBase role="gridcell" aria-label={label} disableRipple onClick={() => onTap(index)} {...(onSwipe ? swipe : {})} sx={sx}>
      {children}
    </ButtonBase>
  );
}
