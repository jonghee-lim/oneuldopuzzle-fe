// 홈 메뉴 타일의 작은 미리보기 그림(퍼즐 모양을 한눈에). 꾸밈용이라 화면 읽기에서는 숨깁니다.
import { Box } from "@mui/material";
import { ZONE_COLORS, dessert } from "../../theme/palette";

const ZONES = [0, 0, 1, 1, 0, 2, 2, 1, 3, 2, 2, 1, 3, 3, 2, 2];
const HEART = [0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0];

export default function PuzzleThumb({ kind, size = 56 }: { kind: "zones" | "nonogram" | "escape"; size?: number }) {
  return (
    <Box aria-hidden component="svg" viewBox="0 0 40 40" sx={{ width: size, height: size, display: "block" }}>
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
    </Box>
  );
}
