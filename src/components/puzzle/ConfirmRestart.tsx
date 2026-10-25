import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { dessert } from "../../theme/palette";

/** 다시 하기 확인 창. 되돌릴 수 없어 한 번 묻습니다. */
export default function ConfirmRestart({ open, detail, onCancel, onConfirm }: { open: boolean; detail: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby="restart-title" slotProps={{ paper: { sx: { width: "min(360px, calc(100% - 32px))", bgcolor: dessert.cream } } }}>
      <DialogTitle id="restart-title" sx={{ fontWeight: 700 }}>처음부터 다시 할까요?</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "text.secondary" }}>{detail}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onCancel} sx={{ color: "text.secondary" }}>
          취소
        </Button>
        <Button variant="contained" onClick={onConfirm}>
          다시 하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
