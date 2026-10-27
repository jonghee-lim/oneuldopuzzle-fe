import { Box, Button, Dialog, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { StarLine } from "../../puzzle/core/score";
import { dessert } from "../../theme/palette";
import { popIn } from "../../theme/motion";
import StarChips from "./StarChips";

/** 다 풀었을 때 창 */
export default function ClearDialog({ open, art, title, detail, nextLabel, onNext, stars = null }: { open: boolean; art: ReactNode; title: string; detail: string; nextLabel?: string; onNext?: () => void; stars?: readonly StarLine[] | null }) {
  const navigate = useNavigate();
  return (
    <Dialog open={open} slotProps={{ paper: { sx: { width: "min(360px, calc(100% - 32px))", p: 3, textAlign: "center", bgcolor: dessert.cream } } }}>
      <Box sx={{ display: "flex", justifyContent: "center", ...popIn }}>{art}</Box>
      <Typography component="h2" sx={{ fontSize: 22, fontWeight: 800, mt: 1 }}>
        {title}
      </Typography>
      <Typography sx={{ color: "text.secondary", mt: 0.5 }}>{detail}</Typography>
      <StarChips lines={stars} />
      {onNext && (
        <Button variant="contained" size="large" fullWidth onClick={onNext} sx={{ mt: 3, height: 52 }}>
          {nextLabel}
        </Button>
      )}
      <Button fullWidth onClick={() => navigate("/")} sx={{ mt: onNext ? 1 : 3, color: "text.secondary" }}>
        처음 화면
      </Button>
    </Dialog>
  );
}
