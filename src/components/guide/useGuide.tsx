import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import { IconButton } from "@mui/material";
import { useState } from "react";
import { dessert } from "../../theme/palette";
import GuideDialog from "./GuideDialog";
import type { GuideKind } from "./guides";
import { guideSeen, markGuideSeen } from "./seen";

/** 퍼즐 화면의 하는 법: 처음 열 때 한 번 저절로 열고(auto), 머리 줄의 '?' 버튼으로 언제든 다시 엽니다. */
export function useGuide(kind: GuideKind, auto = true) {
  const [open, setOpen] = useState(() => auto && !guideSeen(kind));
  return {
    button: (
      <IconButton aria-label="하는 법" onClick={() => setOpen(true)} sx={{ color: dessert.cocoaSoft }}>
        <HelpOutlineIcon />
      </IconButton>
    ),
    dialog: (
      <GuideDialog
        kind={kind}
        open={open}
        onClose={() => {
          markGuideSeen(kind);
          setOpen(false);
        }}
      />
    ),
  };
}
