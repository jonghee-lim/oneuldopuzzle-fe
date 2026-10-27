import IosShareIcon from "@mui/icons-material/IosShare";
import { Box, Button, Dialog, Snackbar, Typography } from "@mui/material";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { streakOf } from "../../puzzle/core/daily";
import { shareText } from "../../puzzle/core/share";
import { APP_URL, copyText, shareResult, type ShareOutcome } from "../../platform/share";
import { usePuzzleStore } from "../../stores/puzzleStore";
import { dessert } from "../../theme/palette";
import { dailyResults } from "./daily";
import { canvasToFile, drawShareCard } from "./shareCard";

const OUTCOME: Record<ShareOutcome, string | null> = {
  shared: null,
  cancelled: null,
  copied: "결과 글을 복사했어요. 카톡 대화방에 붙여 넣어 보세요.",
  failed: "이 기기에서는 공유할 수 없어요.",
};

/** '결과 공유하기' 버튼과 결과 카드 창. 카드에는 답이 보이지 않습니다. */
export default function DailyShare({ variant = "outlined" }: { variant?: "outlined" | "contained" }) {
  const state = usePuzzleStore(
    useShallow((s) => ({ dailyDate: s.dailyDate, dailyDone: s.dailyDone, dailyDays: s.dailyDays, dailySudoku: s.dailySudoku, dailyZone: s.dailyZone, dailyBlocks: s.dailyBlocks, dailySlide: s.dailySlide })),
  );
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<{ url: string; file?: File } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const date = state.dailyDate;
  const results = dailyResults(state);
  const streak = date ? streakOf(state.dailyDays, date) : 0;

  /** 창을 열 때 카드를 그립니다(창이 열려 있는 동안 결과는 바뀌지 않음). */
  const openCard = () => {
    if (!date) return;
    const canvas = drawShareCard(date, results, streak);
    const url = canvas.toDataURL("image/png");
    setPreview({ url });
    setOpen(true);
    void canvasToFile(canvas, `oneuldopuzzle-${date}.png`).then((file) => setPreview((p) => (p?.url === url ? { url, file } : p)));
  };

  if (!date) return null;
  const text = shareText(date, results, streak, APP_URL);
  const finish = (outcome: ShareOutcome) => {
    const note = OUTCOME[outcome];
    if (note) setMessage(note);
    if (outcome === "shared") setOpen(false);
  };

  return (
    <>
      <Button variant={variant} size="large" fullWidth startIcon={<IosShareIcon />} onClick={openCard} sx={{ height: 48 }}>
        결과 공유하기
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="share-title" slotProps={{ paper: { sx: { width: "min(380px, calc(100% - 32px))", p: 2.5, bgcolor: dessert.cream } } }}>
        <Typography id="share-title" component="h2" sx={{ fontSize: 20, fontWeight: 800, textAlign: "center" }}>
          오늘의 결과
        </Typography>
        <Typography sx={{ fontSize: 13, color: dessert.cocoaSoft, textAlign: "center", mt: 0.5 }}>
          답은 보이지 않아요. 같은 판을 푼 사람과 시간을 견줘 보세요.
        </Typography>
        <Box sx={{ mt: 1.5, aspectRatio: "1 / 1", borderRadius: 2, overflow: "hidden", bgcolor: dessert.creamDeep }}>
          {preview && <Box component="img" src={preview.url} alt={text.split("\n").slice(0, -2).join(", ")} sx={{ width: "100%", height: "100%", display: "block" }} />}
        </Box>
        <Button variant="contained" size="large" fullWidth onClick={async () => finish(await shareResult(text, preview?.file))} sx={{ mt: 2, height: 52 }}>
          카톡 등으로 보내기
        </Button>
        <Button fullWidth onClick={async () => finish(await copyText(text))} sx={{ mt: 1, color: "text.secondary" }}>
          결과 글 복사
        </Button>
      </Dialog>
      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage(null)} message={message} anchorOrigin={{ vertical: "top", horizontal: "center" }} sx={{ top: "calc(env(safe-area-inset-top) + 12px)" }} />
    </>
  );
}
