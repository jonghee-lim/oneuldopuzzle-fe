import { ButtonBase } from "@mui/material";
import type { ReactNode } from "react";
import { dessert } from "../../theme/palette";
import { radius } from "../../theme/shape";

/** 판 아래 작은 도구 버튼(되돌리기·다시 하기·메모 등) */
export default function ToolButton({ label, icon, onClick, active = false }: { label: string; icon: ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <ButtonBase
      onClick={onClick}
      disableRipple
      aria-pressed={active}
      sx={{
        gap: 0.5,
        px: 1.25,
        height: 40,
        borderRadius: radius.pill,
        fontSize: 14,
        fontWeight: 600,
        color: active ? "#FFFFFF" : dessert.cocoaSoft,
        bgcolor: active ? dessert.mintDeep : dessert.creamDeep,
        "&.Mui-focusVisible": { outline: `3px solid ${dessert.strawberryDeep}`, outlineOffset: "2px" },
      }}
    >
      {icon}
      <span className="tool-label">{label}</span>
    </ButtonBase>
  );
}
