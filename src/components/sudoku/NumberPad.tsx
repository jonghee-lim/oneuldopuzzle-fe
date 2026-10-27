// 큰 숫자 패드(설계서: 기본 화면은 숫자 패드를 크게). 1~5 / 6~9 + 지우기 두 줄입니다(미니 6×6은 1~4 / 5·6 + 넓은 지우기).
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import { Box, ButtonBase } from "@mui/material";
import { dessert } from "../../theme/palette";
import { radius } from "../../theme/shape";

interface Props {
  counts: number[];
  /** 판 크기: 9 또는 미니 6 */
  size?: number;
  memoMode: boolean;
  activeNumber: number | null;
  onNumber: (digit: number) => void;
  onErase: () => void;
}

export default function NumberPad({ counts, size = 9, memoMode, activeNumber, onNumber, onErase }: Props) {
  const keySx = {
    height: "clamp(56px, 15vw, 72px)",
    borderRadius: radius.item,
    bgcolor: dessert.paper,
    flexDirection: "column",
    gap: "2px",
    transition: "transform 80ms, background-color 120ms",
    "&:active": { transform: "scale(0.96)" },
    "&.Mui-focusVisible": { outline: `3px solid ${dessert.strawberryDeep}`, outlineOffset: "2px" },
    "@media (prefers-reduced-motion: reduce)": { transition: "none", "&:active": { transform: "none" } },
  } as const;

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${size === 9 ? 5 : 4}, 1fr)`, gap: 1 }} aria-label="숫자 패드">
      {Array.from({ length: size }, (_, k) => k + 1).map((digit) => {
        const done = counts[digit] >= size;
        const active = activeNumber === digit;
        return (
          <ButtonBase
            key={digit}
            aria-label={memoMode ? `메모 ${digit}` : `${digit}`}
            aria-pressed={active}
            disabled={done && !memoMode}
            disableRipple
            onClick={() => onNumber(digit)}
            sx={{
              ...keySx,
              bgcolor: active ? dessert.strawberryDeep : memoMode ? dessert.mintMilk : dessert.paper,
              opacity: done && !memoMode ? 0.35 : 1,
            }}
          >
            <Box
              component="span"
              className="pad-digit"
              sx={{
                fontSize: memoMode ? "clamp(20px, 6vw, 26px)" : "clamp(26px, 8vw, 34px)",
                fontWeight: 800,
                lineHeight: 1,
                color: active ? "#FFFFFF" : dessert.cocoa,
              }}
            >
              {digit}
            </Box>
            <Box component="span" className="pad-left" sx={{ fontSize: 12, lineHeight: 1, color: active ? "#FFFFFF" : dessert.cocoaSoft, fontVariantNumeric: "tabular-nums" }}>
              {done ? "완료" : `${size - counts[digit]}개`}
            </Box>
          </ButtonBase>
        );
      })}
      <ButtonBase aria-label="지우기" disableRipple onClick={onErase} sx={{ ...keySx, bgcolor: dessert.creamDeep, gridColumn: size === 9 ? undefined : "span 2" }}>
        <BackspaceOutlinedIcon sx={{ fontSize: 26, color: dessert.cocoaSoft }} />
        <Box component="span" className="pad-left" sx={{ fontSize: 12, lineHeight: 1, color: dessert.cocoaSoft }}>
          지우기
        </Box>
      </ButtonBase>
    </Box>
  );
}
