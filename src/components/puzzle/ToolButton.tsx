import { ButtonBase } from "@mui/material";
import type { ReactNode } from "react";
import { dessert } from "../../theme/palette";
import { radius } from "../../theme/shape";

/** 판 아래 작은 도구 버튼(되돌리기·다시 하기·메모 등). compact면 아이콘만 보이고 이름은 화면 읽기로만 읽힙니다. */
export default function ToolButton({ label, icon, onClick, active = false, compact = false }: { label: string; icon: ReactNode; onClick: () => void; active?: boolean; compact?: boolean }) {
  return (
    <ButtonBase
      onClick={onClick}
      disableRipple
      aria-pressed={active}
      aria-label={compact ? label : undefined}
      sx={{
        gap: 0.5,
        px: compact ? 0 : 1.25,
        minWidth: compact ? 44 : undefined,
        whiteSpace: "nowrap",
        flexShrink: 0,
        height: 40,
        borderRadius: radius.pill,
        fontSize: 14,
        fontWeight: 600,
        color: active ? "#FFFFFF" : dessert.cocoaSoft,
        bgcolor: active ? dessert.mintDeep : dessert.creamDeep,
        // 아주 좁은 화면(화면 확대를 켠 iPhone은 320px)에서도 한 줄에 들어가게 줄입니다. 넘치면 iOS가 화면 전체를 줄였다 키웁니다(2026-10-27 신고).
        "@media (max-width: 359px)": { px: compact ? 0 : 0.75, gap: 0.25, fontSize: 13, minWidth: compact ? 40 : undefined },
        "&.Mui-focusVisible": { outline: `3px solid ${dessert.strawberryDeep}`, outlineOffset: "2px" },
      }}
    >
      {icon}
      {!compact && <span className="tool-label">{label}</span>}
    </ButtonBase>
  );
}
