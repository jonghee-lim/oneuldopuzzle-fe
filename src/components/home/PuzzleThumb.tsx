// 홈 메뉴 타일의 작은 미리보기 그림(퍼즐 모양을 한눈에). 꾸밈용이라 화면 읽기에서는 숨깁니다.
import { Box } from "@mui/material";
import { ZONE_COLORS, dessert } from "../../theme/palette";

const ZONES = [0, 0, 1, 1, 0, 2, 2, 1, 3, 2, 2, 1, 3, 3, 2, 2];
// 스도쿠 미리보기: 3×3 상자 하나에 처음 숫자(코코아)와 내가 넣은 숫자(민트)
const SUDOKU = [5, 0, 3, 0, 7, 0, 9, 1, 0];
const SUDOKU_MINE = new Set([6, 7]);
const HEART = [0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0];

export default function PuzzleThumb({ kind, size = 56 }: { kind: "sudoku" | "zones" | "nonogram" | "escape" | "sliding" | "blocks"; size?: number }) {
  return (
    <Box aria-hidden component="svg" viewBox="0 0 40 40" sx={{ width: size, height: size, display: "block" }}>
      {kind === "sudoku" && (
        <g>
          <rect x="0.5" y="0.5" width="39" height="39" rx="4" fill={dessert.paper} stroke={dessert.cocoaSoft} strokeWidth="1" />
          <path d="M13.5 1v38M26.5 1v38M1 13.5h38M1 26.5h38" stroke={dessert.line} strokeWidth="0.8" />
          {SUDOKU.map((n, i) =>
            n ? (
              <text key={i} x={(i % 3) * 13 + 7} y={Math.floor(i / 3) * 13 + 10.5} fontSize="8.5" fontWeight="800" textAnchor="middle" fill={SUDOKU_MINE.has(i) ? dessert.mintDeep : dessert.cocoa}>
                {n}
              </text>
            ) : null,
          )}
        </g>
      )}
      {kind === "zones" &&
        ZONES.map((z, i) => <rect key={i} x={(i % 4) * 10} y={Math.floor(i / 4) * 10} width="10" height="10" fill={ZONE_COLORS[z]} stroke={dessert.paper} strokeWidth="0.8" />)}
      {kind === "zones" && (
        <g>
          <ellipse cx="15" cy="15" rx="3.6" ry="2.2" fill={dessert.strawberry} />
          <ellipse cx="35" cy="25" rx="3.6" ry="2.2" fill={dessert.mintDeep} />
        </g>
      )}
      {kind === "nonogram" &&
        HEART.map((v, i) => (
          <rect key={i} x={(i % 5) * 8} y={Math.floor(i / 5) * 8} width="8" height="8" fill={v ? dessert.strawberryDeep : dessert.paper} stroke={dessert.line} strokeWidth="0.6" />
        ))}
      {kind === "escape" && (
        <g>
          <rect x="0" y="0" width="40" height="40" rx="4" fill={dessert.creamDeep} />
          <rect x="2" y="15" width="17" height="9" rx="2.5" fill={dessert.strawberryDeep} />
          <rect x="22" y="2" width="7" height="22" rx="2.5" fill={ZONE_COLORS[3]} />
          <rect x="2" y="2" width="17" height="9" rx="2.5" fill={ZONE_COLORS[6]} />
          <rect x="12" y="28" width="26" height="9" rx="2.5" fill={ZONE_COLORS[1]} />
          <rect x="38" y="15" width="2" height="9" fill={dessert.strawberryDeep} />
        </g>
      )}
      {kind === "sliding" &&
        [1, 2, 3, 4, 0, 6, 7, 5, 8].map((n, i) =>
          n === 0 ? null : (
            <g key={i}>
              <rect x={(i % 3) * 13 + 1} y={Math.floor(i / 3) * 13 + 1} width="12" height="12" rx="2.5" fill={n === i + 1 ? dessert.mint : dessert.paper} />
              <text x={(i % 3) * 13 + 7} y={Math.floor(i / 3) * 13 + 10.5} fontSize="8" fontWeight="800" textAnchor="middle" fill={dessert.cocoa}>
                {n}
              </text>
            </g>
          ),
        )}
      {kind === "blocks" && (
        <g stroke={dessert.cocoaSoft} strokeWidth="0.8">
          <path d="M1 1h19v9h-9.5v9.5H1z" fill={ZONE_COLORS[4]} />
          <path d="M20 1h19v19H20z" fill={ZONE_COLORS[0]} />
          <path d="M10.5 10h9.5v29H10.5z" fill={ZONE_COLORS[2]} />
          <path d="M1 19.5h9.5v19.5H1z" fill={ZONE_COLORS[6]} />
          <path d="M20 20h19v19H20z" fill={ZONE_COLORS[3]} strokeDasharray="2 1.5" fillOpacity="0.35" />
        </g>
      )}
    </Box>
  );
}
